'use strict';

angular.module('jvdotcomApp')
  .service('Post', ['$http', '$q', 'Websocket', 'Sound', function ($http, $q, Websocket, Sound) {
        var Model = { posts: []};
        var morePostsOnServer = true;

        this.getPosts = function() {
            return Model.posts;
        };
        this.isMorePostsOnServer = function() {
            return morePostsOnServer;
        };
        this.loadMorePosts = function() {
            var defer = $q.defer();
            var topic = "find_posts";
            var requestData = {};

            if (!morePostsOnServer) {
                defer.resolve(null);
            }
            else {
                if (Model.posts && Model.posts.length > 0) {
                    requestData.olderThanPostId = Model.posts[Model.posts.length - 1]._id;
                }
                
                $http({
                    url: 'http://' + window.location.host + '/posts',
                    params: requestData
                }
                ).then(function (response) {
                    var loadedPosts = response.data;
                    if (loadedPosts) {
                        if (loadedPosts.length < 5) {
                            morePostsOnServer = false;
                        }
                   
                        if (Model.posts) {
                            loadedPosts.forEach(function(post) {
                                Model.posts.push(post);
                            });
                            
                        }
                        else {
                            var posts = [];
                            loadedPosts.forEach(function(post) {
                                posts.push(post);
                            });
                            Model.posts = posts;
                        }
                    defer.resolve(loadedPosts);
                }
                else {
                    morePostsOnServer = false;
                }
                });
            }
            return defer.promise;
        };
        this.findById = function(postId) {
            var deferredRequest = $q.defer();
            if (Model.posts && Model.posts.length > 0) {
                deferredRequest.resolve(_.find(Model.posts, function(post) {
        		      return post._id === postId;
        	       }));
                }
            else {
                Websocket.send('find_post_by_id', postId).then(function(response) {
                    deferredRequest.resolve(response);
                });
            }
            return deferredRequest.promise;
        };
        this.query = function() {
        	var defer = $q.defer();
            if (Model.posts) {
                defer.resolve(Model.posts);
                }
                else {
                        var topic = 'find_posts';
                        Websocket.send(topic).then(function (posts) {
                            Model.posts = posts;

                            defer.resolve(posts);

                        });
                }
            
           return defer.promise;
        };

        this.create = function(post) {
            Websocket.send("new_post", post).then(function (createdPost) {
                if (Model.posts) {
                    Model.posts.unshift(createdPost);
                }
                else {
                    Model.posts = [createdPost];
                    }
                
            });
        };

        this.save = function(post) {
          Websocket.send('update_post', post).then(function (updatedPost) {
                
                var oldPost = _.find(Model.posts, function (oldPost) {
                        return oldPost._id === updatedPost._id;
                    });
                    if (!oldPost && Model.posts) { 
                        Model.posts.unshift(updatedPost);
                    }
                    
            });
        };
    
        this.remove = function(postToRemove) {
           Websocket.send('delete_post', postToRemove._id).then(function () {
                _.remove(Model.posts, function(post) {
                    return post._id === postToRemove._id;
                });
            });
                    	
        };
        this.WebsocketNewPost = function(postToAdd) {
            if (Model.posts) {
                var oldPost = _.find(Model.posts, function (oldPost) {
                    return oldPost._id === postToAdd._id;
                });
                if (!oldPost) {
                    Model.posts.unshift(postToAdd);
                    Sound.alert();
                }
            }
        };           
        this.WebsocketDeletePost = function(postIdToDelete) {
            _.remove(Model.posts, function(post) {
                return post._id === postIdToDelete;
            });
            
        };
        this.WebsocketUpdatePost = function(updatePost) {
            var postToUpdate = _.find(Model.posts, function(post) {
                            return post._id === updatePost._id;
                       });
            if (Model.posts) {
                Model.posts[Model.posts.indexOf(postToUpdate)] = updatePost;

            }
        };
}]);