/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/services/mapService.js"/>
/// <reference path="~/app/services/statusService.js"/>

"use strict";

app.controller("indexController", function ($scope, $location, userService, mapService, statusService) {
    $scope.state = statusService.state;

    $scope.user = userService.user;

    var type;

    $scope.closeAlert = function () { statusService.clear(); };

    $scope.logout = function () {
        //authService.logout();
        $location.path("/home");
    }

    mapService.ready.then(function (gmaps) {
        $scope.$watch('user.type', function (value) {
            if (value != type) {
                mapService.showRoutes(value);
                type = value;
            }
        });
    });

    //$scope.userData = authService.userData;
});