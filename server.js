var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    expressSession = require("express-session");

var env = process.env.NODE_ENV = process.env.NODE_ENV || "development";

var config = require('./server/config/config')[env];

var app = express();
var server = app.listen(config.port);

var sessionMiddleware = expressSession({
    name: "dga-cookie",
    secret: "dga-secret",
    store: new (require("connect-mongo")(expressSession))({
        url: config.db,
        auto_reconnect: true
    }),
    saveUninitialized: true,
    resave: true
});

app.use(sessionMiddleware);

var io = require('socket.io')(server);

io.use(function(socket, next){
    sessionMiddleware(socket.request, {}, next);
});

require('./server/config/express')(app, config);

require('./server/config/mongoose')(config);

/* user schema */
var userSchema = mongoose.Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    activated: {type: Boolean, required: true}
});

var User = mongoose.model('users', userSchema);

require('./server/config/routes')(app);

require('./server/config/rest/user')(app, io, User);

require('./server/config/rest/game')(app, io, User);

