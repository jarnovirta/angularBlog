"use strict";

require("./database");
var Post = require('./../../app/models/post');
var redisService = require('./redisService');

var log = require('./logFunction.js');
var service = 'BLOG POST SERVICE';

var createPostModel = function(receivedPost) {
	var newPost = new Post({
		title: receivedPost.title,
		body: receivedPost.body,
		date: receivedPost.date,
		comments: receivedPost.comments
	});
	return newPost;
};

exports.create = function(post, callback) {
		post = createPostModel(post);
		
		Post.create(post, function (err, createdPost) {
			if (err) { 
				log(service, 'error', err);
				return err; 
			}
			callback(createdPost);
		});
	};
exports.findAll = function(callback) {
		Post.find({}).sort('-date').exec(function(error, posts) {
			callback(posts);
		});
};
exports.findPosts = function(requestedNumberOfPosts, callback, olderThanPostId) {
		// Find next batch of posts for infinite scroll
		if (olderThanPostId) {
			Post.findById(olderThanPostId, function(error, olderThanPost) {
				Post.find({ date: {$lt: olderThanPost.date }}).sort('-date').limit(requestedNumberOfPosts).exec(function(error, posts) {
				callback(posts);
				});
			});
		}

		// Find latest posts

		else {
			Post.find({}).sort('-date').limit(requestedNumberOfPosts).exec(function(error, posts) {
			callback(posts);
		});
	}
};
exports.findPostById = function(id, callback) {
	Post.findById(id, function(error, post) {
		if (error) {
				log(service, 'error', error);
				callback(null);
			}
			callback(post);
		});

};
exports.delete = function(deletePostId, callback) {
		Post.find({ _id: deletePostId }).remove().exec();
		callback();
		
};
exports.save = function(editedPost, callback) {
		Post.findById(editedPost._id, function (err, dbPost) {
			dbPost.update(editedPost).exec(function () {
				Post.findById(editedPost._id, function (err, updatedPost) {
				callback(updatedPost);
			});
			});
			
		});
};