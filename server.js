var express = require('express'),
    compass = require('node-compass'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    path = require('path'),
    fs = require('fs'),
    mongoose = require('mongoose');

var env = process.env.NODE_ENV = process.env.NODE_ENV || "development";

var app = express();

app.use(compass({
    project: path.join(__dirname, '/public')
}));

app.use(express.static(__dirname + '/public' ));

app.use(logger('dev'));
app.use(bodyParser());

app.set('views', __dirname + '/server/views');
app.set('view engine', 'jade');

//mongo db connection
mongoose.connect('mongodb://dn_87:darko87_mongo@kahana.mongohq.com:10099/dn_code');
var db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error..."));
db.open('open', function callback(){
    console.log('DGE db opened');
});

/*fs.readdirSync(__dirname + '/models').foreEach(function(filename){
    if(~filename.idexOf('.js')) require(__dirname + '/models/' + filename);
});*/

/*var messageSchema = mongoose.Schema({message: String});
var Message = mongoose.model('Message', messageSchema);*/

var userSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String
});

var User = mongoose.model('users', userSchema);

app.get('/partials/:partialPath', function(req, res){
    res.render('partials/' + req.params.partialPath);
});

app.post('/addNewUser', function(req, res){
    User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    });
});

app.get('*', function(req, res){
    res.render('index');
});

var port = 3000;

app.listen(port, function(err){
    if(err){
        console.log(err);
    }
    else {
        console.log('Server is running on ' + port + '...');
    }
});