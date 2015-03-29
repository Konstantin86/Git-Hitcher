/// <reference path="~/scripts/angular.min.js"/>

/// <reference path="~/app/app.js"/>
/// <reference path="~/app/services/routeService.js"/>

"use strict";

app.controller("homeController", function ($scope, $alert, $http, $q, $timeout, $interval, uiGmapGoogleMapApi, mapService, uiGmapIsReady, statusService, routeService) {
    var loadCount = 0;

    $scope.map = mapService.map;
    $scope.markers = mapService.markers;

    $scope.declareRoute = function () {
        var asideScope = this;

        if (asideScope.driveFrom && asideScope.driveTo) {

            var route = { startName: asideScope.driveFrom, endName: asideScope.driveTo }

            mapService.geocode({ 'address': asideScope.driveFrom }).then(function (result) {
                route.startLatLng = result[0].geometry.location.lat() + ',' + result[0].geometry.location.lng();
                mapService.geocode({ 'address': asideScope.driveTo }).then(function (result) {
                    route.endLatLng = result[0].geometry.location.lat() + ',' + result[0].geometry.location.lng();
                    mapService.setRoute(route);
                    routeService.resource.save(route, function (result) {
                        if (result) {
                            // show alert!
                        }
                    });
                });
            });
        }

        this.$hide();
    };

    $scope.getAddress = function (viewValue) {
        var params = { 'address': viewValue, 'region': 'UA', 'language': 'ru' };
        return mapService.plainGeocode(params, true)
        .then(function (res) {
            return res.data.results;
        });
    };

    $scope.aside = {
        "title": "Подвезу",
        "content": "Hello Aside<br />This is a multiline message!",
    };

    mapService.onMapConfigChanged(function () {
        $scope.$apply();
    });

    mapService.ready.then(function (gmaps) {
        mapService.centerOnMe();
        drawRoutes();
    });

    function drawRoutes() {
        routeService.resource.query({}, function (result) {
            if (result) {
                loadCount = result.length - 1;
                statusService.loading("Загрузка маршрутов...");

                var drawRoute = function (i) {
                    mapService.setRoute(result[i], i).then(function () {
                        if (loadCount > 0) {
                            loadCount--;
                        }

                        if (loadCount === 0) {
                            statusService.clear();
                        }
                    }, function (index) {
                        var timer = $timeout(function () {
                            $timeout.cancel(timer);
                            drawRoute(index);
                        }, 500);
                    });
                };

                for (var i = 0; i < result.length; i++) {
                    drawRoute(i);
                }
            }
        });
    };
});