'use strict';

/**
 * @ngdoc service
 * @name jvdotcomApp.Post
 * @description
 * # Post
 * Service in the jvdotcomApp.
 */
angular.module('jvdotcomApp')
  .service('User', ['$http', '$q', 'jwtHelper', function ($http, $q, jwtHelper) {
    this.login = function (user, callback) {
  		var self = this;
      console.log("Logging in " + user.username + user.password);
  		$http.post('/auth/session', JSON.stringify(user))
  		.success(function (response) {
  			localStorage['jvBlogJWTToken'] = response;
  			callback(jwtHelper.decodeToken(response));
  		});
  	};

  // Returns loggedin user if login has not expired.
  this.getUser = function() {
    if (!localStorage['jvBlogJWTToken'] || jwtHelper.isTokenExpired(localStorage['jvBlogJWTToken'])) {
      return null
    }
    else {
      return jwtHelper.decodeToken(localStorage['jvBlogJWTToken']);
    }
  };

  this.logout = function() {
    localStorage.removeItem('jvBlogJWTToken');
    
  }

  this.getAuthToken = function() {
    return localStorage['jvBlogJWTToken'];
  }

}]);