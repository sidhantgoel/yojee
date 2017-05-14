(function () {
    'use strict';

    angular.module('TabsApp')
        .controller('TabsController', ['$scope', '$route', '$routeParams',
            function ($scope, $route, $routeParams) {
                $scope.route = $route;
                $scope.routeParams = $routeParams;
                $scope.location = $location;

            }]);
})();
