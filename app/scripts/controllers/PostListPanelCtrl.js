'use strict';


angular.module('jvdotcomApp')
  .controller('PostListPanelCtrl', ['$scope', '$rootScope', '$modal', 'Post', 'User', '$location', '$window',
  	function ($scope, $rootScope, $modal, Post, User, $location, $window) {
		 
  		// Page information to be shown in page header and browser tab title
	    $scope.$emit('newPageLoaded', {
    		'title': 'CodeGizmos.com',
    		'pageSubtitle': 'Coding and Arduino Blog',
    		'headerBackgroundImage': 'app/images/home-bg.jpg',
    		'description': 'Welcome to my coding and Arduino blog!',
	        'currentUrl': 'www.codegizmos.com' + $location.path()
    	});
	    
	    $rootScope.postsLoaded = false;
  		$scope.post = {};
  		$scope.posts = Post.getPosts();
  		$scope.infiniteScrollDisabled = false;
  		var addPostModal = $modal({
	    	scope: $scope,
	    	template: 'app/views/templates/post/blogPostModal.html',
	    	show: false
	    });

	    $scope.showModal = function() {
	    	addPostModal.$promise.then(addPostModal.show);
	    	
	    };

	    $scope.loadMorePosts = function() {
	    	$scope.infiniteScrollDisabled = true;
	    	Post.loadMorePosts().then(function(receivedPosts) {
	    		$scope.posts = Post.getPosts();
	    		// Set postsLoaded to true so that after loading the blogposts list shows a text if 
	    		// there are no posts to show.
	    		
	    		$rootScope.postsLoaded = true;
	    		
	    		// Tell Prerender/PhantomJS that the page is ready (this is for SEO)
        		$window.prerenderReady = true;
        		if (Post.isMorePostsOnServer()) {
	    			
	    			$scope.infiniteScrollDisabled = false;
	    		}
	    		else {
	    			
	    			$scope.infiniteScrollDisabled = true;
	    		}
	    		
	    	});
	    	
	    };

	    $scope.savePost = function() {
			$scope.post.user = {userName: 'add user names'};
	        $scope.post.date = new Date();

	        Post.create($scope.post);
		    addPostModal.hide();
		    $scope.post = {};
	    };
	   if (!$scope.posts || $scope.posts.length === 0) 
		{
				
				$scope.loadMorePosts();
		}
}]);