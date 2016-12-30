'use strict';

angular.module('jvdotcomApp')
  .controller('BlogPostCtrl', ['$scope', '$rootScope','$routeParams', 'Post', '$modal', '$location', 'Sound', 'User',
       '$filter', '$interval', '$window', '$timeout',
       function ($scope, $rootScope, $routeParams, Post, $modal, $location, Sound, User, $filter, $interval, $window, $timeout) {
  	 
     $rootScope.pageSubtitle = '';
      $scope.post = {};
     
      // Page information to be shown in page header and browser tab title
      $scope.$emit('newPageLoaded', {
        'headerBackgroundImage': 'app/images/post-bg.jpg',
        'currentUrl': 'www.codegizmos.com' + $location.path()
      });

      Post.findById($routeParams.id).then(function (post) {
        $scope.post = post;

        // Tell Prerender/PhantomJS that the page is ready (this is for SEO)
        
        $window.prerenderReady = true;

        // Strip HTML tags from page description text
        var getPageDescription = function(text) {
          
          var strippedText = text.replace(/&amp;/g, '');
          strippedText = strippedText.replace(/&nbsp;/g, ' ');
          strippedText = strippedText.replace(/nbsp;/g, ' ');
          
          strippedText = strippedText.replace(/<\/?[^>]+(>|$)/g, " ");
          
          strippedText = strippedText.replace(/ +(?= )/g,'');
          if (strippedText[0] === ' ') {
            strippedText = strippedText.substring(1, strippedText.length);
          }
         
          return strippedText.substring(0, 155);
        }
        // Page information to be shown in page header and browser tab title
        $scope.$emit('newPageLoaded', {
            'headerBackgroundImage': 'app/images/post-bg.jpg',
            'currentUrl': 'www.codegizmos.com' + $location.path(),
            'title': post.title,
            'description': getPageDescription(post.body),
            'blogPostDate': 'Posted on ' + $filter('date')(post.date, "d MMMM yyyy") + ' at ' + 
              $filter('date')(post.date, "H:mm")
        });

      });
      $scope.comment = {user: {}};

      var editPostModal = $modal({
        	scope: $scope,
        	template: 'app/views/templates/post/editPostModal.html',
        	show: false
        });

        var deletePostModal = $modal({
        	scope: $scope,
        	template: 'app/views/templates/post/deletePostModal.html',
        	show: false
        });

        var commentModal = $modal({
          scope: $scope,
          template: 'app/views/templates/post/commentModal.html',
          show: false
        });

        var deleteCommentModal = $modal({
          scope: $scope,
          template: 'app/views/templates/post/deleteCommentModal.html',
          show: false
        });

  		$scope.showEditModal = function() {
  			$scope.editPost = {};
  			$scope.editPost.title = $scope.post.title;
  			$scope.editPost.body = $scope.post.body;
  			$scope.editPost._id = $scope.post._id;
        $scope.editPost.comments = $scope.post.comments;
        $scope.editPost.user = $scope.post.user;
        $scope.editPost.date = $scope.post.date;

  			editPostModal.$promise.then(editPostModal.show);
  		};
  		$scope.savePost = function() {
  			       
        $scope.post.title = $scope.editPost.title;
        $scope.post.body = $scope.editPost.body;
        $scope.post.comments = $scope.editPost.comments;
        
  			Post.save($scope.post);
  			
     		editPostModal.hide();
  		};
  		$scope.cancelEdit = function() {
  		
  			editPostModal.hide();
  		};

  		$scope.showDeleteModal = function() {
  			deletePostModal.$promise.then(deletePostModal.show);
  		};

  		$scope.deletePost = function() {
  			Post.remove($scope.post);
  			deletePostModal.hide();
  			$location.path('/home');
  		};

      $scope.addComment = function() {
        commentModal.$promise.then(commentModal.show);
      };

      $scope.showCommentModal = function(commentToEdit) {
        $scope.comment = commentToEdit;
        $scope.oldComment = commentToEdit;
        
        commentModal.$promise.then(commentModal.show);
      };
      $scope.saveComment = function() {
        if (!$scope.post.comments) {
          $scope.post.comments = [];
        }
        // Add a new comment
        if (!$scope.oldComment) {
          $scope.comment.date = new Date();
          $scope.post.comments.unshift($scope.comment);

        }

        // Edit old comment
        else {
          var commentToEdit = _.find($scope.post.comments, function(arrayComment) {
                return arrayComment._id === $scope.comment._id;
          
          });
          $scope.post.comments[$scope.post.comments.indexOf(commentToEdit)] = $scope.comment;

        }
        
        Post.save($scope.post);
        
        $scope.oldComment = null;
        $scope.comment = {user: {}};
        commentModal.hide();

      };

      $scope.showDeleteCommentModal = function(commentToDelete) {
        $scope.commentToDelete = commentToDelete;
        deleteCommentModal.$promise.then(deleteCommentModal.show);
      };

      $scope.deleteComment = function() {
        _.remove($scope.post.comments, function(commentForPost) {
         return commentForPost === $scope.commentToDelete;
        });

        Post.save($scope.post);
        deleteCommentModal.hide();
      };
      $scope.$on('ws:update_post', function (_, updatedPost) {
        
        if (updatedPost._id === $scope.post._id) {
            $scope.post = updatedPost;
            $scope.$apply();
            Sound.alert();
          }

      });


    }]);