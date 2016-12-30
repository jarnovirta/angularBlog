"use strict";

var config = require('./config');
var express = require('express');
var postService = require('./service/blogPostService');
var bodyParser = require('body-parser');
var app = express();
var websockets = require('./service/websocketService');
var seaport = require('seaport').connect(config.seaport);
var compression = require('compression');
var http = require('http');
var log = require('./service/logFunction.js');
var service = 'HTTP SERVER';

// Set http server port to a port provided by startWebServers.js. Port range 3010-3019.
var port = seaport.register('webapp-service', { port: process.env.WEB_SERVER_PORT});

log(service, 'info', 'STARTING WEB SERVER');

app.use(bodyParser.json());

module.exports.startServer = function() {
	app.use(compression());
	app.use(express.static(__dirname + '/../'));
	app.use(bodyParser.json());

	app.get('/posts', function(req, res) {
		res.setHeader('content-type', 'application/json');
		var requestParameters = req.body;
		var requestedNumberOfPosts;
		var olderThanPostId;
		if (requestParameters.olderThanPostId) {
			olderThanPostId = requestParameters.olderThanPostId;
		}
		if (requestParameters.requestedNumberOfPosts) {
			requestedNumberOfPosts = requestParameters.requestedNumberOfPosts;
		}
		else {
			requestedNumberOfPosts = 5;
		}
		postService.findPosts(
			requestedNumberOfPosts,
			function (posts) {
				res.send(posts);
			}, 
			olderThanPostId
		);
	});

	// Handle requests for web pages.
	app.get('/*', function (req, res) {
		res.sendFile('app/index.html' , { root : __dirname + "/../"});		
		/*res.setHeader('content-type', 'text/html');
		// If request is not from a HTML Prerendering Server, but a client,
		// forward the request to a Prerendering Server, which includes in index.html 
		// the dynamic content for the requested page. Subsequent navigating will be through
		// dynamic AngularJS requests.

		if (req.headers['x-html-prerender'] != 'true') {
			req.headers['x-html-prerender'] = 'true';
			req.headers['x-requested-url'] = req.url;
			var options = {
				host: req.connection.remoteAddress,
				port: 80,
				path: '/prerender',
				method: 'GET',
				headers: req.headers
			};

			var htmlPrerenderResponse;
			var callback = function(response) {
			    htmlPrerenderResponse = response;
			    // set encoding
			    htmlPrerenderResponse.setEncoding('utf8');

			    // wait for data
			    htmlPrerenderResponse.on('data', function(htmlResponse){
			      res.write(htmlResponse);
			    });

			    htmlPrerenderResponse.on('close', function() {
			      res.end();
			    });

			    htmlPrerenderResponse.on('end', function() {
			      res.end();
			    });
			  };
			http.request(options, callback).on('error', function(e) {
			    // we got an error, return 500 error to client and log error
			    console.log(e.message);
			    res.writeHead(500);
			    res.end();
			    htmlPrerenderResponse.end();
			  }).end();
		}

		// If request is coming from HTML Prerender Server (PhantomJS), send index.html for rendering
		else {
			
			
		}*/
	});

	var server = app.listen(port, function () {
		log(service, 'info', 'Web server listening on port ' + port + '.' +
				' Connecting to Seaport at ' + config.seaport.host + ', port ' + config.seaport.port);
		
	});
	websockets.connect(server);
};