const mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var GroupModelSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    groupName: {type: String, required: true},
    channels: [{type: mongoose.Schema.Types.ObjectId, ref: 'Channel'}]
});

module.exports = mongoose.model('Group', GroupModelSchema);