const express = require('express');
const router = express.Router();
const utils = require('../utils');
const mongo = require('../mongo');
const passport = require('passport');
const auth = require('../utils');

router.post('/check-code', utils.jsonResponse(async (request) => {
    var code = await mongo.db.collection('codes').findOne({code: request.body.code.trim()});
    if(!code) {
        return Promise.reject('Неверный код');
    }
    var generation = await mongo.db.collection('generations').findOne({_id: code.generation});

    if(!code.activated) {
        mongo.db.collection('codes').update({_id: code._id}, {$set: {activated: new Date()}});
        code.activated = new Date();
    }
    if(!code.IP) {
        code.IP = [];
    }
    if(code.IP.indexOf(request.headers['x-forwarded-for']) === -1) {
        code.IP.push(request.headers['x-forwarded-for']);
    }



    if(Date.now() > code.activated.getTime() + generation.duration * 24 * 3600 * 1000) {
        return Promise.reject('Неверный код');
    }
    mongo.db.collection('codes').update({_id: code._id}, {$set: {IP: code.IP}});

    var user = await mongo.db.collection('users').findOne({_id: generation.user});
    var channels = await mongo.db.collection('channels').find({uid: {$in: user.channels}}).toArray();
    return {
        channels: channels.map(i => ({
            name: i.name,
            url: 'http://xn--80abnlydpf.xn--90ais:'+process.env.ICECAST_PORT+'/'+i.mountpoint
        }))
    }
}));

router.post('/update-listeners-count', utils.jsonResponse(async (request) => {
    await mongo.db.collection('codes').update({code: request.body.code.trim()}, {$set: {listeners: +request.body.listeners}});
}));

module.exports = router;
