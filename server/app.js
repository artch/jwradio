const express = require('express');
const path = require('path');
const logger = require('morgan');
const passport = require('passport');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const cors = require('cors');
const utils = require('./utils');

require('./mongo');

if(!process.env.ICECAST_AUTH) {
    console.error('No ICECAST_AUTH env var configured');
    process.exit();
}
if(!process.env.ICECAST_BROADCAST_PORT) {
    console.error('No ICECAST_BROADCAST_PORT env var configured');
    process.exit();
}
if(!process.env.ICECAST_LISTENER_PORT) {
    console.error('No ICECAST_LISTENER_PORT env var configured');
    process.exit();
}
if(!process.env.ICECAST_SOURCE_PASSWORD) {
    console.error('No ICECAST_SOURCE_PASSWORD env var configured');
    process.exit();
}

var app = express();

var store = new MongoDBStore({
    uri: process.env.MONGO_URL,
    collection: 'sessions'
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(require('cookie-parser')());
app.use(session({
    secret: 'asfdl;ijp23o85j0893rjoij1',
    cookie: {
        maxAge: 1000 * 60 * 60 * 2
    },
    store,
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

var corsOptions = {
    credentials: true,
    origin: function (origin, callback) {
        callback(null, origin == process.env.CORS_WHITELIST);
    }
};

app.options('*', cors(corsOptions));

app.use(cors(corsOptions));

app.use('/api', require('./routes/index'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', utils.needAuth, require('./routes/admin'));

module.exports = app;
