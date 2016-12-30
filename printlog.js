'use strict';

var fs = require('fs');
var chalk = require('chalk');
var logData = fs.readFileSync(process.argv[2], 'utf8');
var lines = logData.split('\n');

var lineCount = 0;
lines.forEach(function(line) {
		if (line.length > 0) {
			try {
				var entry = JSON.parse(line);
			}
			catch (e) {
				console.log("JSON parse error: " + e);
			}
			var color = 'gray';

			var entryString = entry['timestamp'] + " " + entry['level'] + ": " + entry['message'];
			switch(entry['level']) {
				case 'error':
					console.log(chalk.red(entryString));
					break;
				case 'web':
					console.log(chalk.cyan(entryString));
					break;
				case 'info':
					console.log(chalk.green(entryString));
					break;
				default:
					console.log(chalk.white(entryString));
				
			}

		}	
});
