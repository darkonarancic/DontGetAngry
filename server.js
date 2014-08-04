var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

var env = process.env.NODE_ENV = process.env.NODE_ENV || "development";

var config = require('./server/config/config')[env];

var app = express();

require('./server/config/express')(app, config);

require('./server/config/mongoose')(config);



require('./server/config/routes')(app);

require('./server/config/rest/user')(app, __dirname);

app.listen(config.port, function(err){
    if(err){
        console.log(err);
    }
    else {
        console.log('Server is running on ' + config.port + '...');
    }
});