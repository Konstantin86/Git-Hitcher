/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/scripts/angular-local-storage.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/const/appConst.js"/>

"use strict";

app.service("authInterceptorService", ["$q", "$location", "localStorageService", "appConst", function ($q, $location, localStorageService, appConst) {

    var request = function (config) {
        config.headers = config.headers || {};

        if (config.url.indexOf("photo") > -1) {
            config.headers["Content-Type"] = "multipart/form-data";
        }

        if (config.url.indexOf(appConst.serviceBase) !== -1) {
            var authData = localStorageService.get("authorizationData");
            if (authData) {
                config.headers.Authorization = "Bearer " + authData.token;
            }
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