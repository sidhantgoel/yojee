(function () {
    'use strict';
    angular.module('TabsApp')
        .controller('BalanceController', ['$scope', '$http', '$mdDialog', '$location', 'LoginService', '$routeParams',
            function ($scope, $http, $mdDialog, $location, LoginService, $routeParams) {
                if(!LoginService.hasToken()) {
                    $location.path('/login');
                    return;
                }
                var fetchBalance = function() {
                    $http.get('http://yojee.hexcod.in/' + $routeParams.id + '/balance?token=' + LoginService.getToken()).then(function (response) {
                        if(response.data.success === true) {
                            $scope.balance = response.data.balance;
                        } else {
                            $mdDialog.show(
                                $mdDialog.alert()
                                    .clickOutsideToClose(true)
                                    .title('Failed to fetch balance')
                                    .textContent('Failed to fetch balance, please try again.')
                                    .ariaLabel('Failed to fetch balance')
                                    .ok('Got it!')
                            );
                        }
                    },
                    function (response) {
                        $mdDialog.show(
                            $mdDialog.alert()
                                .clickOutsideToClose(true)
                                .title('Failed to fetch balance')
                                .textContent('Failed to fetch balance, please try again.')
                                .ariaLabel('Failed to fetch balance')
                                .ok('Got it!')
                        );
                    });
                };

                $scope.recharge = function(valid) {
                    if (valid) {
                        $http.post('http://yojee.hexcod.in/' + $routeParams.id + '/recharge?token=' + LoginService.getToken(), {'amount': parseInt($scope.rechargeAmount)}).then(function (response) {
                            if(response.data.success === true) {
                                $mdDialog.show(
                                    $mdDialog.alert()
                                        .clickOutsideToClose(true)
                                        .title('Recharge Successful')
                                        .textContent('Your account has been recharged.')
                                        .ariaLabel('Recharge Successful')
                                        .ok('Got it!')
                                );
                                $scope.rechargeAmount = '0';
                                //fetchBalance();
                            } else {
                                $mdDialog.show(
                                    $mdDialog.alert()
                                        .clickOutsideToClose(true)
                                        .title('Recharge failed')
                                        .textContent('Please try again.')
                                        .ariaLabel('Recharge failed')
                                        .ok('Got it!')
                                );
                            }
                        },
                        function (response) {
                            $mdDialog.show(
                                $mdDialog.alert()
                                    .clickOutsideToClose(true)
                                    .title('Recharge failed')
                                    .textContent('Please try again.')
                                    .ariaLabel('Recharge failed')
                                    .ok('Got it!')
                            );
                        });
                    }
                };

                /**
         * Function to Continously retry to execute SNAP popup if fail, with 1000ms delay between retry.
         * @param string $snap_token - Token generated from SNAP API call.
         * @param string $is_production - Is this production transaction or sandbox transaction.
         */
        function execSnapCont(snap_token,is_production){
            var callbackTimer = setInterval(function() {
                var snapExecuted = false;
                try{
                    snap.pay(snap_token,
                    {
                        onSuccess: function(result){
                            //console.log(result);
                            //window.location = result.finish_redirect_url;
                            //alert('success');
                        },
                        onPending: function(result){
                            //console.log(result);
                            //window.location = result.pdf_url;
                        },
                        onError: function(result){
                            //console.log(result);
                            // window.location = result.finish_redirect_url;
                            //execSnapCont(snap_token,is_production);
                        },
                        onClose: function(result){
                            // window.history.back();
                            //execSnapCont(snap_token,is_production);
                        }

                    });
                    snapExecuted = true; // if SNAP popup executed, change flag to stop the retry.
                } catch (e){
                    console.log(e);
                    console.log('Snap not ready yet... Retrying in 1000ms!');
                }
                if (snapExecuted) {
                    clearInterval(callbackTimer);
                }
            }, 1000);
        }

                $scope.spend = function(valid) {
                    if (valid) {
                        $http.post('http://yojee.hexcod.in/' + $routeParams.id + '/transaction?token=' + LoginService.getToken(), {'amount': parseInt($scope.spendAmount)}).then(function (response) {
                            if(response.data.success === true) {
                                if(response.data.redirect === true) {
                                    execSnapCont(response.data.token, false);
                                } else {
                                    $mdDialog.show(
                                        $mdDialog.alert()
                                            .clickOutsideToClose(true)
                                            .title('Spend Successful')
                                            .textContent('Amount deducted from your wallet.')
                                            .ariaLabel('Spend Successful')
                                            .ok('Got it!')
                                    );
                                    $scope.spendAmount = '0';
                                    //fetchBalance();
                                }
                            } else {
                                $mdDialog.show(
                                    $mdDialog.alert()
                                        .clickOutsideToClose(true)
                                        .title('Recharge failed')
                                        .textContent('Please try again.')
                                        .ariaLabel('Recharge failed')
                                        .ok('Got it!')
                                );
                            }
                        },
                        function (response) {
                            $mdDialog.show(
                                $mdDialog.alert()
                                    .clickOutsideToClose(true)
                                    .title('Recharge failed')
                                    .textContent('Please try again.')
                                    .ariaLabel('Recharge failed')
                                    .ok('Got it!')
                            );
                        });
                    }
                };

                setInterval(function() {
                    fetchBalance();
                }, 1000);

            }]);
})();
