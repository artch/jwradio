const express = require('express');
const router = express.Router();
const utils = require('../utils');
const mongo = require('../mongo');
const auth = require('../utils');
const _ = require('lodash');
const requestMod = require('request-promise-native');
const xml2js = require('xml2js');
const util = require('util');

function setExpiredFlag(codes, generation) {
    return codes.map(function(code) {
        code.expired = code.activated ? Date.now() > code.activated.getTime() + generation.duration * 24 * 3600 * 1000 : false;

        return code;
    });
}

router.get('/codes/list', utils.jsonResponse(async (request) => {
    var list = await mongo.db.collection('generations').find({user: request.user._id}).sort({date: -1}).toArray();
    return {list};
}));

router.get('/codes/generation', utils.jsonResponse(async (request) => {
    var generation = await mongo.db.collection('generations').findOne({user: request.user._id, _id: mongo.ObjectId(request.query.id)});
    if(!generation) {
        return Promise.reject('invalid id');
    }
    var codes = await mongo.db.collection('codes').find({generation: generation._id}).toArray();
    setExpiredFlag(codes, generation);
    return {info: generation, codes};
}));

router.get('/codes/export', (request, response) => {
    return mongo.db.collection('generations').findOne({user: request.user._id, _id: mongo.ObjectId(request.query.id)})
        .then(generation => {
            if(!generation) {
                return Promise.reject('invalid id');
            }
            return mongo.db.collection('codes').find({generation: generation._id}).toArray()
                .then(codes => {
                    codes = setExpiredFlag(codes, generation).filter(function(code) {
                        return !code.expired
                    });
                    response.setHeader('Content-Disposition', 'attachment; filename*=UTF-8\'\''+encodeURIComponent('Коды_'+generation.name)+'.txt');
                    response.send(_.map(codes, 'code').join('\r\n'));
                });
        })
});

router.post('/codes/check', utils.jsonResponse(async (request) => {
    var code = await mongo.db.collection('codes').findOne({code: request.body.code});
    if (!code) {
        return Promise.reject('invalid code');
    }
    var generation = await mongo.db.collection('generations').findOne({
        user: request.user._id,
        _id: code.generation
    });
    if (!generation) {
        return Promise.reject('invalid id');
    }
    return {code, generation};
}));

function genCode() {
    var code = Math.floor(Math.random()*89999999 + 10000000);
    return mongo.db.collection('codes').findOne({code})
        .then(result => {
            if(!result) {
                return ""+code;
            }
            return genCode();
        })
}

router.post('/codes/add', utils.jsonResponse(async (request) => {
    var result = await mongo.db.collection('generations').insert({
        user: request.user._id,
        name: request.body.name,
        duration: request.body.duration,
        count: request.body.count,
        date: new Date()
    });

    for(var i=0; i<request.body.count; i++) {
        var code = await genCode();
        await mongo.db.collection('codes').insert({
            code,
            generation: result.insertedIds[0],
        });
    }

    return {id: result.insertedIds[0]};
}));

router.post('/codes/delete-generation', utils.jsonResponse(async (request) => {
    var result = await mongo.db.collection('generations').findOne({user: request.user._id, _id: mongo.ObjectId(request.body.id)});
    if(!result) {
        return Promise.reject('invalid id');
    }
    await mongo.db.collection('generations').remove({user: request.user._id, _id: mongo.ObjectId(request.body.id)});
    await mongo.db.collection('codes').remove({generation: mongo.ObjectId(request.body.id)});
}));

router.post('/codes/delete-code', utils.jsonResponse(async (request) => {
    var code = await mongo.db.collection('codes').findOne({code: request.body.code});
    if (!code) {
        return Promise.reject('invalid code');
    }
    var generation = await mongo.db.collection('generations').findOne({
        user: request.user._id,
        _id: code.generation
    });
    if (!generation) {
        return Promise.reject('invalid id');
    }
    await mongo.db.collection('codes').remove({_id: code._id});
    await mongo.db.collection('generations').update({_id: generation._id}, {$inc: {count: -1}});
}));

router.get('/channels', utils.jsonResponse(async (request) => {
    var channels = await mongo.db.collection('channels').find({uid: {$in: request.user.channels}}).toArray();

    for(var i=0; i<channels.length; i++) {
        var channel = channels[i];
        channel._listeners = [];
        try {
            let icecastBody = await requestMod('http://'+process.env.ICECAST_AUTH + '@xn--80abnlydpf.xn--90ais:'+process.env.ICECAST_BROADCAST_PORT+'/admin/listclients?mount=/' + channel.mountpoint);
            let parsed = await util.promisify(xml2js.parseString)(icecastBody);
            channel._connection = true;
            if(parsed.icestats.source[0].listener) {
                for(var j=0; j<parsed.icestats.source[0].listener.length; j++) {
                    var listener = parsed.icestats.source[0].listener[j];
                    var codes = await mongo.db.collection('codes').find({IP: listener.IP[0]}).sort({activated: -1}).toArray();
                    if(codes.length) {
                        listener.code = codes[0];
                        var generation = await mongo.db.collection('generations').findOne({_id: codes[0].generation});
                        listener.generation = generation;
                        if(typeof listener.code.listeners === 'object') {
                            listener.code.listeners = listener.code.listeners[listener.IP[0].replace(/\./g, '_')] || 1;
                        }
                    }
                    channel._listeners.push(listener);
                }
            }
        }
        catch(e) {
            if(e.statusCode === 400) {
                channel._connection = false;
            }
            else {
                throw e;
            }
        }
    }

    return {
        channels,
        broadcastPort: process.env.ICECAST_BROADCAST_PORT,
        listenerPort: process.env.ICECAST_LISTENER_PORT,
        sourcePassword: process.env.ICECAST_SOURCE_PASSWORD
    };
}));

router.post('/change-password', utils.jsonResponse(async (request) => {
    if(request.user.password !== request.body.old) {
        return {invalid: 'Неверный старый пароль'};
    }
    if(request.body.new !== request.body.newAgain) {
        return {invalid: 'Новый пароль введен неправильно'};
    }
    await mongo.db.collection('users').update({_id: request.user._id}, {$set: {password: request.body.new}});
}));
module.exports = router;

