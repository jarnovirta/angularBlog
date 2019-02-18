# Angular Blog App #

## INSTALLATION: ##

- clone git repository with 'git clone https://www.github.com/jarnovirta/angularBlog.git'.
- for production environment, set server/config.js envirnoment.dev to false.
- run 'npm install' and 'bower install -f' to install dependencies. Correct Angular version is 1.3.20. The server/httpPrerenderServer.js, which uses PhantomJS, will not work with newer Angular versions for some reason.
- install MongoDB and start with 'sudo service mongod start'.
- install Redis and run 'redis-server'
- install Seaport and run 'seaport listen 9090'
- set firewall to allow traffic to ports:
		* 6379 for Redis, 
		* 9090 for Seaport, and
		* 27017 for MongoDB. 
- If you run the app as a distributed services (database + proxy (+ web app server instances) on one host and web app server instances on other hosts), the the remote hosts need to allow traffic to ports 3000-3999.
- install forever by running 'sudo npm install forever -g' and in application root directory run 'sudo npm install forever-monitor'
- start servers with 'sudo forever startServer.js'. This starts a proxy server and one http server instance per available processor. The servers drop their root privileges when the proxy server will have bound itself to port 80. 
- to start additional remote http servers on another host, provide IP adress of the main host (running MongoDB, Seagate and Redis) as argument to the startup command in command line. In this case, only web app server instances are started (one for each core) and they connect to a proxy server and database at the remote IP address.


### Security: ###

- Seaport, Redis and MongoDB ports are open to all IP addresses. Redis is protected by a password to be set in the server/config.js file. Seaport is protected using public/private keys. Generate the keys using, for example rsa-json packeage (npm install rsa-json, then CLI command rsa-json > server/keys/seaportkeys.json). 
- Set user authentication to mongodb: https://docs.mongodb.org/manual/tutorial/enable-authentication/. Save the username and password to the blog app's server/config.js file to 'db' configuration.


## REDIS-SERVER INSTALLATION AS SERVICE ON AWS LINUX AMI: ##

- https://gist.github.com/FUT/7db4608e4b8ee8423f31
- set password by uncommenting "requirepass" and providing a password (set same to /server files that use redis).


## STARTING SERVERS: ##

Web servers: forever startWebServers.js
Proxy server: sudo forever server/proxyServer.js
Support servers (Seaport service, user authentication service, html prerender service (for search engines)):
	forever startSupportServers.js

All servers: ./startall.sh
