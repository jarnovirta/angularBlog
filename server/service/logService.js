'use strict';

//
// Logger for 4 log levels: debug, web (request tracking), info (app startup and crash etc) and error.
//
// Redis message format: { level: [level], service: [service sending msg], pid [ process id of service], message: [message to log]}
//
var config = require('./../config');
var redis = require('redis');

var winston = require('winston');
var fs = require('fs');

// Set up and clear log files

try {
    fs.mkdirSync('log');
  } catch(e) {
    
  }

var logFiles = {
  info: 'log/info.log',
  error: 'log/error.log',
  debug: 'log/debug.log',
  web: 'log/web.log'
};

Object.keys(logFiles).forEach(function(key) {
    try {
      fs.unlinkSync(logFiles[key]);
    }
    catch (ex) {
      
    }
});

// Set up logging

var logLevels = {
  levels: {
    debug: 3,
    web: 2,
    info: 1,    
    error: 0
  },
  colors: {
    debug: 'blue',
    web: 'pink',
    info: 'green',
    error: 'pink'
  }
};

// Set logger outputs

var loggerTransports = [];
var consoleLogLevel;
if (config.environment.dev) {
    consoleLogLevel = 'debug';
}
else {
  consoleLogLevel = 'error';
}

loggerTransports.push(new (winston.transports.Console)({ level: consoleLogLevel}));

loggerTransports.push(new (winston.transports.File)({ 
      name: 'file#error',
      json: true,
      level: 'error',
      maxsize: 10000000,
      maxFiles: 3,
      filename: logFiles.error
    }));
loggerTransports.push(new (winston.transports.File)({ 
      name: 'file#info',
      json: true,
      level: 'info',
      filename: logFiles.info
    }));
loggerTransports.push(new (winston.transports.File)({ 
      name: 'file#debug',
      json: true,
      level: 'debug',
      maxsize: 10000000,
      maxFiles: 3,
      filename: logFiles.debug
    }));
loggerTransports.push(new (winston.transports.File)({ 
      name: 'file#web',
      json: true,
      level: 'web',
      maxsize: 10000000,
      maxFiles: 3,
      filename: logFiles.web
    }));

var logger = new (winston.Logger)({
  levels: logLevels.levels,
  transports: loggerTransports
});

winston.addColors(logLevels.colors);

logger.on('error', function(err) {
  console.log("LOGGER ERROR: " + err);
});

// Start Redis sub to channel 'log'

var redisSub = redis.createClient(config.redis);
redisSub.auth(config.redis.pass);

redisSub.subscribe('log');

redisSub.on('message', function(channel, jsonEntry) {
  var parsedEntry = JSON.parse(jsonEntry);
  var logEntry = parsedEntry.service + " " + parsedEntry.pid + ": " + parsedEntry.message;
  logger.log(parsedEntry.level, logEntry);

});
