'use strict';

angular.module('jvdotcomApp')
  .service('Websocket', ['$rootScope', '$window', '$timeout', '$q', 'User', function ($rootScope, $window, $timeout, $q, User) {
    var callbacks = {};
    var queuedRequests = [];
    var connection = {};
    var currentCallbackId = 0;

    this.send = function (topic, data, cacheRequestOnWebsocketFail) {

      console.log("Websocket sending message with topic: " + topic);
      var defer = $q.defer();
      var request = { topic: topic, data: data, authToken: User.getAuthToken() };
      var callbackId = getCallbackId();

      request.callbackId = callbackId;
      
      callbacks[callbackId] = {
        time: new Date(),
        cb: defer
      };
      request.callback_id = callbackId;
      if (connection.readyState === 1) { 
          connection.send(JSON.stringify(request));
        }
      else if (cacheRequestOnWebsocketFail) {
        console.log("Queueing: " + cacheRequestOnWebsocketFail);
        queuedRequests.push(request);
      }
      else {
        defer.resolve(null);
      }
      return defer.promise;

  };

  var getCallbackId = function() {
      currentCallbackId += 1;
      if(currentCallbackId > 10000) {
          currentCallbackId = 0;
      }
        return currentCallbackId;
  };

	function WebsocketHost() {
		if ($window.location.protocol === "https:") {
			return "wss://" + window.location.host;
		}
		else {
			return "ws://" + window.location.host;
		}
	}
  var self = this;
	this.connect = function() {
      console.log("Creating websocket connection...");
      connection = new WebSocket(WebsocketHost());
      connection.onmessage = function (e) {
  			var payload = JSON.parse(e.data);
  			$rootScope.$broadcast('ws:' + payload.topic, payload.data);
  		};
      connection.onopen = function() {
      console.log("Websocket connected. \nSending " + queuedRequests.length + " queued requests.");
      queuedRequests.forEach(function(request) {
        _.remove(queuedRequests, request);
        connection.send(JSON.stringify(request));
        
      });

		};
  		connection.onclose = function () {
			console.log("Websocket closed. Reconnecting...");
			
      $timeout(self.connect, 10*1000);

		};
		connection.onmessage = function (e) {
  		  
        var response = JSON.parse(e.data);
       
        if (response.callbackId === -1) {
       
          $rootScope.$broadcast('ws:' + response.topic, response.data);
        }
        else {

          // TODO: HANDLE AUTH_FAIL WITH CALLBACKS!!!!!
          //
          if (response.topic === "auth_fail") {
            console.log("AUTH_FAIL");
          }
          else {
            callbacks[response.callbackId].cb.resolve(response.data);
          }
          delete callbacks[response.callbackId];
          
        }
      };
  };
}]).run(['Websocket', function (Websocket) {
	Websocket.connect();
}]);