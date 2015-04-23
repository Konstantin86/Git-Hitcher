/// <reference path="~/scripts/angular.js" />
"use strict";

var app = angular.module("HitcherApp", ["ngRoute", "ngResource", "ngAnimate", "ngSanitize", "uiGmapgoogle-maps", "ui.bootstrap", "ui.bootstrap.tpls", "flow", "LocalStorageModule", "mgcrea.ngStrap", "angular-loading-bar", "infinite-scroll"]);
// Cordova modules: "ngCordova", "ngCordova.plugins.geolocation"

app.run(["authService", function (authService) {
    authService.init();
}]);