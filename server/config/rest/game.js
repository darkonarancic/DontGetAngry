var mongoose = require('mongoose'),
    sha1 = require('sha1');


module.exports = function(app, io, User){
    var gameObj = {};
    var gameSchema = mongoose.Schema({
        gameStatus: {type: String, required: true},
        gameOwnerId: {type: String, required: true, unique: true}
    });

    var usersInGame = mongoose.Schema({
        gameId: {type: String, required: true},
        playerId: {type: String, required: true, unique: true}
    });

    var usersInGameCount = mongoose.Schema({
        gameId: {type: String, required: true},
        numberOfPlayers: {type: Number, required: true},
        gameOwner: {type: String, required: true}
    });


    var Game = mongoose.model('games', gameSchema);
    var UsersGame = mongoose.model('usersInGame', usersInGame);
    var UsersInGame = mongoose.model('usersInGameCount', usersInGameCount);

    var currentGame = [];

    io.on("connection", function(socket){

        gameObj.createGame(socket, socket.request.session.passport.user);

        gameObj.joinCurrentGame(socket, socket.request.session.passport.user);
        
        /*gameObj.joinRoom(socket, socket.request.session.passport.user);*/

    });

    gameObj.createGame = function(socket, userId){
        socket.on('createGame', function(data){
            var gameStatus = "";
            var userObj = "";
            User.findOne({ _id: userId }, function(err, user){
                if(err) {
                    res.status(404);
                    res.json({
                        status: false,
                        msg: 'There is no user with that ID!'
                    })
                }
                else {
                    userObj = user;
                }
            });
            Game.count({ gameOwnerId: userId }, function(err, count){
                if(err) {
                    res.status(404);
                    res.json({
                        status: false,
                        msg: 'An error has occurred during the game creation!'
                    })
                }
                else if(count) {
                    res.status(404);
                    res.json({
                        status: false,
                        msg: 'You have one game assigned to you!'
                    })
                }
                else {
                    Game.create({
                        gameStatus: "created",
                        gameOwnerId: userId
                    }, function(err, game){
                        if(err){
                            res.status(404);
                            res.json({
                                msg: 'Game can\'t be created, please try again!',
                                status: false
                            });
                        }
                        else {
                            gameStatus = game.gameStatus;
                            UsersGame.create({
                                gameId: game._id,
                                playerId: userId
                            }, function(err, user){
                                if(err){
                                    res.status(404);
                                    res.json({
                                        msg: 'Game can\'t be created, please try again!',
                                        status: false
                                    });
                                }
                                else {
                                    UsersInGame.create({
                                        gameId: game._id,
                                        numberOfPlayers: 1,
                                        gameOwner: userObj.username
                                    }, function(err, game){
                                        if(err){
                                            res.status(404);
                                            res.json({
                                                msg: 'Game can\'t be created, please try again!',
                                                status: false
                                            });
                                        }
                                        else {
                                            getAllCreatedGames();
                                            socket.emit('createdGameResponse', {
                                                gameStatus: gameStatus
                                            });
                                            socket.join(userObj.username+userId);
                                        }
                                    });

                                }
                            });
                        }
                    });
                }
            });
        });
    };

    gameObj.joinCurrentGame = function(socket, userId){
        socket.on('join', function(gameId){
            if(gameId){
                socket.join(gameId.id);
                socket.broadcast.to(gameId.id).emit("joinedGameResponse", "You successfully joined game " + gameId.id);
            }
        });
    };

   /* gameObj.joinRoom = function(socket, userId){
        currentGame[socket.id] =
    };*/

    app.post('/getAllGames', function(req, res){
        UsersInGame.find({ numberOfPlayers: { $lt: 4 }}, function(err, games){
            if(err){
                res.status(404);
                res.json({
                    msg: 'Game can\'t be created, please try again!',
                    status: false
                });
            }
            else {
                var gameNames = [];
                for(game in games){
                    gameNames[game] = {
                        gameId: games[game].gameOwner + games[game].gameId,
                        gameName: games[game].gameOwner
                    };
                }
                res.json({ games: gameNames });
            }
        });
    });

    //get all created games width less than 4 players
    function getAllCreatedGames(){
        UsersInGame.find({ numberOfPlayers: { $lt: 4 }}, function(err, games){
            if(err){
                res.status(404);
                res.json({
                    msg: 'Game can\'t be created, please try again!',
                    status: false
                });
            }
            else {
                var gameNames = [];
                for(game in games){
                    gameNames[game] = {
                        gameId: games[game].gameOwner + games[game].gameId,
                        gameName: games[game].gameOwner
                    };
                }
                io.sockets.emit('availableGames', {
                    games: gameNames
                });
            }
        });
    }

};