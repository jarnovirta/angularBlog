"use strict";

var config = require('./../config');
var redis = require('redis');
var siteStatusService = require('./siteStatusService');
var ws = require('./websocketService');

// Connect to Redis and authenticate

var redisPub = redis.createClient(config.redis);
redisPub.auth(config.redis.pass);
var redisSub = redis.createClient(config.redis);
redisSub.auth(config.redis.pass);

redisSub.subscribe('blog_ws_messages');
redisSub.on('message', function(channel, message) {
	var msg = JSON.parse(message);

	var sendingServerPID = msg.from;

	// Handle request for client count to be shown in admin page.

	if (msg.topic === 'request_client_count') {
		if (!msg.to || msg.to === 'broadcast') {
				var clients = require('./websocketService').getWebsocketClients();
				var serverStatus = {
					server: process.pid,
					clients: clients.length
				};
				var response = {
					topic: msg.topic,
					to: msg.from,
					data: serverStatus
				};
				exports.publish(channel, response);

		}
		else if (parseInt(msg.to) === process.pid) {
				siteStatusService.saveWebServerStatusInfo(msg.data);
		}
	}
	// Broadcast message to websocket clients
	else if (parseInt(sendingServerPID) !== process.pid) {
			ws.broadcast(msg);
		}	
		
});

exports.publish = function(channel, message) {
	message.from = process.pid;
	redisPub.publish(channel, JSON.stringify(message));
};
