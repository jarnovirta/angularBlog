"use strict";

var config = require('./../config');
var mongoose = require('mongoose');
var redisService = require('./redisService');
var log = require('./logFunction.js');
var service = 'DATABASE SERVICE';

var database = 'mongodb://' + config.db.host + ':' + config.db.port + '/' + config.db.database;
mongoose.connect(database, function(err) {
	if (err) {
		log(service, 'error', err);
		
	}
	log(service, 'info', 'MongoDB connected, DB host: ' + database);
	
});
var db = mongoose.connection;
db.on('error', function(err) {
	log(service, 'error', err);
});
	
module.exports = mongoose;