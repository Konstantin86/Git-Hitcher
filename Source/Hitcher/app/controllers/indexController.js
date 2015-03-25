/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/services/statusService.js"/>

"use strict";

app.controller("indexController", function ($scope, $location,  statusService) {
    $scope.state = statusService.state;

    $scope.closeAlert = function () { statusService.clear(); };

    $scope.logout = function () {
        //authService.logout();
        $location.path("/home");
    }

    //$scope.userData = authService.userData;
});