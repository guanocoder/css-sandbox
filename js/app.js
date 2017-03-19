// module
var chicklistApp = angular.module('chicklistApp', ['ngRoute', 'ngResource']);

// routes
chicklistApp.config(function($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'pages/chicklist.html',
        controller: 'listController'
    })
    .when('/create', {
        templateUrl: 'pages/chick-create.html',
        controller: 'createController'
    })
    .when('/update', {
        templateUrl: 'pages/chick-update.html',
        controller: 'updateController'
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


// controllers
chicklistApp.controller('listController', ['$scope', '$location', 'chickService', function($scope, $location, chickService) {


    chickService.query(function(data) {
        $scope.chicks = data;
    });

    $scope.createChick = function() {
        $location.path('create');
    }

    $scope.updateChick = function(name) {
        $location.path('update').search({name: name});
    }
}]);

chicklistApp.controller('createController', ['$scope', '$location', 'chickService', function($scope, $location, chickService) {
    $scope.chick = new chickService();

    $scope.chickCreate = function() {
        $scope.chick.$save(function() {
            $location.path('/'); // goto chick list when done
        });
    }
}]);

chicklistApp.controller('updateController', ['$scope', '$routeParams', '$location', 'chickService', function($scope, $routeParams, $location, chickService) {
    $scope.chick = chickService.get({name: $routeParams.name});

    $scope.chickUpdate = function() {
        $scope.chick.$update(function() {
            $location.path('/'); // goto chick list when done
        });
    }
}]);