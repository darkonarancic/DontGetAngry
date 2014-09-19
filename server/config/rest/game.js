var mongoose = require('mongoose'),
    sha1 = require('sha1');


module.exports = function(app, io, User, config){
    var gameObj = {};
    var players = [];
    var games = [];
    var gameRooms = [];
    var gameSchema = mongoose.Schema({
        gameStatus: {type: String, required: true},
        gameOwnerId: {type: String, required: true, unique: true},
        gameOwner: {type: String, required: true}
    });

    var usersInGame = mongoose.Schema({
        gameId: {type: String, required: true},
        playerId: {type: String, required: true, unique: true},
        playerReady: {type: Boolean, required: true}
    });

    var usersInGameCount = mongoose.Schema({
        gameId: {type: String, required: true},
        numberOfPlayers: {type: Number, required: true},
        gameOwner: {type: String, required: true},
        gameCreated: {type: Boolean, required: true}
    });


    var Game = mongoose.model('games', gameSchema);
    var UsersGame = mongoose.model('usersInGame', usersInGame);
    //var UsersInGame = mongoose.model('usersInGameCount', usersInGameCount);

    var currentGame = [];

    io.on("connection", function(socket){

        gameObj.joinCurrentGame(socket, socket.request.session.passport.user);

        gameObj.createGame(socket, socket.request.session.passport.user);

        gameObj.leaveCurrentGame(socket, socket.request.session.passport.user);

        gameObj.userIsReadyForGame(socket, socket.request.session.passport.user);

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
                        gameOwnerId: userId,
                        gameOwner: userObj.username
                    }, function(err, game){
                        var gameId = userObj.username + userId;
                        if(err){
                            /*res.status(404);
                            res.json({
                                msg: 'Game can\'t be created, please try again!',
                                status: false
                            });*/
                        }
                        else {
                            gameStatus = game.gameStatus;
                            UsersGame.create({
                                gameId: gameId,
                                playerId: userId,
                                playerReady: false
                            }, function(err, game){
                                if(err){
                                    /*res.status(404);
                                    res.json({
                                        msg: 'Game can\'t be created, please try again!',
                                        status: false
                                    });*/
                                }
                                else {
                                    var gameNameId = gameId;

                                    games[gameNameId] = [];
                                    games[gameNameId].push({
                                        gameOwnerName: userObj.username,
                                        usersInGameId: gameId,
                                        gameId: gameNameId,
                                        gameCanStart: false,
                                        game: {}
                                    });

                                    games[gameNameId][0].game.players = [];
                                    games[gameNameId][0].game.players.push({
                                        userId: userId,
                                        username: userObj.username,
                                        gameOwner: true,
                                        playerReady: game.playerReady
                                    });

                                    socket.emit('createdGameResponse', games[gameNameId][0]);

                                    gameRooms.push(gameNameId);
                                    socket.join(gameNameId);

                                    getAllCreatedGames();
                                    /*UsersInGame.create({
                                        gameId: gameId,
                                        numberOfPlayers: 1,
                                        gameOwner: userObj.username,
                                        gameCreated: true
                                    }, function(err, game){
                                        if(err){
                                            *//*res.status(404);
                                            res.json({
                                                msg: 'Game can\'t be created, please try again!',
                                                status: false
                                            });*//*
                                        }
                                        else {

                                        }
                                    });*/

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
                //join user to the game
                /*if(gameRooms[socket.id] && gameRooms[socket.id] !== gameId.id){
                    socket.leave(gameRooms[socket.id]);
                }*/
                var game = gameId.id;
                if(gameRooms.indexOf(game) === -1){
                    gameRooms.push(game);
                }
                socket.join(game, function(err){
                    if(!err){
                        User.findOne({ _id: userId }, function(err, user){
                            if(err) {
                                /*res.status(404);
                                res.json({
                                    status: false,
                                    msg: 'There is no user with that ID!'
                                })*/
                            }
                            else {
                                UsersGame.create({
                                    gameId: games[game][0].usersInGameId,
                                    playerId: userId,
                                    playerReady: false
                                }, function(err){
                                    if(!err){
                                        var userObj = user;
                                        games[game][0].gameCanStart = false;
                                        games[game][0].game.players.push({
                                            userId: userId,
                                            username: userObj.username,
                                            gameOwner: false,
                                            playerReady: false
                                        });


                                        socket.broadcast.to(game).emit("joinedGameResponse", games[game][0]);
                                        socket.emit('joinedGameResponse', games[game][0]);
                                    }
                                });
                            }
                        });
                    }
                });

            }
        });
    };

    gameObj.leaveCurrentGame = function(socket, userId){
        socket.on('leave', function(gameId){
            if(gameId){
                //join user to the game
                /*if(gameRooms[socket.id] && gameRooms[socket.id] !== gameId.id){
                 socket.leave(gameRooms[socket.id]);
                 }*/
                var game = gameId.id;

                socket.leave(game, function(err){
                    if(!err){
                        var playersInPadding = games[game][0].game.players;
                        //games[game][0].game.players[userId].push({ userId: userId, username: userObj.username, gameOwner: false });

                        for(player in playersInPadding) {
                            if(playersInPadding[player].userId === userId){
                                if(playersInPadding[player].gameOwner){
                                    Game.remove({ gameOwnerId: userId }, function(err){
                                        if(!err){
                                            console.log("game deleted");
                                        }
                                    });
                                    /*UsersInGame.remove({ gameId: games[game][0].usersInGameId }, function(err){
                                        if(!err){
                                            console.log("UsersInGame deleted");
                                        }
                                    });*/
                                    UsersGame.remove({ gameId: games[game][0].usersInGameId }, function(err){
                                        if(!err){
                                            console.log("UsersGame deleted");
                                        }
                                    });
                                    games[game].pop();
                                    getAllCreatedGames();
                                    socket.emit('createdGameResponse', {});
                                }
                                else {
                                    games[game][0].game.players.splice(player, 1);
                                }
                            }
                        }

                        socket.broadcast.to(game).emit("joinedGameResponse", games[game][0]);

                    }
                });

            }
        });
    };

    gameObj.userIsReadyForGame = function(socket, userId){
        socket.on('userIsReady', function(game) {
            UsersGame.update({ playerId: userId }, { playerReady: true }, { multi: true }, function (err, user) {
                if (!err) {
                    var allPlayers = games[game.id][0].game.players;
                    var gameStartStatuses = [];
                    var gameCanStart = false;
                    for(var player in allPlayers){
                        if(allPlayers[player].userId === userId){
                            allPlayers[player].playerReady = true;
                        }
                        gameStartStatuses.push(allPlayers[player].playerReady);
                    }

                    for(var status in gameStartStatuses){
                        if(!gameStartStatuses[status]){
                            gameCanStart = gameStartStatuses[status];
                            break;
                        }
                        else {
                            gameCanStart = gameStartStatuses[status];
                        }
                    }

                    games[game.id][0].gameCanStart = gameCanStart;

                    socket.broadcast.to(game.id).emit("joinedGameResponse", games[game.id][0]);
                    socket.emit('joinedGameResponse', games[game.id][0]);
                }
            });
        });
    };

    app.post('/getAllGames', function(req, res){
        Game.find({  }, function(err, allGames){
            if(err){
                /*res.status(404);
                res.json({
                    msg: 'Game can\'t be created, please try again!',
                    status: false
                });*/
            }
            else {
                var gameNames = [];
                for(game in allGames){
                    gameNames[game] = {
                        gameId: allGames[0]._doc.gameOwner + allGames[0]._doc.gameOwnerId,
                        gameName: allGames[0]._doc.gameOwner
                    };
                }
                res.json({ games: gameNames });
            }
        });
    });

    //delete all games
    app.post('/removeAllGames', function(req, res){
        mongoose.connections[0].collections.games.drop();
        /*mongoose.connections[0].collections.usersingamecounts.drop();*/
        mongoose.connections[0].collections.usersingames.drop();
        getAllCreatedGames();
    });

    //get all created games width less than 4 players
    function getAllCreatedGames(){
        Game.find({}, function(err, games){
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
                        gameId: games[game]._doc.gameOwner + games[game]._doc.gameOwnerId,
                        gameName: games[game]._doc.gameOwner
                    };
                }
                io.sockets.emit('availableGames', {
                    games: gameNames
                });
            }
        });
    }

};