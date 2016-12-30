'use strict';

var redisService = require('./redisService');

var log = function(service, level, message) {
    var logMessage = {
        level: level,
        service: service,
        pid: process.pid,
        message: message
    };
    redisService.publish('log', logMessage);
};
module.exports = log;