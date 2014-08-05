angryApp.controller('angryAppMainCtrl', ['$scope', 'angryRoute', 'usersService', function($scope, angryRoute, usersService){
    usersService.isUserLoggedIn().then(
        function(data){
        usersService.userData.session.username = data.user.username;
            usersService.userData.session.sessionState = true;
            usersService.redirectUser(data);
        },
        function(status){
            usersService.redirectUser(status.status);
        }
    );

    $scope.logOut = function(){
        usersService.logOutUser();
    };

    //angryRoute.checkUser();
}]);