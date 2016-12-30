var mongoose = require('mongoose');

var KeySchema = new mongoose.Schema({
	key: String,
	
});

module.exports = mongoose.model("Key", KeySchema);