const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongo = require('../mongo');
const utils = require('../utils');
const _ = require('lodash');

passport.use(new LocalStrategy(
    {usernameField: 'login', passwordField: 'password'},
    function(login, password, done) {
        mongo.db.collection('users').findOne({login, password}, function(err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            return done(null, user);
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, ""+user._id);
});

passport.deserializeUser(function(id, done) {
    mongo.db.collection('users').findOne({_id: new mongo.ObjectId(id)}, done);
});

router.post('/login', passport.authenticate('local'), (request, response) => {
    response.status(200).json({ok: 1});
});

router.post('/logout', function(req, res) {
    req.logout();
    res.status(200).json({ok: 1});
});

router.get('/me', utils.needAuth, utils.jsonResponse((request, response) => {
    return {user: _.pick(request.user, ['login','name'])};
}));

module.exports = router;
