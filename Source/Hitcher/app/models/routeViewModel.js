﻿/// <reference path="~/app/models/hitcher-ns.js"/>

hitcher.viewModels = (function () {

    var viewModel = function (route) {
        this.model = route;
        this.canDelete = route.isCurrentUserRoute;
        this.canChat = !route.isCurrentUserRoute;
        this.startName = route.startName;
        this.startTime = new Date(Date.parse(route.startTime)).toLocaleString();
        this.dueDate = new Date(Date.parse(route.dueDate)).toLocaleString();
        this.recurrencyInfo = route.recurrency ? route.recurrency.recurrencyInfo : null;
        this.endName = route.endName;
        this.driver = route.name;
        this.userId = route.userId;
        this.phone = route.phone;
        this.distance = Math.floor(route.totalDistance / 1000) + " км, " + route.totalDistance % 1000 + " м";
        this.duration = route.totalDuration.toString().toHHMMSS();
        this.photoPath = route.photoPath;
    };

    return {
        routeViewModel: viewModel
    };
}());