"use strict";

var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var Key = require('./../../app/models/key');
var jwt = require('jsonwebtoken');
var redisService = require('./redisService');
var log = require('./logFunction.js');
var service = 'JWT TOKEN SERVICE';

var tokenExpirationSecs = 60 * 60 * 24;
var secretKey;

var newKey = function() {
	return bcrypt.hashSync(Math.random().toString(), salt);
};

var init = function() {
	Key.findOne({}, function(err, key) {
		if (err) {
			log(service, 'error', err);
			
			return;
		}
		if (!key) {
			Key.create({ key: newKey()}, function(err, newKey) {
				if (err) {
					log(service, 'error', err);
					return;
				}
				secretKey = newKey.key;
			});
		}
		else {
			secretKey = key.key;
		}

	});
};
init();
exports.createNewKey = function(callback) {
	var key = newKey();
	Key.remove({});
	Key.create({ key: key}, function(err, newKey) {
		if (err) {
			log(service, 'error', err);
			callback(err);

		}

		else {
			callback(null, newKey);
		}
	});
	
};

exports.createToken = function(user) {
	return jwt.sign({
		username: user.username,
		role: user.role
		}, secretKey, {expiresIn: tokenExpirationSecs});
	
};

exports.verifyToken = function(token, callback) {
	return jwt.verify(token, secretKey, callback);
};
