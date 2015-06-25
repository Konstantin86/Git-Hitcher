/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/const/appConst.js"/>
/// <reference path="~/app/const/msgConst.js"/>
/// <reference path="~/app/services/mapService.js"/>
/// <reference path="~/app/services/authService.js"/>
/// <reference path="~/app/services/userService.js"/>

app.controller("controlCtrl", ["$scope", "mapService", "authService", "userService", function ($scope, mapService, authService, userService) {
    $scope.danger = false;
    $scope.userData = authService.userData;

    $scope.user = userService.user;

    $scope.authData = authService.userData;
    $scope.displayOptions = mapService.displayOptions;

    mapService.ready.then(function () {
        $scope.$watch("displayOptions.highlightMyRoutes", function () { mapService.updateHighlight(); });
    });

    $scope.addRoute = function () {
        mapService.addRoute();
    };

    $scope.handleCenterMe = function () {
        mapService.centerOnMe();
    };
}]);