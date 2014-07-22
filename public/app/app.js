var angryApp = angular.module('app', ['ngResource', 'ngRoute']);
angryApp.config(function($routeProvider, $locationProvider){
    $locationProvider.html5Mode(true);
    $routeProvider.when('/', {
        templateUrl: '/partials/index',
        controller: 'loginCtrl'
    }).
    when('/sign-up', {
        templateUrl: '/partials/signup',
        controller: 'signUpCtrl'
    });
});


