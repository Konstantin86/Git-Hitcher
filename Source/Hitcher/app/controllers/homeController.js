/// <reference path="~/scripts/angular.min.js"/>

/// <reference path="~/app/app.js"/>
/// <reference path="~/app/services/routeService.js"/>

"use strict";

app.controller("homeController", function ($scope, $alert, $aside, $http, $q, $timeout, $interval, uiGmapGoogleMapApi, mapService, uiGmapIsReady, statusService, routeService) {
    var loadCount = 0;
    var driveAside;

    $scope.map = mapService.map;
    $scope.markers = mapService.markers;

    //$scope.$on('aside.hide', function () {
    //    console.log('aside-hide');
    //});

    //$scope.$on('aside.hide.before', function () {
    //    console.log('aside-hide-before');
    //});
    var renderAside = function () {
        driveAside = $aside({ scope: $scope, dismissable: false, placement: 'left', template: 'app/views/modal/aside.html' });
        driveAside.$promise.then(function () {
            driveAside.show();
        });
    };

    $scope.renderAside = function () {
        $scope.aside.markerDriveFrom = null;
        $scope.aside.markerDriveFromCoords = null;
        $scope.aside.markerDriveTo = null;
        $scope.aside.markerDriveToCoords = null;
        mapService.removeMarkers();
        renderAside();
    }

    $scope.hideDriveAside = function () {
        $scope.aside.markerDriveFrom = null;
        $scope.aside.markerDriveFromCoords = null;
        $scope.aside.markerDriveTo = null;
        $scope.aside.markerDriveToCoords = null;
        $scope.aside.driveFrom = null;
        $scope.aside.driveTo = null;
        mapService.removeMarkers();
        driveAside.hide();
    };

    $scope.declareRoute = function () {
        var route = null;

        if ($scope.aside.markerDriveFromCoords && $scope.aside.markerDriveToCoords) {
            route = {
                startName: $scope.aside.markerDriveFrom,
                endName: $scope.aside.markerDriveTo,
                startLatLng: $scope.aside.markerDriveFromCoords.k + ',' + $scope.aside.markerDriveFromCoords.B,
                endLatLng: $scope.aside.markerDriveToCoords.k + ',' + $scope.aside.markerDriveToCoords.B
            };

            mapService.setRoute(route);
            routeService.resource.save(route, function (result) {
                if (result) {
                    // show alert!
                }
            });
        } else {
            if ($scope.aside.driveFrom && $scope.aside.driveTo) {

                route = { startName: $scope.aside.driveFrom, endName: $scope.aside.driveTo }

                mapService.geocode({ 'address': $scope.aside.driveFrom }).then(function (result) {
                    route.startLatLng = result[0].geometry.location.lat() + ',' + result[0].geometry.location.lng();
                    mapService.geocode({ 'address': $scope.aside.driveTo }).then(function (result) {
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
        }

        $scope.aside.markerDriveFrom = null;
        $scope.aside.markerDriveFromCoords = null;
        $scope.aside.markerDriveTo = null;
        $scope.aside.markerDriveToCoords = null;
        $scope.aside.driveFrom = null;
        $scope.aside.driveTo = null;

        mapService.removeMarkers();
        driveAside.hide();
    };

    $scope.getAddress = function (viewValue) {
        var params = { 'address': viewValue, 'region': 'UA', 'language': 'ru' };
        return mapService.plainGeocode(params, true)
        .then(function (res) {
            return res.data.results;
        });
    };

    $scope.aside = {
        title: "Подвезу",
        markerDriveFrom: null,
        markerDriveFromCoords: null,
        markerDriveTo: null,
        markerDriveToCoords: null,
        driveFrom: "",
        driveTo: ""
    };

    mapService.onMapMarkersChanged(function (markers) {
        $scope.markers = markers;
        //$scope.$apply();
    });

    mapService.onMapConfigChanged(function () {
        //$scope.$apply();
    });

    mapService.onFromMarkerSelected(function (address, coords) {
        $scope.aside.markerDriveFrom = address;
        $scope.aside.markerDriveFromCoords = coords;

        if ($scope.aside.markerDriveFrom && $scope.aside.markerDriveTo) {
            renderAside();
        }
        //$scope.$apply();
    });

    mapService.onToMarkerSelected(function (address, coords) {
        $scope.aside.markerDriveTo = address;
        $scope.aside.markerDriveToCoords = coords;

        if ($scope.aside.markerDriveFrom && $scope.aside.markerDriveTo) {
            renderAside();
        }
        //$scope.$apply();
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