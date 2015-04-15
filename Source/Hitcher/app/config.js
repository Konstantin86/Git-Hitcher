/// <reference path="~/scripts/angular.min.js"/>

/// <reference path="~/app/app.js"/>

"use strict";

app.config(function ($routeProvider) {
    //$routeProvider.when("/home", {
    //    controller: "homeController",
    //    templateUrl: "app/views/home.html"
    //});

    $routeProvider.when("/login", {
        controller: "loginController",
        templateUrl: "/app/views/login.html"
    });

    $routeProvider.when("/signup", {
        controller: "signupController",
        templateUrl: "/app/views/signup.html"
    });

    $routeProvider.otherwise({ redirectTo: "/home" });
});

app.config(function($asideProvider) {
    angular.extend($asideProvider.defaults, {
        container: "body",
        html: true
    });
})