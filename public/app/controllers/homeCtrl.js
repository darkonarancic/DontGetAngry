angryApp.controller('homeCtrl', ['$scope', 'gameService', '$location', function($scope, gameService, $location){
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
                var modal = document.getElementById('gamePlayersModal');
                var style = window.getComputedStyle(modal);

                if(data){

                    if(style.display === 'none'){
                        $(modal).modal('show');
                    }

                    $scope.currentGameObj = data;
                }
                else {

                    if(style.display === 'block'){
                        $(modal).modal('hide');
                    }

                    $scope.currentGameObj = "";
                }
                $scope.joiningGame();
            },
            function(status){
                console.log(status);
            }
        );
    };

    $scope.playerReady = function(gameId){
      gameService.userIsReady(gameId);
    };

    /*$scope.closeGame = function(){
        gameService.closeTheGame().then(
            function(data){
                var modal = document.getElementById('gamePlayersModal');
                var style = window.getComputedStyle(modal);

                if(style.display === 'block'){
                    $(modal).modal('hide');
                }

                $scope.currentGameObj = "";
            },
            function(status){

            }
        );
    };*/

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
            if(data){
                $('#gamePlayersModal').modal('show');
                $scope.currentGameObj = data;
            }
            else {
                $('#gamePlayersModal').modal('hide');
                $scope.currentGameObj = "";
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

    $scope.leaveGame = function(gameId){
        gameService.leaveCurrentGame(gameId);
    };

    $scope.startGame = function(){
        $location.path('/game');
    };

    $scope.getTheGame();
    $scope.joiningGame();

}]);