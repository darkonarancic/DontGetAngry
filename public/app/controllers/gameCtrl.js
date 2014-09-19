angryApp.controller('gameCtrl', ['$scope', 'gameService', function($scope, gameService){

    $scope.game = {
        diceClass: "",
        diceFinalNumber: ""
    };

    $scope.game.rollDice = function(){
       var randomNumber = Math.floor(Math.random()*6) + 1;
       var i = $scope.game.diceFinalNumber || 0;
       var dice = document.getElementById('dice');
      /* for(i; i <=18; i++){
           //$scope.game.diceClass = "die" + i;
           dice.setAttribute("class", "die die" + i);
       }*/
       //$scope.game.diceClass = "die" + randomNumber;

        var interval = setInterval(function(){
            if(i > 18){
                clearInterval(interval);
                dice.setAttribute("class", "die die" + randomNumber);
            }
            else {
                dice.setAttribute("class", "die die" + i++);
            }
        }, 30);

       $scope.game.diceFinalNumber = randomNumber;
    };
}]);