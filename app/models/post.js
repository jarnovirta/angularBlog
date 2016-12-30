var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
	title: String,
	body: String,
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	date: Date,
	comments: [{
		date: Date,
		body: String,
		userName: String
	}]
});

module.exports = mongoose.model("Post", PostSchema);