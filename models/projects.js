var mongoose = require('mongoose');
	Schema = mongoose.Schema;


var ProjectSchema = new Schema ({
	name: {type: String, required: true},
	website: {type: String, required: true},
	description: {type: String, required: true},
	images: [String],
	votes: [{type: Schema.Types.ObjectId, ref: 'Users'}],
	date: {type: Date, default: Date.now },
	hiring: {type: Boolean, default: false },
	contact: [{
		email: {type: String, required: true},,
		phone: {type: String, required: false},
	]},
	type: {type: String, required: true},
	tags: [String],
	approved: { type: Boolean, default: false}
});

module.exports = mongoose.model('Projects', ProjectSchema);