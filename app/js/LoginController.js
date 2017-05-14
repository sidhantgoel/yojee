(function () {
    'use strict';
    angular.module('TabsApp')
        .controller('LoginController', ['$scope', '$http', '$mdDialog', '$location', 'LoginService',
            function ($scope, $http, $mdDialog, $location, LoginService) {
                $scope.logindata = {username: '', password: ''};
                $scope.submit = function (valid) {
                    if (valid) {
                        $http.post('http://yojee.hexcod.in/authenticate', $scope.logindata).then(function (response) {
                            if(response.data.success === true) {
                                LoginService.setToken(response.data.token);
                                $location.path('/' + response.data.userid + '/balance');
                            } else {
                                $mdDialog.show(
                                    $mdDialog.alert()
                                        .clickOutsideToClose(true)
                                        .title('Login failed')
                                        .textContent('Please check your username and password and try again.')
                                        .ariaLabel('Login failed')
                                        .ok('Got it!')
                                );
                            }
                        },
                        function (response) {
                            $mdDialog.show(
                                $mdDialog.alert()
                                    .clickOutsideToClose(true)
                                    .title('Login failed')
                                    .textContent('Please check your username and password and try again.')
                                    .ariaLabel('Login failed')
                                    .ok('Got it!')
                            );
                        });
                    }
                };
            }]);
})();
