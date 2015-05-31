var mongoose = require('mongoose');
	Schema = mongoose.Schema;

var ProjectSchema = new Schema ({
	name: {type: String, required: true},
	description: {type: String, required: true},
	website: {type: String},
	images: [String],
    date: {type: Date, default: Date.now},
	hiring: {type: Boolean, default: false},
	type: {type: String, required: true},
	tags: [String],
	approved: { type: Boolean, default: false},
    fbPage: {type: String},
    members: [{
        user: {type: String, ref: 'Users'},
    }],
});

module.exports = mongoose.model('Projects', ProjectSchema);
