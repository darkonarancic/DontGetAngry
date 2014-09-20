var mongoose = require('mongoose'),
    sha1 = require('sha1'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

module.exports = exports = function(app, io, User){

    passport.use(new LocalStrategy(
        function(username, password, done){
            User.findOne({ username: username, password: sha1(password) }).exec(function(err, user){
                if (err) { return done(err); }
                if (!user) {
                    return done(null, false, {
                        msg: 'Combination of username/password is incorrect.',
                        msgState: true,
                        success: true
                    });
                }
                return done(null, user);
            });
        }
    ));

    passport.serializeUser(function(user, done){
        if(user){
            done(null, user._id);
        }
    });

    passport.deserializeUser(function(id, done){
        User.findOne({_id:id}).exec(function(err, user){
            if(user){
                return done(null, user);
            } else {
                return done(null, false, { msg: 'Invalid username/password combination!' });
            }
        });
    });

    app.post('/addNewUser', function(req, res){
        User.find({ email: req.body.email }, function(err, doc){
            if(!doc.length){
                User.create({
                    username: req.body.username,
                    email: req.body.email,
                    password: sha1(req.body.password),
                    activated: false
                }, function(err, doc){
                    if(err){
                        res.status(404);
                        res.json({
                            msg: 'User can\'t be created, please try again!',
                            status: false
                        });
                    }
                    else {
                        var resDoc = {
                            status: true,
                            msg: "User created successfully, please check you email and verify account!"
                        };
                        doc.password = "";
                        resDoc.prototype = doc;

                        var url = "http://localhost:3000/verify/";

                        //config for user email verification
                        var userConfig = {
                            email: doc.email,
                            subject: "Don't Get Angry - account verification!",
                            html: "Hey "+ doc.username +",<br/>Please verify your email address: <a href='"+ url + doc._id +"'>verification link!</a>"
                        };

                        require('../nodemailer')(userConfig);

                        res.json(resDoc);
                    }
                });
            }
            else {
                res.status(404);
                res.json({
                    msg: 'User already exist!',
                    status: false
                });
            }
        });
    });

    app.post('/verifyUser', function(req, res){
        User.findOne({ _id: req.body.id }, function(err, doc) {
            if (doc && !doc.activated) {
                doc.activated = true;
                doc.save(function(err) {
                    if (err) {
                        res.status(404);
                        res.json({
                            msg: "User can't be activated!",
                            status: false
                        });
                    }
                    else {
                        var resDoc = {
                            status: true,
                            msg: 'The user "'+ doc.username +'" is successfully verified!',
                            id: sha1(doc._id)
                        };
                        res.json(resDoc);
                    }
                });
            }
            else {
                res.status(404);
                res.json({
                    msg: 'You are not allowed to perform this action!',
                    status: false
                });
            }
        });
    });

    app.post('/getUser', function(req, res, next){
        passport.authenticate('local', function(err, user){
            if (err) { return next(err); }
            if(!user) {
                res.status(404);
                res.send({
                    success: false,
                    msgState: true,
                    msg: 'Invalid username/password combination!'
                });
            }
            req.logIn(user, function(err){
                if(err){ return next(err); }
                user.password = "";
                res.send({
                    success: true,
                    msgState: false,
                    user: user
                });
            });
        })(req, res, next);
    });

    app.post('/checkLoggedUser', function(req, res){
        if(req.user){
            res.json({
                user: req.user
            })
        } else {
            res.status(404);
            res.json({
                status: false
            });
        }
    });

    app.post('/logout', function(req, res){
        req.logout();
        res.json({ status: true });
    });
};