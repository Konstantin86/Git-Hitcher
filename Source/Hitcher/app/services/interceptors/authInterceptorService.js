/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/scripts/angular-local-storage.js"/>
/// <reference path="~/app/app.js"/>

"use strict";

app.service("authInterceptorService", ["$q", "$location", "localStorageService", function ($q, $location, localStorageService) {

    var request = function (config) {
        config.headers = config.headers || {};

        if (config.url.indexOf("photo") > -1) {
            config.headers["Content-Type"] = "multipart/form-data";
        }

        var authData = localStorageService.get("authorizationData");
        if (authData) {
            config.headers.Authorization = "Bearer " + authData.token;
        }

        return config;
    }

    var responseError = function (rejection) {
        if (rejection.status === 401) {
            $location.path("/login");
        }
        return $q.reject(rejection);
    }

    this.request = request;
    this.responseError = responseError;
}]);