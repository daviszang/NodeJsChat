const mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var UserModelSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: {type: String, reuqired: true, unique: true},
    email: {
        type: String,
        required: true,
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password: {type: String, required: true},
    superAdmin: {type: Boolean, required: true},
    groupAdmin: {type: Boolean, required: true},
    channels: [{type: mongoose.Schema.Types.ObjectId, ref: 'Channel'}]
});

module.exports = mongoose.model('User', UserModelSchema);