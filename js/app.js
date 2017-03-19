// module
var chicklistApp = angular.module('chicklistApp', ['ngRoute', 'ngResource']);

// routes
chicklistApp.config(function($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'pages/chicklist.html',
        controller: 'chickController'
    });
})

// service
chicklistApp.service('chickService', ['$resource', function($resource) {
    return $resource('/api/chicks/:name', { name: '@name'}, {
        update: {
            method: 'PUT'
        }
    })
}]);

// controller
chicklistApp.controller('chickController', ['$scope', 'chickService', function($scope, chickService) {
    chickService.query(function(data) {
        $scope.chicks = data;
    });
}]);