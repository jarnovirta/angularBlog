"use strict";

//
// START PROXY SERVER WITH: sudo forever proxy.js [proxy port (defaults to 80)] [optional: Seaport server host (defaults to localhost)].
// Proxy drops privileges from root to regular user once it is bound to port 80.

var config = require('./config');
var http = require('http');
var httpProxy = require('http-proxy');
var agent = new http.Agent({ maxSockets: config.maxHttpSockets });
var seaport = require('seaport').connect(config.seaport);
seaport.register('load-balancer-proxy', { port: config.proxy.port});
var redisService = require('./service/redisService');
var log = require('./service/logFunction.js');
var service = 'PROXY SERVER';
var bots = require('./searchBots.js'); 

log(service, 'info', 'STARTING PROXY SERVER');

http.globalAgent.maxSockets = 10240;
var proxy = httpProxy.createProxyServer({
  ws: true,
  xfwd: true, 
  agent: agent    
});

proxy.on('error', function (err, req, res) {
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  log(service, 'error', 'Proxy server error when proxying for user agent: ' + req.headers['user-agent']  + ' from ip: ' + 
    req.connection.remoteAddress + ': ' + err);

  res.end('Something went terribly wrong on our end :(');
});
//
//    PROXY ROUTES:
// 
var routing = [
  {
    path: '/auth',
    service: 'user-auth-service',
    index: 0
  },
  {
    path: '/prerender',
    service: 'html-prerender-server',
    index: 0
  },
  {
    path: '/*',
    service: 'webapp-service',
    index: 0
  }  
];

var logSearchBotVisit = function(req) {
      // Check if request is from a search engine bot and log it. Logging the complete url (to posts)
    // would require the fragment after # to be sent from client

    var requestAgent = req.headers['user-agent'];
    if (requestAgent !== undefined && requestAgent !== null) {
      Object.keys(bots).forEach(function(userAgentString) {
        var index = requestAgent.indexOf(userAgentString);
        if (index > -1) {
          log(service, 'web', '*** SEARCH BOT VISIT: ' + bots[Object.keys(bots)[index]]);
        }
      });
    }  
}
// Return correct route object for the requested path
var getRouteForRequestedUrl = function(path) {
  var route;
  // Check if Seaport has a service corresponding to path.
  routing.some(function(entry) {
    route = entry;
    return (path.indexOf(route.path) === 0);
    
  });

  return route;
};

// Select HTTP server to handle the request
var selectHttpServer = function(req, res) {
  
  var route = getRouteForRequestedUrl(req.url);
  var servers = seaport.query(route.service);
  log(service, 'debug', 'Proxying request. Requested service: ' + route.service);
  log(service, 'debug', 'Found ' + servers.length + ' servers for the request.');

  if (!servers.length) {
    return null;
  }

  // Check if request includes a cookie pointing to html server for sticky proxying.
  var index = -1;
  if (route.service === 'webapp-service' && req.headers && req.headers.cookie && req.headers.cookie.length > 1) {
    var cookies = req.headers.cookie.split('; ');

    for (var i=0; i<cookies.length; i++) {
      if (cookies[i].indexOf('JVBlogWebServer=') === 0) {
        var value = cookies[i].substring(16, cookies[i].length);
        log(service, 'debug', 'Found cookie in request. Cookie points to web server ' + value);
        if (value && value !== '') {
          index = value;
          break;
        }
      }
    }
  }
  // If no cookie was found for sticky proxy session or a server has gone down and the cookie's index points to  
  // a server that is no longer available, select a new server.

  if (index < 0 || index > servers.length) {
      log(service, 'debug', 'Selecting a server from Seaport service');
      index = route.index;
      // Increment index for round robin load balancing between servers for the particular
      // service.
      route.index = (route.index + 1) % servers.length;
  }
  // Store the server index as a sticky session.
  if (res) {
    res.setHeader('Set-Cookie', 'JVBlogWebServer=' + index + '; path=/');
  }
  log(service, 'debug', 'Selected server ' + index);
  return servers[index];
};

// 
// HTTP server callback function: Select a server and send the http request.
//
var serverCallback = function(req, res) {
  log(service, 'web', 'Proxying request from client ip ' + req.connection.remoteAddress);
  
  var selectedServer = selectHttpServer(req, res);

  if (!selectedServer) {
    log(service, 'error', 'No http server available');
    res.writeHead(502, {'Content-Type': 'text/plain' });
    res.end('Bad gateway');
    return;
  }

  if (req.headers['x-html-prerender'] == 'true') {
    var httpServers = seaport.query('webapp-service');
    var route = getRouteForRequestedUrl('/*');
    req.headers['x-http-server-port'] = httpServers[route.index].port;
    route.index = (route.index + 1) % httpServers.length;
  } 

  logSearchBotVisit(req);

  proxy.web(req, res, { target: selectedServer});
  proxy.on('error', function(err) {
    log(service, 'error', 'Proxy error in server callback function: ' + err);
  });
  
};

var server = http.createServer(serverCallback);

// Get the next server and send the upgrade request.

server.on('upgrade', function(req, socket, head) {
  log(service, 'debug', 'Upgrading to Websocket connection');
  var selectedServer = selectHttpServer(req);
  if (!selectedServer) {
    log(service, 'error', 'No selected http server on Websocket upgrade.');
    socket.end();
  }
  else {
    proxy.ws(req, socket, head, { target: selectedServer});
    proxy.on('error', function(err, req, socket) {
      log(service, 'error', 'Proxy error in upgrading to websocket connection: ' + err);
      socket.end();
    });
  }
});

server.listen(config.proxy.port, function(err) {
  if (err) {
    log(service, 'error', 'PROXY ERROR:' + err);
  }
  log(service, 'info', 'PROXY SERVER STARTED ON PORT ' + config.proxy.port);
    
  // Drop root privileges onse the server has been bound to port 80.

  var uid = parseInt(process.env.SUDO_UID);
  if (uid) {
    process.setuid(uid);
    log(service, 'info', 'Proxy server\'s UID is now ' + process.getuid());
  }
});