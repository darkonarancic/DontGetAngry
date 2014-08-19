var express = require('express'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    compass = require('node-compass'),
    path = require('path'),
    passport = require('passport'),
    cookieParser = require('cookie-parser'),
    session = require('express-session');

module.exports = function(app, config){
    app.use(compass({
        project: path.join(config.rootPath, '/public')
    }));

    app.use(express.static(config.rootPath + '/public' ));

    app.use(logger('dev'));
    app.use(cookieParser());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(passport.initialize());
    app.use(passport.session());

    app.set('views', config.rootPath + '/server/views');
    app.set('view engine', 'jade');
};