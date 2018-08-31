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
    User.find({username: req.body.username})
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
                    /*const token = jwt.sign(
                        {
                            username: user[0].username,
                            userId: user[0]._id
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "1h"
                        }
                    );*/
                    return res.status(200).json({
                        message: "Auth successful",
                        userInfo: {
                            userId: user[0]._id,
                            email: user[0].email,
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

/** get user information*/

router.get('/user/:userId', (req, res, next) => {
    const id = req.params.userId;
    User.findById(id)
        .populate('groups', 'groupName _id')
        .populate('channels', 'channelName _id')
        .exec()
        .then(doc => {
            console.log("From database", doc);
            if (doc) {
                res.status(200).json({
                    userInfo: doc
                });
            } else {
                res.status(404).json({
                    message: "No valid entry found for provided ID"
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
});


/** delete user */

router.delete("/user/:userId", (req, res, next) => {
    User.findById(req.params.userId, function (err, user) {
        return user.remove(function (err) {
            if (!err) {
                Group.update(
                    {_id: {$in: user.groups}},
                    {$pull: {members: user._id}},
                    function (err, numberAffected) {
                        console.log(numberAffected);
                    })
                Channel.update(
                    {_id: {$in: user.channels}},
                    {$pull: {members: user._id}},
                    function (err, numberAffected) {
                        console.log(numberAffected);
                    })
                res.status(200).json({
                    message: "user deleted"
                });
            } else {
                res.status(500).json({
                    error: err
                });
            }
        })
    })
});

/** create new user*/

router.post('/user/create', (req, res, next) => {
    User.find({username: req.body.username})
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: "user exists"
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
                            channels: []
                        });
                        user.save()
                            .then(result => {
                                res.status(201).json({
                                    message: "User created",
                                    userInfo: result
                                });
                                Group.update({_id: req.body.groupId}, {$push: {'members': {'_id': result._id}}})
                                    .exec()
                                    .then(result => {
                                        console.log('group update')
                                    })
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

/** create new group */
router.post("/groups/create", (req, res, next) => {
    Group.find({groupName: req.body.name})
        .exec()
        .then(group => {
            if (group.length >= 1) {
                return res.status(409).json({
                    message: "group exists"
                });
            } else {
                const group = new Group({
                    _id: new mongoose.Types.ObjectId(),
                    groupName: req.body.name,
                    admin: req.body.userId,
                    members: [req.body.userId]
                });

                group.save()
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

                        User.update({_id: req.body.userId}, {$push: {'groups': {'_id': result._id}}})
                            .exec()
                            .then(result => {
                                console.log('user information update')
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                });
                            });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
            }
        })
});


/** GET user groups by id */
router.get('/groups/:groupId', (req, res, next) => {
    const id = req.params.groupId;
    Group.findById(id)
        .select('groupName members _id admin')
        .populate('admin', 'username _id')
        .populate('members', 'username _id')
        .exec()
        .then(doc => {
            console.log("From database", doc);
            if (doc) {
                res.status(200).json({
                    group: doc,
                });
            } else {
                res.status(404).json({
                    message: "No valid entry found for provided ID"
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
});

/** add group member*/

router.post("/groups/addUser", (req, res, next) => {
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
            console.log('user information updated')
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

/** delete group by id */

router.delete("/groups/delete/:groupId", (req, res, next) => {
    const id = req.params.groupId;

    Group.findById(id, function (err, group) {
        return group.remove(function (err) {
            if (!err) {
                User.update(
                    {_id: {$in: group.members}},
                    {$pull: {groups: group._id}},
                    function (err, numberAffected) {
                        console.log(numberAffected);
                    });
                Channel.remove(
                    {group: group._id},
                    function (err, numberAffected) {
                        console.log(numberAffected);
                    })
                res.status(200).json({
                    message: "group deleted"
                });
            } else {
                res.status(500).json({
                    error: err
                });
            }
        })
    })
});


/** add exist user to channel*/
router.post("/channel/add", (req, res, next) => {
    const channelId = req.body.channelId;
    const userId = req.body.userId;
    Channel.update({_id: channelId}, {$push: {members: {_id: userId}}})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'User has been added to channel',
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
    User.update({_id: userId}, {$push: {channels: {_id: channelId}}})
        .exec()
        .then(result => {
            console.log('channel has been added to user')
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
})


/** Delete user from channel*/

router.post("/channel/delete", (req, res, next) => {
    const channelId = req.body.channelId;
    const userId = req.body.userId;

    Channel.updateOne({_id: channelId}, {$pull: {members: {_id: userId}}})
        .exec()
        .then(result => {
            console.log('channel updated')
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
    User.updateOne(
        {_id: userId}, {$pull: {channels: {_id: channelId}}})
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
});

/** create new channel*/

router.post("/channel/create", (req, res, next) => {
    const channel = new Channel({
        _id: new mongoose.Types.ObjectId(),
        group: req.body.group,
        channelName: req.body.channelName,
        members: [req.body.userId],
        conversation: []
    });
    channel.save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: "Created channel successfully",
                createdChannel: {
                    channelName: result.name,
                    _id: result._id
                }
            });
            User.update({_id: req.body.userId}, {$push: {'channels': {'_id': result._id}}})
                .exec()
                .then(result => {
                    console.log('channel has been added to user')
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
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


/** GET channel by id */
router.get('/channel/:channelId', (req, res, next) => {
    const id = req.params.channelId;
    Group.findById(id)
        .select('channelName members _id conversation')
        .populate('members', '_id username')
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

    Channel.findById(id, function (err, channel) {
        return channel.remove(function (err) {
            if (!err) {
                User.update(
                    {_id: {$in: channel.members}},
                    {$pull: {channels: channel._id}},
                    function (err, numberAffected) {
                        console.log(numberAffected);
                    })
                res.status(200).json({
                    message: "channel deleted"
                });
            } else {
                res.status(500).json({
                    error: err
                });
            }
        })
    })
});


module.exports = router;