/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/scripts/angular-resource.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/const/appConst.js"/>

"use strict";

app.service("routeService", function ($resource, appConst) {

    var resource = $resource(appConst.serviceBase + "/:action", { action: "api/route" },
    {
        mostRecent: { method: "GET", params: { action: "api/route/mostRecent" } }
    });

    var get = function () {

        return [
            {
                start: {
                    latlng: "49.941001,36.301818000000026",
                    name: "Харьков, Новгородская 3б"
                },
                end: {
                    latlng: "50.0210186,36.2179946",
                    name: "Харьков, героев сталинграда 136б"
                }
            },
            {
                start: {
                    latlng: "49.922001,36.321818000000026",
                    name: "Харьков, Новгородская 3б"
                },
                end: {
                    latlng: "50.0410186,36.2079946",
                    name: "Харьков, героев сталинграда 136б"
                }
            },
            {
                start: {
                    latlng: "49.522001,36.021818000000026",
                    name: "Харьков, Новгородская 3б"
                },
                end: {
                    latlng: "51.0410186,35.9079946",
                    name: "Харьков, героев сталинграда 136б"
                }
            }
        ];
    };

    var getRouteViewModel = function (route, showUserPhoto) {
        route.canDelete = route.isCurrentUserRoute;
        return {
            model: route,
            startName: route.startName,
            endName: route.endName,
            driver: route.name,
            phone: route.phone,
            distance: Math.floor(route.totalDistance / 1000) + " км, " + route.totalDistance % 1000 + " м",
            duration: route.totalDuration.toString().toHHMMSS(),
            photoPath: route.photoPath,
            config: {
                showUserPhoto: showUserPhoto
            },
            events: { }
        };
    };

    this.getRouteViewModel = getRouteViewModel;
    this.get = get;
    this.resource = resource;
});