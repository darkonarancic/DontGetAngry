angryApp.controller('signUpCtrl', ['$scope', '$location', 'usersService', function($scope, $location, usersService){
    $scope.addNewUser = function(){
        $scope.registerNewUser = usersService.addUser($scope.username, $scope.email, $scope.password);
        $scope.registerNewUser.then(function(status){
               $location.path('/');
            },function(status){
                console.log(status);
            }
        );
    };
}]);