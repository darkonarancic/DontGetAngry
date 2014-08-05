'use strict';

angryApp.factory('usersService', ['$http', '$q', '$resource', '$location', function($http, $q, $resource, $location){
   return {
       userData: {
           regMsg: "",
           regStatus: false,
           msgShow: false,
           msgState: false,
           session: {
               username: "",
               sessionState: false
           }
       },
       addUser: function (username, email, password){
           var deferred = $q.defer();

           $http.post('/addNewUser', {
               username: username,
               email: email,
               password: password
           }).success(function(data){
               deferred.resolve(data);
           }).error(function(status){
               deferred.reject(status);
           });

           return deferred.promise;
       },
       verifyUserAccount: function(id){
           var deferred = $q.defer();

           $http.post('/verifyUser', {
               id: id
           }).success(function(data){
               deferred.resolve(data);
           }).error(function(status){
               deferred.reject(status);
           });

           return deferred.promise;
       },
       loginUser: function(username, password){
           var deferred = $q.defer();

           $http.post('/getUser', {
               username: username,
               password: password
           }).success(function(data){
               deferred.resolve(data);
           }).error(function(status){
               deferred.reject(status);
           });

           return deferred.promise;
       },
       isUserLoggedIn: function(){
           var deferred = $q.defer();

           $http.post('/checkLoggedUser')
           .success(function(data){
               deferred.resolve(data);
           })
           .error(function(status){
               deferred.reject(status);
           });

           return deferred.promise;
       },
       logOutUser: function(){
           var self = this;
           $http.post('/logout').success(function(data){
                   if(data.status){
                       self.userData.msgShow = !data.status;
                       $location.path('/');
                   }
               });
       },
       redirectUser: function(status){
            //if user is logged in, status will be set to "true"
            if($location.path().indexOf('/verify') !== -1){
                return;
            }
            if(!status){
                $location.path('/');
            }
            else if($location.path() === '/'){
                $location.path('/home');
            }
       }
   }
}]);