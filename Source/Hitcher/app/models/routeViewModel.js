﻿/// <reference path="~/app/models/hitcher-ns.js"/>

hitcher.viewModels = (function () {

    var viewModel = function (route) {
        this.model = route;
        this.canDelete = route.isCurrentUserRoute;
        this.startName = route.startName;
        this.startTime = new Date(Date.parse(route.startTime)).toLocaleString();
        this.endName = route.endName;
        this.driver = route.name;
        this.phone = route.phone;
        this.distance = Math.floor(route.totalDistance / 1000) + " км, " + route.totalDistance % 1000 + " м";
        this.duration = route.totalDuration.toString().toHHMMSS();
        this.photoPath = route.photoPath;
    };

    //timeSpan.prototype.getSeconds = function () {
    //    return this.timeDiff / 1000;
    //};

    //timeSpan.prototype.getMinutes = function () {
    //    return this.timeDiff / (1000 * 60);
    //};

    //timeSpan.prototype.getHours = function () {
    //    return this.timeDiff / (1000 * 60 * 60);
    //};

    return {
        routeViewModel: viewModel
    };
}());