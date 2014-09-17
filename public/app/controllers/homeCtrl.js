angryApp.controller('homeCtrl', ['$scope', 'gameService', function($scope, gameService){
    $scope.user = gameService.getSessionDetails();
    $scope.gameObj = {};

    $scope.createNewGame = function(){
        gameService.createGame().then(
            function(data){
                console.log(data);
            },
            function(status){
                console.log(status);
            }
        );
    };

    $scope.getTheGame = function(){
        gameService.getNewGame().then(
            function(data){
                $scope.gameObj = {
                    games: data
                };
                $scope.getTheGame();
            }
        );
    };

    $scope.joinExistingGame = function(button){
        gameService.joinGame(button.game.gameId);
    };

    $scope.joiningGame = function(){
        gameService.joiningGameResponse().then(
            function(data){
                console.log(data);
                $scope.joiningGame();
            },
            function(status){
                console.log(status);
            }
        );
    };

    gameService.getAllGames().then(
        function(data){
            $scope.gameObj.games = data.games;
        },
        function(status){
            $scope.gameObj.games = null;
        }
    );

    gameService.createYouOwnGame().then(
        function(data){
            console.log(data);

            if(data.gameCreated){
                $('#gamePlayersModal').modal('show');
                $scope.currentGameObj = data;
            }
        },
        function(status){
            console.log(status);
        }
    );

    $scope.clearBoard = function(){
        gameService.removeGames().then(
            function(data){
                console.log(data);
            },
            function(status){
                console.log(status);
            }
        );
    };

    $scope.getTheGame();
    $scope.joiningGame();

}]);