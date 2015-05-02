var mongoose = require('mongoose');
	Schema = mongoose.Schema;

var UserSchema = new Schema({
	fname:  {type: String, required: true },
	lname: {type: String, required: true},
	email: {type: String, required: true},
	bio: {type: String, required: true},
	major: {type: String, required: true},
	gradyr: {type: String, required: true},
	link: [{
		label: {type: String, required: true},
		url: {type: String, required: true},
		visible: {type: Boolean, required: true}
	}]
});

module.exports = mongoose.model('Users', UserSchema);