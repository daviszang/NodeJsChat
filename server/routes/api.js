const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require('../models/user');
const Group = require('../models/group');
const Channel = require('../models/channel');

const localDB = 'localhost:27017/nodechat';
mongoose.connect(localDB);
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
let db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


/** GET API heath check */
router.get('/health/get', (req, res, next) => {
    res.send('api works');
});


/** Post group create new group */
router.post("/groups", (req, res, next) => {
    const group = new Group({
        _id: new mongoose.Types.ObjectId(),
        groupName: req.body.name,
        channels: []
    });
    group
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: "Created group successfully",
                createdGroup: {
                    groupName: result.name,
                    _id: result._id,
                    request: {
                        type: 'GET',
                        url: "http://localhost:5000/groups/" + result._id
                    }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});


/** GET user groups by id */
router.get('/groups/:groupId', (req, res, next) => {
    const id = req.params.groupId;
    Group.findById(id)
        .select('groupName channels _id')
        .exec()
        .then(doc => {
            console.log("From database", doc);
            if (doc) {
                res.status(200).json({
                    group: doc,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:5000/groups'
                    }
                });
            } else {
                res
                    .status(404)
                    .json({message: "No valid entry found for provided ID"});
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
});

/** Delete group by id */

router.delete("/groups/:groupId", (req, res, next) => {
    const id = req.params.groupId;
    Group.remove({_id: id})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Group deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:5000/groups',
                    body: {groupName: 'String'}
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});


/** Post new user */

router.post('/channel/createUser', (req, res, next) => {
    User.find({username: req.body.username})
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: "username exists"
                });
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            username: req.body.username,
                            groupAdmin: req.body.groupAdmin,
                            superAdmin: req.body.superAdmin,
                            password: hash,
                            channels: [req.body.channel]
                        });
                        user
                            .save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: "User created"
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                });
                            });
                    }
                });
            }
        });
});


/** Delete user from channel*/

router.post("/channel/:userId", (req, res, next) => {
    const id = req.params.userId;
    Channel.update({_id: id}, {$pull: {'members': {'_id': req.params.userId}}})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'User deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:5000/channel',
                    body: {username: 'String'}
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

/** User login */
router.post('/login', (req, res, next) => {
    User.find({email: req.body.email})
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: "Auth failed"
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: "Auth failed"
                    });
                }
                if (result) {
                    const token = jwt.sign(
                        {
                            username: user[0].username,
                            userId: user[0]._id
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "1h"
                        }
                    );
                    return res.status(200).json({
                        username: user[0].username,
                        superAdmin: user[0].superAdmin,
                        groupAdmin: req.body.groupAdmin,
                        channels: user[0].channels,
                        message: "Auth successful",
                        token: token
                    });
                }
                res.status(401).json({
                    message: "Auth failed"
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});


/**Post channel create new channel*/

router.post("/channel", (req, res, next) => {
    const channel = new Channel({
        _id: new mongoose.Types.ObjectId(),
        group: req.body.group,
        members:[],
        conversation:[]
    });
    channel
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: "Created channel successfully",
                createdChannel: {
                    channelName: result.name,
                    _id: result._id,
                    request: {
                        type: 'GET',
                        url: "http://localhost:5000/channel/" + result._id
                    }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});


/** GET channel by id */
router.get('/channel/:channelId', (req, res, next) => {
    const id = req.params.channelId;
    Group.findById(id)
        .select('channelName members _id conversation')
        .exec()
        .then(doc => {
            console.log("From database", doc);
            if (doc) {
                res.status(200).json({
                    channel: doc,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:5000/channel'
                    }
                });
            } else {
                res
                    .status(404)
                    .json({message: "No valid entry found for provided ID"});
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
});


/** Delete channel by id*/

router.delete("/channel/:channelId", (req, res, next) => {
    const id = req.params.channelId;
    Channel.remove({_id: id})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'channel deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:5000/channel',
                    body: {channelName: 'String'}
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});


module.exports = router;