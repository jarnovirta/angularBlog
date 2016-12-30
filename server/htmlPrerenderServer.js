'use strict';

// PHANTOMJS code for HTML prerender service rendering pages for search engines

var config = require('./config');
var webpage = require('webpage');
var system = require('system');
var args = system.args;
var server = require('webserver').create();
var response; 
var renderingStartTime;
var page;

var port = args[1];

/*
setTimeout(function() {
    phantom.exit(1);
}, 4000);
*/

// Set x-html-prerender header to tell HTML server to send index.html 
// file instead of forwarding the request.

var getPage = function() {
    page = webpage.create();
    page.customHeaders = {
      'x-html-prerender': 'true'
    };
    return page;
};
page = getPage();

page.onConsoleMessage = function(msg) {
    console.log('HTML PRERENDER SERVER: PhantomJS web page console: ' + msg);
};

// Stop css and images from being loaded.

page.onResourceRequested = function(requestData, request) {
    if ((/http:\/\/.+?\.(css|gif|jpg|jpeg|tiff|png)$/i).test(requestData['url'])) {
        request.abort();
    }   
};

phantom.onError = function(err) {
    console.log("HTML PRERENDER SERVER: HTTP PRERENDER SERVER ERROR: " + err);
};

var onPageReady = function() {
    response.statusCode = 200;
    response.headers = {
        'Cache': 'no-cache',
        'Content-Type': 'text/html;charset=utf-8'
    };
    response.write(page.content);
    response.close();
    page.close(); // Open a new page instance or websocket connection persists.
    page = getPage();
};
var checkReadyState = function() {
    setTimeout(function() {
        var pageReady = page.evaluate(function() {
            return window.prerenderReady;
        });
        if (pageReady) {
            onPageReady();
        }
        else if (new Date().getTime() - renderingStartTime < 10000) {
            checkReadyState();
        }     
        
        // Prerenderer timed out without finalizing page. Send page as it is.
        else {
            onPageReady();
        }                   
    });
};

server.listen(port, function (req, res) {
    response = res;
    // Connect to html server on localhost on port included by proxy server in x-http-server-port header.
    var url = 'http://localhost:' + req.headers['x-http-server-port'] + req.headers['x-requested-url'];
    
    // Connect to webserver on localhost. Assumes a server is running on port 3010.
    page.open(url, function (status) {
        if (status !== 'success') {
            response.statusCode = 500;
            response.write("Internal Server Error");
            response.close();
            page.close(); // Open a new page instance or websocket connection persists.
            page = getPage();
        } else {
            
            // Wait for content to load and AngularJS controllers 
            // to change prerenderReady to 'true'. Wait max 10 secs.
            renderingStartTime = new Date().getTime();
            checkReadyState();                 
        }
    });
});