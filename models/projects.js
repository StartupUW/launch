var mongoose = require('mongoose');
	Schema = mongoose.Schema;

var TimelineEventSchema = new Schema({
	date: {type: Date, required: true},
	title: {type: String, required: true},
	description: {type: String, required: true},
})

var ProjectSchema = new Schema({
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
    demo: {type: String},
    members: [{
        user: {type: String, ref: 'Users'},
    }],
    timeline: [TimelineEventSchema],
});

module.exports = mongoose.model('Projects', ProjectSchema);
