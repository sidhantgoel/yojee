(function () {
    'use strict';
    angular.module('TabsApp')
        .service('LoginService',
            function () {
                var token = null;

                this.setToken = function(t) {
                    token = t;
                };

                this.getToken = function() {
                    return token;
                };

                this.hasToken = function() {
                    return token !== null;
                };
            });
})();
