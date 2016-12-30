'use strict';

angular.module('jvdotcomApp')
  .controller('MainCtrl', ['$scope', '$rootScope', 'Post', 'User', '$timeout', '$window', 'ImagePreloader',
    '$location', function ($scope, $rootScope, Post, User, $timeout, $window, ImagePreloader, $location) {

    $window.prerenderReady = false;
    $rootScope.loggedInUser = User.getUser();
    ImagePreloader.preloadImages();
    $scope.$on('newPageLoaded', function(event, metadata) {
        $rootScope.pageMeta = metadata;
    }); 
    $rootScope.logout = function() {
		User.logout();
		$rootScope.loggedInUser = null;
        if ($location.path().indexOf('/admin') === 0) {
            $location.path('/');
        }
	}
	$scope.$on('ws:new_post', function (_, post) {
	   	console.log("New post event");

    	$scope.$apply(function () {
    		Post.WebsocketNewPost(post);
    		
    	});
    });
    $scope.$on('ws:delete_post', function (_, deletePostId) {
    	$scope.$apply(function () {
    		Post.WebsocketDeletePost(deletePostId);
    		
    	});
    });
    $scope.$on('ws:update_post', function (_, post) {
    	$scope.$apply(function() {
    		Post.WebsocketUpdatePost(post);
    		
    	});
    });
    
  }]);
