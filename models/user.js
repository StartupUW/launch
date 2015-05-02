var mongoose = require('mongoose');
	Schema = mongoose.Schema;
	bcrypt = require('bcrypt-nodejs');

var UserSchema = new Schema({
	fname: String,
	lname: String,
	email: String,
	bio: String,
	major: String,
	gradyr: Number,
	links: [{
		label: String,
		url: String,
		visible: Boolean
	}],
	username: {type: String, required: true, index: { unique: true }},
	password: { type: String, required: true, select: false }
});

UserSchema.pre('save', function(next) {
	var user = this;
	if(!user.isModified('password')) return next();

	bcrypt.hash(user.password, null, null, function(err, hash) {
		if (err) return next(err);
		user.password = hash;
		next();
	});

});

UserSchema.methods.comparePassword = function(password) {
	var user = this;
	return bcrypt.compareSync(password, user.password);
};

module.exports = mongoose.model('User', UserSchema);