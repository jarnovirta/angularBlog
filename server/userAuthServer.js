"use strict";

var config = require('./config');
var express = require('express');
var app = express();
var seaport = require('seaport').connect(config.seaport);
var port = seaport.register('user-auth-service');
var jwtService = require('./service/jwtTokenService');
var userService = require('./service/userService');
var bcrypt = require('bcrypt');
var redis = require('./service/redisService');

var log = require('./service/logFunction.js');
var service = 'USER AUTHENTICATION SERVER';

app.use(require('body-parser').json());

log(service, 'info', 'Registering to Seaport on ' + config.seaport.host);

var validateUser = function(username, password, callback) {
	userService.findUserByUserName(username, function(err, foundUser) {
		if (foundUser && foundUser.password && password) {
		if (bcrypt.compareSync(password, foundUser.password)) {
			
			callback(foundUser);
			return;
			}
		}
		log(service, 'error', 'Password comparition failed.');
		callback(null);
	});

};

app.post('/auth/session', function (req, res) {
	validateUser(req.body.username, req.body.password, function(validatedUser) {
		if (validatedUser) {
			var token = jwtService.createToken(validatedUser);
			res.json(token);
		}
		else {
		
			res.writeHead(401, {'Content-Type': 'text/plain' });
	     	res.end('Unauthorized');
		}
	});
	
});
// Verify JWT token provided in req.body.token. Result in 'result' field of response JSON. 
// If successful, decoded token in 'decodedToken' field.

app.post('/auth/verifyToken', function (req, res) {
	jwtService.verifyToken(req.body.token, function(err, decoded) {
		var response;
		if (err || !decoded) {
			log(service, 'error', 'Authentication failed. ' + err);
			response = { result: false };
			
		} 
		else {
		response = { result: true,
			decodedToken: decoded 
			};
		}
		res.json(response);
	});
});

app.listen(port);