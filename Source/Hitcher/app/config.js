/// <reference path="~/scripts/angular.min.js"/>

/// <reference path="~/app/app.js"/>

"use strict";

app.config(function ($routeProvider) {
    $routeProvider.when("/home", {
        controller: "homeController",
        templateUrl: "app/views/home.html"
    });

    $routeProvider.when("/route", {
        controller: "routeController",
        templateUrl: "app/views/route.html"
    });

    $routeProvider.otherwise({ redirectTo: "/home" });
});