var mongoose = require('mongoose'),
    sha1 = require('sha1');


module.exports = function(app, server){
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
    var UsersInGame = mongoose.model('UsersInGameCount', usersInGameCount);

    var io = require('socket.io').listen(server);

    io.on('connection', function (socket) {
        socket.emit('Welcome!');

    });

    app.post('/createGame', function(req, res){
        var gameStatus = "";
        Game.count({ gameOwnerId: req.user._id }, function(err, count){
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
                    gameOwnerId: req.user._id
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
                            playerId: req.user._id
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
                                    gameOwner: req.user.username
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
                                        res.json({
                                            gameStatus: gameStatus
                                        });;
                                    }
                                });

                            }
                        });
                    }
                });
            }
        });

    });

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
                res.json({ games: games });
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
                io.sockets.emit('availableGames', {
                    games: games
                });
            }
        });
    }
};