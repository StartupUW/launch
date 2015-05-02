var mongoose = require('mongoose');
	Schema = mongoose.Schema;


var ProjectSchema = new Schema ({
	name: {type: String, required: true},
	website: {type: String, required: true},
	description: {type: String, required: true},
	images: [String],
	votes: [ObjectId],
	date: Date,
	hiring: Boolean,
	contact: [{
		email: {type: String, required: true},,
		phone: {type: String, required: false},
	]},
	type: {type: String, required: true},,
	tags: [String],
	approved: Boolean
});

module.exports = mongoose.model('Projects', ProjectSchema);