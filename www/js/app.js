// module
var chicklistApp = angular.module('chicklistApp', ['ngRoute', 'ngResource']);

// routes
chicklistApp.config(function($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'pages/chicklist.html',
        controller: 'listController'
    })
    .when('/grid', {
        templateUrl: 'pages/chickgrid.html',
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
chicklistApp.service('chickResource', ['$resource', function($resource) {
    return $resource('/api/chicks/:name', { name: '@name'}, {
        update: {
            method: 'PUT'
        }
    })
}]);


chicklistApp.factory('chickService', ['$q', 'chickResource', function($q, chickResource) {

    let chicks = [];

    reloadChicks();

    function all() {
        return chicks;
    }

    function reloadChicks() {
        chicks.length = 0; // Clear array without losing reference because its being $watched by angular
        return loadChicks().then(function(data) {
            data.forEach(chick => {
                chicks.push(chick);
            });
        });
    }
    
    function loadChicks() {
        let deferred = $q.defer();
         chickResource.query(function(chicks) {
             deferred.resolve(chicks);
         }, function(error) {
             deferred.reject(error);
         });
        return deferred.promise;
    }

    function get(name) {
        let deferred = $q.defer();
        chickResource.get({ name: name }, function(chick) {
            deferred.resolve(chick);
        }, function(error) {
            deferred.reject(error);
        })
        return deferred.promise;
    };

    function add(chick) {
        let deferred = $q.defer();
        chick.$save(function () {
            deferred.resolve();
        }, function(error) {
            deferred.reject(error);
        })
        // update chicks
        return deferred.promise.then(reloadChicks);
    };

    function update(chick) {
        let deferred = $q.defer();
        chick.$update(function () {
            deferred.resolve();
        }, function(error) {
            deferred.reject(error);
        })
        // update chicks
        return deferred.promise.then(reloadChicks);
    };

    function remove(chick) {
        let deferred = $q.defer();
        chick.$delete(function () {
            deferred.resolve();
        }, function(error) {
            deferred.reject(error);
        })
        // update chicks
        return deferred.promise.then(reloadChicks);
    };

    return {
        Chick: chickResource, // Chick contructor reference
        all: all,
        get: get,
        add: add,
        update: update,
        remove: remove
    };

}]);


// controllers
chicklistApp.controller('listController', ['$scope', '$location', 'chickService', function($scope, $location, chickService) {

    $scope.chicks = chickService.all();

    $scope.createChick = function() {
        $location.path('create');
    }

    $scope.updateChick = function(name) {
        $location.path('update').search({name: name});
    }

    $scope.deleteChick = function(name) {
        chickService.get(name).then(chick => {
            chickService.remove(chick);
        });
    }
}]);

chicklistApp.controller('createController', ['$scope', '$location', 'chickService', function($scope, $location, chickService) {
    $scope.chick = new chickService.Chick();

    $scope.chickCreate = function() {
        chickService.add($scope.chick).then(() => {
            $location.path('/'); // goto chick list when done
        });
    }
}]);

chicklistApp.controller('updateController', ['$scope', '$routeParams', '$location', 'chickService', function($scope, $routeParams, $location, chickService) {
    //$scope.chick = chickService.get($routeParams.name);
    chickService.get($routeParams.name).then((chick) => {
        $scope.chick = chick;
    });

    $scope.chickUpdate = function() {
        chickService.update($scope.chick).then(() => {
            $location.path('/'); // goto chick list when done
        });
    }
}]);

chicklistApp.controller('menuController', ['$scope', 'chickService', function($scope, chickService) {
    $scope.chicks = chickService.all();
    $scope.menuIsHidden = true;

    $scope.toggleMenu = function() {
        $scope.menuIsHidden = !$scope.menuIsHidden;
    }
}]);