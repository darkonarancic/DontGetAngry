angryApp.service('gameService', ['usersService', '$q', '$http', function(usersService, $q, $http){
    return {
        availableGames: {
            games: ""
        },
        getSessionDetails: function(){
            return usersService.userData.session;
        },
        createGame: function(){
            var deferre = $q.defer();

            $http.post('/createGame')
            .success(function(data){
                deferre.resolve(data);
            })
            .error(function(status){
                deferre.reject(status);
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
        }
    }
}]);