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
                deferre = $q.defer();

            io.emit('createGame', function(data){
                deferre.resolve(data);
            });

            return deferre.promise;
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
                deferre = $q.defer();

            io.on('availableGames', function(data){
                deferre.resolve(data.games);
            });

            return deferre.promise;
        },
        getAllGames: function(){
            var deferre = $q.defer();

            $http.post('/getAllGames')
                .success(function(data){
                    deferre.resolve(data);
                })
                .error(function(status){
                    deferre.reject(status);
                });

            return deferre.promise;
        },
        createYouOwnGame: function(){
            var io = this.getSocket().getInstance(),
                deferre = $q.defer();

            io.on('createdGameResponse', function(data){
                deferre.resolve(data);
            });

            return deferre.promise;
        },
        joinGame: function(id){
            var io = this.getSocket().getInstance();

            io.emit('join', { id: id });
        },
        joiningGameResponse: function(){
            var io = this.getSocket().getInstance(),
                deferre = $q.defer();

            io.on('joinedGameResponse', function(data){
                deferre.resolve(data);
            });

            return deferre.promise;
        }
    }
}]);