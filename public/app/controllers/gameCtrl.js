angryApp.controller('gameCtrl', ['$scope', 'gameService', function($scope, gameService){
    $scope.user = gameService.getSessionDetails();
    $scope.game = {
        diceClass: "",
        diceFinalNumber: "",
        diceClickNumber: 0,
        playerTurn: "",
        despicableMe: {},
        myFigures: []
    };

    $scope.figure = {
        yellow: [],
        green: [],
        red: [],
        blue: []
    };

    $scope.chat = {};

    $scope.game.rollDice = function(){
       if($scope.game.diceClickNumber === 0){
           $scope.game.diceClickNumber = 1;
           $scope.game.despicableMe.canRoll = false;
           gameService.rollDice($scope.game.despicableMe.currentlyPlaying);
       }
    };

    $scope.game.getDice = function(){
        gameService.getDiceNumber().then(
            function(data){

                var randomNumber = data.diceNumber;

                var i = $scope.game.diceFinalNumber || 0;
                var dice = document.getElementById('dice');

                var interval = setInterval(function(){
                    dice = document.getElementById('dice');
                    if(i > 18){
                        clearInterval(interval);
                        dice.setAttribute("class", "die die" + randomNumber);
                        $scope.game.diceClickNumber = 0;
                    }
                    else {
                        dice.setAttribute("class", "die die" + i++);
                    }
                }, 30);

                $scope.game.diceFinalNumber = randomNumber;
                $scope.game.getDice();
            },
            function(status){}
        );
    };

    $scope.getChatMsg = function(){
        gameService.getChatMsg().then(
            function(data){
                $scope.chat.messages = data;
                $scope.getChatMsg();
                document.getElementById('msg-input').value = "";
                var objDiv = document.getElementById("chat-history");
                objDiv.scrollTop = objDiv.scrollHeight;
            },
            function(status){}
        );
    };

    gameService.getAllPlayersRespond().then(
        function(data){
            if(data){
                $scope.game.players = data.players;
                $scope.game.playerTurn = data.players[0].currentlyPlaying;

                angular.forEach($scope.game.players, function(value, key) {
                   if(value.username === $scope.user.username) {
                        $scope.game.despicableMe = value;
                   }
                });

                $scope.sortFigures();
            }
            else {
                gameService.getAllPlayers();
            }
        },
        function(status){

        }
    );

    gameService.getGameRespond().then(
        function(data){
            $scope.game.gameObj = data[0];
            gameService.getGameRespond();
        },
        function(status){

        }
    );

    $scope.sendChatMsg = function(){
        var msg = document.getElementById('msg-input').value;
        gameService.sendChatMsg(msg);
    };

    $scope.sortFigures = function(){
        for(player in $scope.game.players){
            var current = $scope.game.players[player].username === $scope.user.username ? true : false;
            for(figure  in $scope.game.players[player].gameState.figures){
                $scope.game.moveFigureToNewPosition($scope.game.players[player].gameState.figures[figure], figure, $scope.game.players[player].playerColor, current, player);
            }
        }
        console.log($scope.figure);
    };

    $scope.mainGameListener = function(){
        gameService.mainGameListenerRespond().then(
            function(data){

                $scope.game.gameObj = data;

                $scope.game.players = data.game.players;
                $scope.game.hardSetDiceNumber(data.game.diceNumber);
                $scope.game.playerTurn = data.game.players[0].currentlyPlaying;

                angular.forEach($scope.game.players, function(value, key) {
                    if(value.username === $scope.user.username) {
                        $scope.game.despicableMe = value;
                    }
                });

                $scope.game.moveFigures();

                $scope.mainGameListener();
            },
            function(){
            }
        );
    };

    $scope.moveFigure = function(figure){
        var self = $('#'+figure);
        var index = parseInt($(self).attr('findex'));
        var current =  $scope.game.despicableMe.gameState.figures[index];

        if(current === 0){
            $scope.game.despicableMe.gameState.figures[index] = $scope.game.despicableMe.gameState.startPoint;
        }
        else {
            $scope.game.despicableMe.gameState.figures[index] = current + parseInt($scope.game.diceFinalNumber);
        }

        gameService.movePlayer($scope.game.despicableMe);
    };

    $scope.game.moveFigures = function(){
        for(player in $scope.game.players){
            var current = $scope.game.players[player].username === $scope.user.username ? true : false;
            for(figure  in $scope.game.players[player].gameState.figures){
                $scope.game.moveFigureToNewPosition($scope.game.players[player].gameState.figures[figure], figure, $scope.game.players[player].playerColor, current, player);
            }
        }
    };

    $scope.game.moveFigureToNewPosition = function(position, index, color, current, playerIndex){

        var playerColor = color.substring(0,1);

        if(position !== 0){
            var element = $('.figure-map');
            var figArray = {
                top: $('.' + playerColor + position, element).position().top - 15,
                left: $('.' + playerColor + position, element).position().left
            };

            if(color === "yellow"){
                $scope.figure.yellow[index] = figArray;
            }
            else if(color === "blue"){
                $scope.figure.blue[index] = figArray;
            }
            else if(color === "green"){
                $scope.figure.green[index] = figArray;
            }
            else if(color === "red"){
                $scope.figure.red[index] = figArray;
            }

        }
        else {
            var element = $('#house'+ ( parseInt(playerIndex) + 1));

            var figArray = {
                top: $('#hf' + (parseInt(index) + 1), element).position().top + $(element).position().top - 15,
                left: $('#hf' + (parseInt(index) + 1), element).position().left + $(element).position().left
            };

            if(color === "yellow"){
                $scope.figure.yellow[index] = figArray;
            }
            else if(color === "blue"){
                $scope.figure.blue[index] = figArray;
            }
            else if(color === "green"){
                $scope.figure.green[index] = figArray;
            }
            else if(color === "red"){
                $scope.figure.red[index] = figArray;
            }
        }
    };

    $scope.game.hardSetDiceNumber = function(number){
        $scope.game.diceFinalNumber = number;
        document.getElementById('dice').setAttribute("class", "die die" + number);
    }

    $scope.mainGameListener();
    $scope.game.getDice();
    $scope.getChatMsg();
    gameService.getAllPlayers();
    gameService.getGame();
}]);