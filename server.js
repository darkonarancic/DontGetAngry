var express = require('express'),
    path = require('path'),
    fs = require('fs');

var env = process.env.NODE_ENV = process.env.NODE_ENV || "development";

var config = require('./server/config/config')[env];

var app = express();
var server = app.listen(config.port);

require('./server/config/express')(app, config);

require('./server/config/mongoose')(config);

require('./server/config/routes')(app);

require('./server/config/rest/user')(app, __dirname);

require('./server/config/rest/game')(app, server);

