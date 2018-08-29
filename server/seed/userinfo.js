/**run this file manual inject info into mongo */

const User = require('../models/user');

const mongoose = require('mongoose');
const localDB = 'mongodb://localhost:27017/project1';
mongoose.connect(localDB);

const users = [
    new User({
        _id: "5b85da8962877b6963c3b30f",
        username: "admin",
        email: "admin@123.com",
        channels: [],
        groups: []
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