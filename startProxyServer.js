"use strict";

var spawn = require('child_process').exec;
var service = 'PROXY SERVER START SCRIPT';
var redisService = require('./server/service/redisService');

var log = function(service, level, message) {
    var logMessage = {
        level: level,
        service: service,
        pid: process.pid,
        message: message
    };
    redisService.publish('log', logMessage);
};
var startProxyServer = function() {
    var proxy_child = spawn("sudo forever --minUptime 1000 --spinSleepTime 1000 server/proxyServer.js", function(error) {
        if (error) {
        	log(service, 'error', 'PROXY SERVER ERROR: ' + error);
        }
        log(service, 'error', "PROXY SERVER EXITED");
    });
     proxy_child.stderr.on('data', function (data) {
        log(service, 'error', 'PROXY SERVER ERROR: ' + data);
    });
    proxy_child.stdout.on('data', function(data) {
        log(service, 'info', 'PROXY SERVER: ' + data);
    });
    proxy_child.on('close', function(code) {
        log(service, 'error', 'PROXY SERVER EXITED WITH CODE: ' + code);
        startProxyServer();
    });
}

startProxyServer();