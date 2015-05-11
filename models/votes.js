var mongoose = require('mongoose');
	Schema = mongoose.Schema;

var VoteSchema = new Schema({
    user: {type: String, ref: 'Users', required: true},
    project: {type: Schema.Types.ObjectId, ref: 'Projects', required: true},
    date: {type: Date, default: Date.now}
})

module.exports = mongoose.model('Votes', VoteSchema);
