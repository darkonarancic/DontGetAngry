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
        }
    }
}]);