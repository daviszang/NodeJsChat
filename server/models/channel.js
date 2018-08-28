const mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var ChannelModelSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    group: {type: mongoose.Schema.Types.ObjectId, ref: 'Group'},
    channelName: {type: String, required: true},
    members: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    conversation: [
        {
            author: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
            time: {type: Date, default: Date.now, required: true},
            content: {type: String, required: true}
        }
    ]
});

module.exports = mongoose.model('Channel', ChannelModelSchema);