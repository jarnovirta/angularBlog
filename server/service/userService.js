"use strict";

var config = require('./../config');
var db = require("./database");
var User = require('./../../app/models/user');
var bcrypt = require('bcrypt');
var seaport = require('seaport').connect(config.seaport.host, config.seaport.port);
var q = require('q');
var request = require('request');
var redis = require('./redisService');

var log = require('./logFunction.js');
var service = 'USER SERVICE';

exports.create = function(newUser) {
	var user = new User({
		username: newUser.username,
		password: bcrypt.hashSync(newUser.password, 10),
		role: newUser.role
	});
	user.save(function(err) {
		if (err) {
			log(service, 'error', err);
			db.connection.close();
		}
		
	});
	
};
exports.findUserByUserName = function(username, callback) {
	User.findOne({ username: username }, function(err, foundUser) {
		if (err) {
			log(service, 'error', err);
			callback(err);
		}
		else {
			callback(null, foundUser);
		}

	});

};
exports.verifyAuthentication = function(decodeToken) {
	var deferred = q.defer();
	var availableServers = seaport.query('load-balancer-proxy');
	
	// Send verification request via proxy to user-auth-service.
	
	if (availableServers) {
		var server = availableServers[0];
		var ip = server.host;
		
		// Strip IPv6 address from ip-address.
		if (server.host[0] === ':') {
			ip = server.host.substring(7, availableServers[0].length);
		}
		var url = 'http://' + ip + ':'+ server.port + '/auth/verifyToken';
		var postData = {
			token: decodeToken
			};
		var options = {
			method: 'post',
			body: postData,
			json: true,
			url: url,
			timeout: 5000
		};
		request(options, function(err, res, body) {
			if (err) {
				log(service, 'error', 'JWT token authentication error: ' + err);
				
			}
			deferred.resolve(body.result);
		});
	}
	else {
		deferred.resolve(false);
	}
	return deferred.promise;
};