"use strict";

// Service gathers info on servers for site admin page.

var config = require('./../config');
var seaport = require('seaport').connect(config.seaport.host, config.seaport.port);
var redisService = require('./redisService');
var getIP = require('external-ip')();
var externalIp;
var webServersStatus;

var log = require('./logFunction.js');
var service = 'SITE STATUS SERVICE';

getIP(function (err, ip) {
    if (err) {
        log(service, 'error', err);
    }
    externalIp = ip;
});

var callbackList = [];
var busy = false;

var stripIPv6 = function(address) {
	if (address[0] === ':' || address === '127.0.0.1') {
	return externalIp;
	}
	return address;
};

var sendServerStatusInfo = function(statusInfo) {
	callbackList.forEach(function(cb) {
		cb(statusInfo);
		callbackList.splice(callbackList.indexOf(cb), 1);
		
	});
	busy = false;
};

exports.getSiteStatusInfo = function(callback) {
	
	callbackList.push(callback);
	// Send new request to servers for site status information, if not already waiting for response.
	if (!busy) {
		busy = true;
		webServersStatus = {};
		var statusInfo = {};
		var redisRequest = {
			topic: 'request_client_count',
			to: 'broadcast'
		};
		
		// Get server information from Seaport
		var webServers = seaport.query('webapp-service');
		var userAuthServers = seaport.query('user-auth-service');
		var proxyServer = seaport.query('load-balancer-proxy');


		if (proxyServer) {
			proxyServer = proxyServer[0];
			proxyServer.host = stripIPv6(proxyServer.host);
		}

		if (webServers) {
			webServers.forEach(function(webServer) {
				webServer.host = stripIPv6(webServer.host);
			});
		}

		if (userAuthServers) {
			userAuthServers.forEach(function(authServer) {
				authServer.host = stripIPv6(authServer.host);
			});
		}

		redisService.publish('blog_ws_messages', redisRequest);
		
		var startTime = new Date().getTime();
		var timer = setInterval(function() {
			var readyServers = Object.keys(webServersStatus);
			var totalClientCount = 0;

			// Wait 3 seconds for status info from all web servers.

			if ((readyServers.length === webServers.length) || (new Date().getTime() - startTime > 3000)) {
				clearInterval(timer);
				readyServers.forEach(function(serverInfo) {
					totalClientCount += webServersStatus[serverInfo];
				});

				statusInfo.connectedWebClientsCount = totalClientCount;
				statusInfo.webServers = webServers;
				statusInfo.userAuthServers = userAuthServers;
				statusInfo.proxyServer = proxyServer;

				sendServerStatusInfo(statusInfo);
			}
		}, 300);
	}
};
exports.saveWebServerStatusInfo = function(status) {
	webServersStatus[status.server] = status.clients;
};