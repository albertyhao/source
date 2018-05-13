var mongoose = require('mongoose');

var model = mongoose.model('user', new mongoose.Schema({
	username: {type: String, unique: true}
	, email: {type: String}
	, password: {type: String}
	, favoritespncharacter: {type: String}
	, leastfavoritespncharacter: {type: String}
	, favoratespnvillian: {type: String}
	, salt: {type: String}
	, Avator: {type: String}

}));

exports.getModel = function() {
	return model;
}
