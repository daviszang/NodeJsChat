/**run this file manual inject info into mongo */

const User = require('../models/user');

const mongoose = require('mongoose');
const localDB = 'localhost:27017/nodechat';
mongoose.connect(localDB);

const users = [
    new User({
        username: 'admin',
        email:'admin@123.com',
        password: '1234',
        superAdmin: true,
        group: [
            {
                name: 'Chat Group 0'
            },
            {
                name: 'Chat Group 1'
            },
            {
                name: 'Chat Group 2'
            },
            {
                name: 'Chat Group 3'
            }
        ]
    }),
    new User({
        username: 'track',
        email:'track@123.com',
        password: '1234',
        superAdmin: false,
        group: [
            {
                name: 'Chat Group 0'
            },
            {
                name: 'Chat Group 1'
            },
            {
                name: 'Chat Group 2'
            },
            {
                name: 'Chat Group 3'
            }
        ]
    }),
    new User({
        username: 'apple',
        email:'apple@123.com',
        password: '1234',
        superAdmin: false,
        group: [
            {
                name: 'Chat Group 0'
            },
            {
                name: 'Chat Group 1'
            },
            {
                name: 'Chat Group 2'
            },
            {
                name: 'Chat Group 3'
            }
        ]
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