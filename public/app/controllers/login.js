'use strict';

angryApp.controller('loginCtrl', ['$scope', '$location', '$http', 'usersService', function($scope, $location, $http, usersService){
    $scope.msgLabel = usersService.userData.regMsg;
    $scope.msgStatus = usersService.userData.regStatus;
    $scope.msgShow = usersService.userData.msgShow;
    $scope.msgState = usersService.userData.msgState;

    $scope.tryLogin = function(){
        usersService.loginUser($scope.loginForm.username, $scope.loginForm.password).then(
            function(data){
                $scope.msgShow = usersService.userData.msgShow = true;
                usersService.userData.session.username = data.user.username;
                usersService.userData.session.sessionState = data.user.success;
                usersService.userData.msgState = data.user.msgState;

                $location.path('/home');
            },
            function(status){
                $scope.msgLabel = usersService.userData.regMsg = status.msg;
                $scope.msgStatus = usersService.userData.regStatus = !status.success;
                $scope.msgShow = usersService.userData.msgShow = true;
                $scope.msgState = status.msgState;
            }
        );
    };
}]);