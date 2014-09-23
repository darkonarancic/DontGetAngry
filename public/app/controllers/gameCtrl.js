angryApp.controller('gameCtrl', ['$scope', 'gameService', function($scope, gameService){
    $scope.user = gameService.getSessionDetails();
    $scope.game = {
        diceClass: "",
        diceFinalNumber: "",
        diceClickNumber: 0
    };

    $scope.chat = {};

    $scope.game.rollDice = function(){
       if($scope.game.diceClickNumber === 0){
           $scope.game.diceClickNumber = 1;
           gameService.rollDice();
       }
    };

    $scope.game.getDice = function(){
        gameService.getDiceNumber().then(
            function(data){

                var randomNumber = data.diceNumber;

                var i = $scope.game.diceFinalNumber || 0;
                var dice = document.getElementById('dice');

                var interval = setInterval(function(){
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
                //$scope.sortFigures();
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
        var size = $scope.game.players.length;
        var colors = ["yellow", "blue", "green", "red"];

        for(var i = 0; i < size; i++){

            var element = $('#house'+ ( i + 1));

            for(var y = 0; y < 4; y++){
                var figure = $('#f' + (y+1) +'-' + colors[i]);

                $(figure).css({
                    top: $('#hf'+(y+1), element).position().top + $(element).position().top - 15,
                    left: $('#hf'+(y+1), element).position().left + $(element).position().left
                });
            }
        }
    };

    $scope.game.getDice();
    $scope.getChatMsg();
    gameService.getAllPlayers();
    gameService.getGame();
}]);