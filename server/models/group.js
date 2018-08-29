const mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var GroupModelSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    groupName: {type: String, required: true},
    admin: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    members:[{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});

module.exports = mongoose.model('Group', GroupModelSchema);