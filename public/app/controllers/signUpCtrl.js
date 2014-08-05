'use strict';

angryApp.controller('signUpCtrl', ['$scope', '$location', 'usersService', function($scope, $location, usersService){
    $scope.addNewUser = function(){
        usersService.addUser($scope.username, $scope.email, $scope.password).then(
            function(data){
                $location.path('/');
                $scope.msgLabel = usersService.userData.regMsg = data.msg;
                $scope.status = usersService.userData.regStatus = data.status;
                $scope.msgShow = usersService.userData.msgShow = true;
                $scope.msgState = usersService.userData.msgState = data.msgState;
            },function(status){
                $scope.msgLabel = usersService.userData.regMsg = status.msg;
                $scope.status = usersService.userData.regStatus = status.status;
                $scope.msgState = usersService.userData.msgState = status.msgState;
            }
        );
    };
}]);