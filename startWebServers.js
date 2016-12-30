"use strict";

// START A WEB SERVER INSTANCE FOR EACH CPU CORE. START WITH COMMAND: forever startWebServers.js

var cluster = require('cluster');
var os = require('os');
var redisService = require('./server/service/redisService');

var log = require('./server/service/logFunction.js');
var service = 'WEB SERVERS STARTUP SCRIPT';

// Spawn web servers for each core to ports starting at 3010
var webServerPort = 3010;

var startNewWorker = function() {
	var workerEnv = { 
        WEB_SERVER_PORT: webServerPort
        };
	var worker = cluster.fork(workerEnv);
	if (++webServerPort === 3020) webServerPort = 3010;
	return worker;
}

if (cluster.isMaster) {
    console.log("\n*** STARTING WEB SERVERS ***");
    log(service, 'info', '*** STARTING WEB SERVERS ***');
	log(service, 'info', 'Blog App web servers master cluster pid ' + process.pid);
	
    var cpus = os.cpus().length;
	for (var i = 0; i < cpus; i++) {
		startNewWorker();
	}
	// Replace crashed worker
	cluster.on('exit', function(worker, code) {
		if (code != 0 && !worker.suicide) {
			log(service, 'error', 'Web server worker crashed! Starting a new worker');
			startNewWorker();
		}
	});
	log(service, 'info' + '*** STARTING ' + cpus + ' WEB SERVER CLONES ***');

	// Zero downtime reload: 
	// Using the SIGUSR2 signal to listen for reload requests
    // you could, instead, use file watcher logic, or anything else
    process.on("SIGUSR2", function() {
        var workers = Object.keys(cluster.workers);

        log(service, 'info', '*** SIGUSR2 received, reloading ' + (workers.length) + ' Web server workers ***');

        // delete the cached module, so we can reload the app
        delete require.cache[require.resolve("./server/httpServer")];
        // only reload one worker at a time
        // otherwise, we'll have a time when no request handlers are running
        var i = 0;
        
        var f = function() {
            if (i == workers.length) return; 
            log(service, 'info', 'Killing HTML server worker ' + (i + 1));
            cluster.workers[workers[i]].disconnect();
            cluster.workers[workers[i]].on("disconnect", function() {
            	cluster.workers[workers[i]].kill();
                log(service, 'info', 'Worker shutdown complete');
            });
            var newWorker = startNewWorker();
            newWorker.on("listening", function() {
                log(service, 'info', 'Replacement worker online.');
                i++;
                f();
            });
        }
        f();
       
    });
    console.log("\nWEB SERVERS STARTED!");
    log(service, 'info', 'WEB SERVERS STARTED!');
}

// Else start web server instance on defined port
else {
	require('./server/httpServer').startServer();
}

