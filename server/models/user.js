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
    password: {type: String, reuqired: true},
    superAdmin: {type: Boolean, reuqired: true},
    groups: [{
        name: {type: String, reuqired: true},
    }]
});

module.exports = mongoose.model('User', UserModelSchema);