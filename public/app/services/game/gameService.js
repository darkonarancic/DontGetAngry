angryApp.service('gameService', ['usersService', '$q', '$http', function(usersService, $q, $http){
    return {
        availableGames: {
            games: ""
        },
        gameObj:{
            gameId: ""
        },
        getSessionDetails: function(){
            return usersService.userData.session;
        },
        createGame: function(){
            var io = this.getSocket().getInstance(),
                deferred = $q.defer();

            io.emit('createGame', function(data){
                deferred.resolve(data);
            });

            return deferred.promise;
        },
        getSocket: function(){
            var socket = null;

            return {
                getInstance: function(){
                    if(socket){
                        return socket;
                    }
                    else {
                        return socket = io.connect();
                    }
                }
            }
        },
        getNewGame: function(){
            var io = this.getSocket().getInstance(),
                deferred = $q.defer();

            io.on('availableGames', function(data){
                deferred.resolve(data.games);
            });

            return deferred.promise;
        },
        getAllGames: function(){
            var deferred = $q.defer();

            $http.post('/getAllGames')
                .success(function(data){
                    deferred.resolve(data);
                })
                .error(function(status){
                    deferred.reject(status);
                });

            return deferred.promise;
        },
        createYouOwnGame: function(){
            var io = this.getSocket().getInstance(),
                deferred = $q.defer();

            io.on('createdGameResponse', function(data){
                deferred.resolve(data);
            });

            return deferred.promise;
        },
        joinGame: function(id){
            var io = this.getSocket().getInstance();

            io.emit('join', { id: id });
        },
        joiningGameResponse: function(){
            var io = this.getSocket().getInstance(),
                deferred = $q.defer();

            io.on('joinedGameResponse', function(data){
                deferred.resolve(data);
            });

            return deferred.promise;
        },
        leaveCurrentGame: function(gameId){
            var io = this.getSocket().getInstance();

            io.emit('leave', { id: gameId});
        },
        userIsReady: function(gameId){
            var io = this.getSocket().getInstance();

            io.emit('userIsReady', { id: gameId });
        },
        goToGame: function(){
            var io = this.getSocket().getInstance(),
                deferred = $q.defer();

            io.on('redirectToTheGame', function(data){
                deferred.resolve(data);
            });

            return deferred.promise;
        },
        redirectUsersToTheGame: function(){
            var io = this.getSocket().getInstance();

            io.emit('canGameStart', { });
        },
        rollDice: function(){
            var io = this.getSocket().getInstance();

            io.emit('rollDice', { });
        },
        getDiceNumber: function(){
            var io = this.getSocket().getInstance(),
                deferred = $q.defer();

            io.on('newDiceNumber', function(data){
                deferred.resolve(data);
            });

            return deferred.promise;
        },
        removeGames: function(){
            var deferred = $q.defer();

            $http.post('/removeAllGames')
                .success(function(data){
                    deferred.resolve(data);
                })
                .error(function(status){
                    deferred.reject(status);
                });

            return deferred.promise;
        },
        sendChatMsg: function(msg){
            var io = this.getSocket().getInstance();

            io.emit('sendChatMsg', { msg: msg });
        },
        getChatMsg: function(){
            var io = this.getSocket().getInstance(),
                deferred = $q.defer();

            io.on('getAllChatMsg', function(data){
                deferred.resolve(data);
            });

            return deferred.promise;
        },
        getAllPlayers: function(){
            var io = this.getSocket().getInstance();

            io.emit('getPlayersInTheGame', { });
        },
        getAllPlayersRespond: function(){
            var io = this.getSocket().getInstance(),
                deferred = $q.defer();

            io.on('getPlayersInTheGameResponse', function(data){
                deferred.resolve(data);
            });

            return deferred.promise;
        }
    }
}]);