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

    $scope.joiningGameResponse = function(){
        gameService.joiningGameResponse().then(
            function(data){
                console.log(data);
                $scope.joiningGameResponse();
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
        },
        function(status){
            console.log(status);
        }
    );

    $scope.getTheGame();
    $scope.joiningGameResponse();
}]);