"use strict";

var ws = require('ws');
var postService = require('./blogPostService');
var userService = require('./userService');
var siteStatusService = require('./siteStatusService');
var _ = require('lodash');
var redisService = require('./redisService');
var clients = [];

var log = require('./logFunction.js');
var service = 'WEB SOCKET SERVICE';

//  Broadcast message to server's websocket clients and publish to other server instances via Redis 
var publishAndBroadcastMessage = function(message, excludeWSClient) {
	exports.broadcast(message, excludeWSClient);
	
	redisService.publish('blog_ws_messages', message);
};
var websocketErrorHandler = function(err) {
	if (err) {
		log(service, 'error', err);
		
	}
};
exports.connect = function (server) {
	var wss = new ws.Server({ server: server });
	wss.on('connection', function (ws) {
		clients.push(ws);
		log(service, 'web', 'New websocket connection from: ' + ws.upgradeReq.connection.remoteAddress);
		ws.on('close', function() {
			_.remove(clients, ws);
			log(service, 'web', 'Closing websocket, ' + clients.length + ' connections left.');
		});
		ws.on('message', function (mes) {
			var message = JSON.parse(mes);
			log(service, 'web', 'Websocket message received. Topic: ' + message.topic);
			
			switch (message.topic) {
				case 'new_post':
					userService.verifyAuthentication(message.authToken).then(function(isAuthenticated) {					
							if (isAuthenticated) {
								postService.create(message.data, function (createdPost) {
								log(service, 'web', 'Replying to request.');
								
								var response = {
									'topic': message.topic,
									'data': createdPost,
									'serverPID': process.pid,
									'callbackId': message.callbackId
								};

								ws.send(JSON.stringify(response), websocketErrorHandler);
								
								response.callbackId = -1;
								publishAndBroadcastMessage(response, ws);
								});
							}
							else {
								var response = {
									topic: "auth_fail",
									data: null,
									serverPID: process.pid,
									callbackId: message.callbackId
								};
								log(service, 'web', 'Replying to websocket request.');
								ws.send(JSON.stringify(response), websocketErrorHandler);
							}
					});

					break;
				case 'find_posts':
					var requestedNumberOfPosts;
							var olderThanPostId;
							if (message.data.olderThanPostId) {
								olderThanPostId = message.data.olderThanPostId;
							}
							if (message.data.requestedNumberOfPosts) {
								requestedNumberOfPosts = message.data.requestedNumberOfPosts;
							}
							else {
								requestedNumberOfPosts = 5;
							}
					postService.findPosts(
							requestedNumberOfPosts,
							function (posts) {
								var response = {
									topic: message.topic,
									data: posts,
									serverPID: process.pid,
									callbackId: message.callbackId
								};
								
								log(service, 'web', 'Replying to websocket request.');
								ws.send(JSON.stringify(response), websocketErrorHandler);
							}, olderThanPostId
						);
					break;
				case 'find_post_by_id':
					postService.findPostById(message.data, function(foundPost) {
						var response = {
							topic: message.topic,
							data: foundPost,
							serverPID: process.pid,
							callbackId: message.callbackId
						};

						log(service, 'web', 'Replying to websocket request.');
						ws.send(JSON.stringify(response), websocketErrorHandler);
					});
					break;
				case 'delete_post':
					userService.verifyAuthentication(message.authToken).then(function(isAuthenticated) {					
							if (isAuthenticated) {
								postService.delete(message.data, function () {
									log(service, 'web', 'Replying to request.');
									
									var response = {
										topic: message.topic,
										data: message.data,
										serverPID: process.pid,
										callbackId: message.callbackId
									};

									ws.send(JSON.stringify(response));
									response.callbackId = -1;
									publishAndBroadcastMessage(response);
								});
							}
							else {
								var response = {
									topic: "auth_fail",
									data: null,
									serverPID: process.pid,
									callbackId: message.callbackId
								};
								log(service, 'web', 'Replying to websocket request with auth_fail.');
								ws.send(JSON.stringify(response), websocketErrorHandler);
							}
					});
					break;
				case 'update_post':

					userService.verifyAuthentication(message.authToken).then(function(isAuthenticated) {					
							if (isAuthenticated) {
								postService.save(message.data, function (editedPost) {
									log(service, 'web', 'Replying to request.');
									var response = {
										topic: message.topic,
										data: editedPost,
										serverPID: process.pid,
										callbackId: message.callbackId
									};

									ws.send(JSON.stringify(response), websocketErrorHandler);
									response.callbackId = -1;
									publishAndBroadcastMessage(response, ws);
								});
							}
							else {
								var response = {
									topic: "auth_fail",
									data: null,
									serverPID: process.pid,
									callbackId: message.callbackId
								};
								log(service, 'web', 'Replying to websocket request with auth_fail.');
								ws.send(JSON.stringify(response), websocketErrorHandler);
							}
					});
					break;				
				case 'site_status_info':
					userService.verifyAuthentication(message.authToken).then(function(isAuthenticated) {					
							if (isAuthenticated) {
								siteStatusService.getSiteStatusInfo(function(status) {
								var response = {
									topic: message.topic,
									data: status,
									serverPID: process.pid,
									callbackId: message.callbackId
								};
									ws.send(JSON.stringify(response), websocketErrorHandler);
								});
							}
							else {
								var response = {
									topic: "auth_fail",
									data: null,
									serverPID: process.pid,
									callbackId: message.callbackId
								};
								log(service, 'web', 'Replying to websocket request with auth_fail.');
								ws.send(JSON.stringify(response), websocketErrorHandler);
							}
					});
				break;
			}
			
		});
		
	});

};

// Broadcast to clients
exports.broadcast = function (message, excludeWSClient) {
	clients.forEach(function (client) {
		if (client !== excludeWSClient) {
			 client.send(JSON.stringify(message));
			}
	});


};

exports.getWebsocketClients = function() {
	return clients;
};