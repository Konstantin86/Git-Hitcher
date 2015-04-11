/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/services/mapService.js"/>
/// <reference path="~/app/services/statusService.js"/>
/// <reference path="~/app/services/userService.js"/>
/// <reference path="~/app/services/searchService.js"/>

"use strict";

app.controller("searchController", function ($scope, $location, $aside, userService, searchService, routeService, mapService, statusService) {
    $scope.config = searchService.config;
});