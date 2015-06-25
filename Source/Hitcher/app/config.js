/// <reference path="~/scripts/angular.min.js"/>

/// <reference path="~/app/app.js"/>

"use strict";

app.config(["$routeProvider", function ($routeProvider) {
    $routeProvider.when("/map", {
        controller: "mapController"
    });

    $routeProvider.when("/home", {
        controller: "homeController",
        templateUrl: "app/views/home.html"
    });

    $routeProvider.when("/login", {
        controller: "loginController",
        templateUrl: "/app/views/login.html"
    });

    $routeProvider.when("/signup", {
        controller: "signupController",
        templateUrl: "/app/views/signup.html"
    });

    $routeProvider.when("/account", {
        controller: "accountController",
        templateUrl: "/app/views/account.html"
    });

    $routeProvider.otherwise({ redirectTo: "/home" });
}]);

app.config(["$httpProvider", function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptorService');
}]);

app.config(["flowFactoryProvider", "appConst", function (flowFactoryProvider, appConst) {
    flowFactoryProvider.defaults = {
        target: "/api/blob/upload",
        testChunks: false,
        permanentErrors: [404, 500, 501],
        maxChunkRetries: 1,
        chunkRetryInterval: 5000,
        simultaneousUploads: 4,
        singleFile: true
    };

    flowFactoryProvider.on("catchAll", function () {
        console.log("catchAll", arguments);
    });
}]);

app.config(["$asideProvider", function($asideProvider) {
    angular.extend($asideProvider.defaults, {
        container: "body",
        html: true
    });
}]);