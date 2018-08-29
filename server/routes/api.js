const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');

const User = require('../models/user');
const Group = require('../models/group');
const Channel = require('../models/channel');


/** GET API heath check */
router.get('/health/get', (req, res, next) => {
    res.send('api works');
});

/** User sign up, for super admin creation only, will be remove from UI */

router.post("/signup", (req, res, next) => {
    User.find({email: req.body.email})
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: "Mail exists"
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
                            password: hash,
                            superAdmin: true,
                            groups: [],
                            channels: []
                        });
                        user.save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: "User created",
                                    createdUser: {
                                        _id: result._id,
                                        username: result.username,
                                        email: result.email
                                    }
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

/** User login */
router.post('/login', (req, res, next) => {
    User.find({email: req.body.email})
        .populate('channels', '_id channelName')
        .populate('groups', '_id groupName')
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
                        message: "Auth successful",
                        token: token,
                        userInfo: {
                            username: user[0].username,
                            superAdmin: user[0].superAdmin,
                            channels: user[0].channels,
                            groups: user[0].groups
                        }
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


/** delete user */

router.delete("/user/:userId", (req, res, next) => {
    User.remove({_id: req.params.userId})
        .exec()
        .then(result => {
            res.status(200).json({
                message: "User deleted"
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});


/** create new group */
router.post("/groups/create", (req, res, next) => {
    const group = new Group({
        _id: new mongoose.Types.ObjectId(),
        groupName: req.body.name,
        admin: req.body.userId,
        members: [req.body.userId]
    });
    group.save()
        .populate('channels', '_id channelName')
        .populate('members', '_id userName')
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: "Created group successfully",
                createdGroup: {
                    groupName: result.groupName,
                    _id: result._id,
                    admin: result.admin,
                    members: result.members
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
        .populate('members', 'username _id')
        .exec()
        .then(doc => {
            console.log("From database", doc);
            if (doc) {
                res.status(200).json({
                    group: doc,
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

/** update groups members*/

router.post("/groups/update", (req, res, next) => {
    const userId = req.body.userId;
    const groupId = req.body.groupId;
    Group.update({_id: groupId}, {$push: {'members': {'_id': userId}}})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'group members update',
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
    User.update({_id: userId}, {$push: {'groups': {'_id': groupId}}})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'User groups update',
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

/** update group admin*/

router.post("/groups/update", (req, res, next) => {
    const userId = req.body.userId;
    const groupId = req.body.groupId;
    Group.update({_id: groupId}, {$set: {'admin': {'_id': userId}}})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'group admin update',
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

/** Delete group by id */

router.delete("/groups/delete", (req, res, next) => {
    const id = req.body.groupId;
    Group.remove({_id: id})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Group deleted',
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});


/** create new user */

router.post('/user/create', (req, res, next) => {
    User.find({username: req.body.username})
        .populate('channels', 'channelName')
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: "user name exists"
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
                            superAdmin: false,
                            password: hash,
                            groups: [req.body.groupId],
                            channels: [req.body.channelId]
                        });
                        user.save()
                            .then(result => {
                                res.status(201).json({
                                    message: "User created",
                                    userInfo: result
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

router.post("/channel/delete", (req, res, next) => {
    const channelId = req.body.channelId;
    const userId = req.body.userId;
    Channel.update({_id: channelId}, {$pull: {'members': {'_id': userId}}})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'User has been removed from channel',
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
    User.update({_id: userId}, {$pull: {'channels': {'_id': channelId}}})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'channel has been removed from user',
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});


/** create new channel*/

router.post("/channel/create", (req, res, next) => {
    const channel = new Channel({
        _id: new mongoose.Types.ObjectId(),
        group: req.body.group,
        channelName: req.body.channelName,
        members: [],
        conversation: []
    });
    channel.save()
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
                    channel: doc
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
                message: 'channel deleted'
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