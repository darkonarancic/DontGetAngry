var mongoose = require('mongoose'),
    sha1 = require('sha1'),
    async = require('async');


module.exports = function(app, io, User, config){
    var gameObj = {};
    var players = [];
    var games = []; // all games on the game board
    var gameRooms = [];
    var chatMessages = []; //chat messages between game group
    var playerColors = ["yellow", "blue", "green", "red"];

    //game schemea for main game
    var gameSchema = mongoose.Schema({
        gameStatus: {type: String, required: true},
        gameOwnerId: {type: String, required: true, unique: true},
        gameOwnerName: {type: String, required: true},
        gameOwner: {type: String, required: true},
        gameCanStart: {type: Boolean, required: true}
    });

    //user schema for every user joined the game
    var usersInGame = mongoose.Schema({
        gameId: {type: String, required: true},
        playerId: {type: String, required: true, unique: true},
        playerName: {type: String, required: true},
        gameOwner: {type: Boolean, required: true},
        playerReady: {type: Boolean, required: true},
        playerColor: {type: String, required: true}
    });


    /*var usersInGameCount = mongoose.Schema({
        gameId: {type: String, required: true},
        numberOfPlayers: {type: Number, required: true},
        gameOwner: {type: Boolean, required: true},
        gameCreated: {type: Boolean, required: true}
    });*/


    var Game = mongoose.model('games', gameSchema);
    var UsersGame = mongoose.model('usersInGame', usersInGame);
    //var UsersInGame = mongoose.model('usersInGameCount', usersInGameCount);

    var currentGame = [];

    io.on("connection", function(socket){
        var userId = socket.request.session.passport.user;
            gameObj.getGameObject(socket, userId);


            /*gameObj.joinRoom(socket, socket.request.session.passport.user);*/

    });

    gameObj.getGameObject = function(socket, userId){
        var runOnlyOnce = 0;
        Game.count({}, function(err, size){
            if(size){
                Game.find({}, function(err, gameList){
                if(!err){
                    if(gameList.length){
                        for(var game in gameList){
                            var gameRow = gameList[game]._doc;
                            var _gameId = gameRow.gameOwnerName + gameRow.gameOwnerId;

                            UsersGame.find({ gameId: _gameId }, function(err, players){
                                if(!err){
                                    games[_gameId] = [];
                                    games[_gameId].push({
                                        gameOwnerName: gameRow.gameOwnerName,
                                        usersInGameId: gameRow.gameOwnerId,
                                        gameId: _gameId,
                                        gameCanStart: gameRow.gameCanStart,
                                        game: {}
                                    });

                                    games[_gameId][0].game.players = [];

                                    var self = false,
                                        pColor = "";

                                    for(var player in players){
                                        if(players[player].playerId === userId){
                                            self = players[player].playerName;
                                            pColor = players[player].playerColor;
                                        }
                                        games[_gameId][0].game.players.push({
                                            userId: players[player].playerId,
                                            username: players[player].playerName,
                                            gameOwner: gameRow.gameOwner,
                                            playerReady: players[player].playerReady,
                                            playerColor: players[player].playerColor
                                        });
                                    }

                                    socket.game = games[_gameId];

                                    if(self) {
                                        socket.playerName = self;
                                        socket.playerColor = pColor;
                                    }

                                    if(gameRow.gameOwnerId === userId){
                                        socket.emit('createdGameResponse', games[_gameId][0]);
                                    }
                                    else {
                                        socket.broadcast.to(game).emit("joinedGameResponse", games[_gameId][0]);
                                        socket.emit('joinedGameResponse', games[_gameId][0]);
                                    }


                                    gameRooms.push(_gameId);
                                    socket.join(_gameId);

                                    getAllCreatedGames();

                                    socket.broadcast.to(game).emit("getPlayersInTheGameResponse", { players: players } );
                                    socket.emit('getPlayersInTheGameResponse', { players: players });

                                    if(!runOnlyOnce){

                                        gameObj.getPlayersInTheGame(socket, userId);

                                        gameObj.joinCurrentGame(socket, userId);

                                        gameObj.createGame(socket, userId);

                                        gameObj.leaveCurrentGame(socket, userId);

                                        gameObj.userIsReadyForGame(socket, userId);

                                        gameObj.canGameStart(socket, userId);

                                        gameObj.rollDice(socket, userId);

                                        gameObj.sendChatMsg(socket, userId);


                                        runOnlyOnce = 1;
                                    }
                                }

                            });
                        }
                    }
                }

            });
        }
        else {
            gameObj.joinCurrentGame(socket, userId);

            gameObj.createGame(socket, userId);

            gameObj.leaveCurrentGame(socket, userId);

            gameObj.userIsReadyForGame(socket, userId);

            gameObj.canGameStart(socket, userId);

            gameObj.rollDice(socket, userId);

            gameObj.sendChatMsg(socket, userId);

            gameObj.getPlayersInTheGame(socket, userId);

            //socket.emit('getPlayersInTheGame', {});
        }

        });
    };

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
                        gameOwnerName: userObj.username,
                        gameOwner: true,
                        gameCanStart: false
                    }, function(err, game){
                        var gameId = userObj.username + userId;
                        var gameCreated = game; // when game is created this object will be returned
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
                                playerName: userObj.username,
                                gameOwner: true,
                                playerReady: false,
                                playerColor: playerColors[0]
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
                                        usersInGameId: gameCreated.gameOwnerId,
                                        gameId: gameNameId,
                                        gameCanStart: gameCreated.gameCanStart,
                                        game: {}
                                    });

                                    games[gameNameId][0].game.players = [];
                                    games[gameNameId][0].game.players.push({
                                        userId: userId,
                                        username: userObj.username,
                                        gameOwner: gameCreated.gameOwner,
                                        playerReady: game.playerReady,
                                        playerColor: game.playerColor
                                    });

                                    socket.playerName = userObj.username;

                                    socket.playerColor = game.playerColor;

                                    socket.game = games[gameNameId];

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
                                    gameId: game,
                                    playerId: userId,
                                    playerName: user.username,
                                    gameOwner: false,
                                    playerReady: false,
                                    playerColor: playerColors[games[game][0].game.players.length]
                                }, function(err, userInGame){
                                    if(!err){
                                        var userObj = user;
                                        games[game][0].gameCanStart = false;
                                        games[game][0].game.players.push({
                                            userId: userId,
                                            username: user.username,
                                            gameOwner: false,
                                            playerReady: false,
                                            playerColor: userInGame.playerColor
                                        });

                                        socket.playerName = user.username;

                                        socket.playerColor = userInGame.playerColor;

                                        socket.game = games[game][0];

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

                        socket.game = {};

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
                            Game.update()
                            gameCanStart = gameStartStatuses[status];
                        }
                    }

                    games[game.id][0].gameCanStart = gameCanStart;

                    socket.game = games[game.id];

                    socket.broadcast.to(game.id).emit("joinedGameResponse", games[game.id][0]);
                    socket.emit('joinedGameResponse', games[game.id][0]);
                }
            });
        });
    };

    gameObj.canGameStart = function(socket, userId){
        socket.on('canGameStart', function() {
            if(socket.game[0].gameCanStart){
                socket.broadcast.to(socket.game[0].gameId).emit("redirectToTheGame", { goToTable: true } );
                socket.emit('redirectToTheGame', { goToTable: true });
            }
        })
    };

    gameObj.rollDice = function(socket, userId){
        socket.on('rollDice', function() {
            var randomNumber = Math.floor(Math.random()*6) + 1;
            socket.broadcast.to(socket.game[0].gameId).emit("newDiceNumber", { diceNumber: randomNumber } );
            socket.emit('newDiceNumber', { diceNumber: randomNumber });
        });
    };

    gameObj.sendChatMsg = function(socket, userId){
        socket.on('sendChatMsg', function(msg) {
            chatMessages.push({
                sender: socket.playerName,
                text: msg.msg,
                color: socket.playerColor
            });
            socket.broadcast.to(socket.game[0].gameId).emit("getAllChatMsg", chatMessages);
            socket.emit('getAllChatMsg', chatMessages);
        });
    }

    gameObj.getPlayersInTheGame = function(socket, userId){
      socket.on('getPlayersInTheGame', function(){
          var players = socket.game[0].game.players;
          socket.broadcast.to(socket.game[0].gameId).emit("getPlayersInTheGameResponse", { players: players } );
          socket.emit('getPlayersInTheGameResponse', { players: players });
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
            else {89
                var gameNames = [];
                for(game in allGames){
                    gameNames[game] = {
                        gameId: allGames[0]._doc.gameOwnerName + allGames[0]._doc.gameOwnerId,
                        gameName: allGames[0]._doc.gameOwnerName
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
                        gameId: games[game]._doc.gameOwnerName + games[game]._doc.gameOwnerId,
                        gameName: games[game]._doc.gameOwnerName
                    };
                }
                io.sockets.emit('availableGames', {
                    games: gameNames
                });
            }
        });
    }

};