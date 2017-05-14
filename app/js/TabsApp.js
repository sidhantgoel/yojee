(function () {
    'use strict';
    // Prepare the 'users' module for subsequent registration of controllers and delegates
    angular.module('TabsApp', ['ngMaterial', 'ngRoute'])
        .config(function ($mdThemingProvider, $mdIconProvider) {
            //$mdThemingProvider.theme('default')
            //    .primaryPalette('green')
            //    .accentPalette('teal');
            //$mdIconProvider.icon('menu', './assets/svg/menu.svg');

        }).config(function ($routeProvider) {
            $routeProvider.when('/login', {
                'controller': 'LoginController',
                'templateUrl': 'templates/login.html'
            })
            .when('/:id/balance', {
                'controller': 'BalanceController',
                'templateUrl': 'templates/balance.html'
            });
            $routeProvider.otherwise('/login');
        });
})();
