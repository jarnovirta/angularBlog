var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
	username: { type: String, unique: true, required : true, dropDups : true },
	role: { type: String, required : true },
	password: { type: String, required : true }
});

module.exports = mongoose.model("User", UserSchema);
