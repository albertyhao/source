var mongoose = require('mongoose');

var model = mongoose.model('user', new mongoose.Schema({
	Username: {type: String, unique: true}
	, email: {type: String, unique: true}
	, password: {type: String}
	, favoritespncharacter: {type: String}
	, leastfavoritespncharacter: {type: String}
	, favoratespnvillian: {type: String}
}));

exports.getModel = function() {
	return model;
}
