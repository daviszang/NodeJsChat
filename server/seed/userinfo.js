/**run this file manual inject info into mongo */

const User = require('../models/user');

const mongoose = require('mongoose');
const localDB = 'localhost:27017/nodechat';
mongoose.connect(localDB);

const users = [
    new User({
        username: 'admin',
        email: 'admin@123.com',
        password: '1234',
        superAdmin: true,
        groupAdmin: true,
        channels: []
    })
];

let done = 0;

for (let i = 0; i < users.length; i++) {
    users[i].save(function (err, result) {
        done++;
        if (done === users.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}