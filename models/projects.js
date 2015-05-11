var mongoose = require('mongoose');
	Schema = mongoose.Schema;
var Users = require('./users')

var ProjectSchema = new Schema ({
	name: {type: String, required: true},
	website: {type: String, required: true},
	description: {type: String, required: true},
	images: [String],
	votes: [{
        uid: {type:String, required: true},
        name: {type: String, required: true},
        date: {type: Date, default: Date.now}
    }],
	date: {type: Date, default: Date.now },
	hiring: {type: Boolean, default: false },
	contact: [{
		email: {type: String, required: true},
		phone: {type: String, required: false}
	}],
	type: {type: String, required: true},
	tags: [String],
	approved: { type: Boolean, default: false}
});

module.exports = mongoose.model('Projects', ProjectSchema);
