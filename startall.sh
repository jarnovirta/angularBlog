#!/bin/bash

clear
echo 'Starting all servers and services...'
node startSupportServers.js & sudo forever --minUptime 1000 --spinSleepTime 1000 startProxyServer.js \
 	& forever --minUptime 1000 --spinSleepTime 1000 startWebServers.js 