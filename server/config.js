'use strict';

var config = {
	seaport: {
		host: 'localhost',
		port: 9090
	},
	redis: {
		host: 'localhost',
		port: 6379,
		pass: 'jarnosCodingBlogVeryCleaverPass2016'
	},
	proxy: {
		host: 'localhost',
		port: 80
	},
	maxHttpSockets: Number.MAX_VALUE,
	db: {
		host: 'localhost',
		port: 27017,
		database: 'jvdotcom'
	},
	htmlPrerender: {
		host: 'localhost',
		port: 3030
	},
	environment: {
		dev: false
	}
};
module.exports = config;