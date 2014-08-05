'use strict';

angryApp.controller('verifyAccount', ['$scope', '$routeParams', 'usersService', function($scope, $routeParams, usersService){
    usersService.verifyUserAccount($routeParams.id).then(
        function(data){
            $scope.verificationMsg = data.msg;
        },
        function(status){
            $scope.verificationMsg = status.msg;
        }
    );
}]);