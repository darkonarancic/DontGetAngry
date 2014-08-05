angryApp.factory('angryRoute', ['$location', '$http', 'usersService',function($location, $http, usersService){
    return {
        checkUser: function(){
            if(!usersService.userData.session.sessionState){
                $location.path('/');
            }
        }
    }
}]);