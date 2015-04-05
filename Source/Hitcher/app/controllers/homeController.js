/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/services/mapService.js"/>
/// <reference path="~/app/services/statusService.js"/>
/// <reference path="~/app/services/routeService.js"/>

"use strict";

app.controller("homeController", function ($scope, $alert, $aside, $http, $q, $timeout, $interval, uiGmapGoogleMapApi, userService, mapService, uiGmapIsReady, statusService, routeService) {
    var loadCount = 0;
    var driveAside;

    $scope.map = mapService.map;
    $scope.markers = mapService.markers;

    $scope.markerEvents = {
        dragend: function(marker, eventName, args) {
            //$log.log('marker dragend');
            var lat = marker.getPosition().lat();
            var lon = marker.getPosition().lng();
            alert(lat, lon);
            //$log.log(lat);
            //$log.log(lon);

            //$scope.marker.options = {
            //    draggable: true,
            //    labelContent: "lat: " + $scope.marker.coords.latitude + ' ' + 'lon: ' + $scope.marker.coords.longitude,
            //    labelAnchor: "100 0",
            //    labelClass: "marker-labels"
            //};
        }
    }

    var showAside = function () {
        driveAside = $aside({ scope: $scope, backdrop: false, dismissable: false, placement: 'left', template: 'app/views/modal/aside.html' });
        driveAside.$promise.then(function () { driveAside.show(); });
    };

    $scope.renderAside = function () {
        initAside();
        mapService.removeMarkers();
        showAside();
    }

    $scope.hideDriveAside = function () {
        initAside();
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
                endLatLng: $scope.aside.markerDriveToCoords.k + ',' + $scope.aside.markerDriveToCoords.B,
                type: userService.user.type
            };

            mapService.setRoute(route, false, true).then(function (routeData) {

                route.totalDistance = routeData.totalDistance;
                route.totalDuration = routeData.totalDistance;
                route.path = routeData.path;

                routeService.resource.save(route, function (result) {
                    if (result) {
                        // show alert!
                    }

                    initAside();
                });
            });
        } else {
            if ($scope.aside.driveFrom && $scope.aside.driveTo) {

                route = { startName: $scope.aside.driveFrom, endName: $scope.aside.driveTo, type: userService.user.type }

                mapService.geocode({ 'address': $scope.aside.driveFrom }).then(function (result) {
                    route.startLatLng = result[0].geometry.location.lat() + ',' + result[0].geometry.location.lng();
                    mapService.geocode({ 'address': $scope.aside.driveTo }).then(function (result) {
                        route.endLatLng = result[0].geometry.location.lat() + ',' + result[0].geometry.location.lng();
                        mapService.setRoute(route, false, true).then(function (routeData) {

                            route.totalDistance = routeData.totalDistance;
                            route.totalDuration = routeData.totalDistance;
                            route.path = routeData.path;

                            routeService.resource.save(route, function (result) {
                                if (result) {
                                    // show alert!
                                }

                                initAside();
                            });
                        });
                    });
                });
            }
        }

        mapService.removeMarkers();
        driveAside.hide();
    };

    $scope.getAddress = function (viewValue) {
        var params = { 'address': viewValue, 'region': 'UA', 'language': 'ru' };
        return mapService.geocode(params, true, true)
        .then(function (res) {
            return res.data.results;
        });
    };

    mapService.onMapMarkersChanged(function (markers) {
        $scope.markers = markers;
    });

    mapService.onFromMarkerSelected(function (address, coords) {
        $scope.aside.markerDriveFrom = address;
        $scope.aside.markerDriveFromCoords = coords;

        if ($scope.aside.markerDriveFrom && $scope.aside.markerDriveTo) {
            showAside();
        }
    });

    mapService.onToMarkerSelected(function (address, coords) {
        $scope.aside.markerDriveTo = address;
        $scope.aside.markerDriveToCoords = coords;

        if ($scope.aside.markerDriveFrom && $scope.aside.markerDriveTo) {
            showAside();
        }
    });

    mapService.ready.then(function (gmaps) {
        mapService.centerOnMe();
        //drawRoutes();
    });

    initAside();

    function initAside() {
        $scope.aside = {
            title: "Еду",
            markerDriveFrom: null,
            markerDriveFromCoords: null,
            markerDriveTo: null,
            markerDriveToCoords: null,
            driveFrom: null,
            driveTo: null
        };
    };

    //function drawRoutes() {
    //    routeService.resource.query({}, function (result) {
    //        if (result) {
    //            loadCount = result.length - 1;
    //            statusService.loading("Загрузка маршрутов...");

    //            var drawRoute = function (i) {
    //                mapService.setRoute(result[i], i).then(function () {
    //                    if (loadCount > 0) {
    //                        loadCount--;
    //                    }

    //                    if (loadCount === 0) {
    //                        statusService.clear();
    //                    }
    //                }, function (index) {
    //                    var timer = $timeout(function () {
    //                        $timeout.cancel(timer);
    //                        drawRoute(index);
    //                    }, 500);
    //                });
    //            };

    //            for (var i = 0; i < result.length; i++) {
    //                drawRoute(i);
    //            }
    //        }
    //    });
    //};
});