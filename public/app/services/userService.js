'use strict';

angryApp.factory('usersService', function($http, $q){
   return {
       userData: {
           regMsg: "",
           regStatus: false
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
       }
   }
});