/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/services/mapService.js"/>
/// <reference path="~/app/services/statusService.js"/>
/// <reference path="~/app/services/routeService.js"/>

"use strict";

app.controller("homeController", function ($scope, $alert, $aside, $http, $q, $timeout, $interval, uiGmapGoogleMapApi, userService, mapService, uiGmapIsReady, statusService, routeService) {
    var driveAside;

    $scope.map = mapService.map;
    $scope.markers = mapService.markers;

    $scope.markerEvents = {
        dragend: function (marker, eventName, args) {
            var coords = marker.position;
            var markerKey = marker.key;

            var params = { 'latlng': coords.lat() + ',' + coords.lng(), 'language': 'ru' };
            mapService.geocode(params, false, true)
            .then(function (res) {
                if (markerKey === "fromMarker") {
                    $scope.aside.driveFrom = res.data.results[0].formatted_address;
                    $scope.aside.driveFromCoords = coords;
                } else if (markerKey === "toMarker") {
                    $scope.aside.driveTo = res.data.results[0].formatted_address;
                    $scope.aside.driveToCoords = coords;
                }
            });

            //$scope.marker.options = {
            //    draggable: true,
            //    labelContent: "lat: " + $scope.marker.coords.latitude + ' ' + 'lon: ' + $scope.marker.coords.longitude,
            //    labelAnchor: "100 0",
            //    labelClass: "marker-labels"
            //};
        }
    }

    var showAside = function () {
        if (!driveAside || !driveAside.$isShown) {
            driveAside = $aside({ scope: $scope, backdrop: false, dismissable: false, placement: 'left', template: 'app/views/modal/aside.html' });
            driveAside.$promise.then(function () { driveAside.show(); });
        }
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

    var setRoute = function (route) {
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
    };

    $scope.declareRoute = function () {
        var route = { startName: $scope.aside.driveFrom, endName: $scope.aside.driveTo, type: userService.user.type };

        if ($scope.aside.driveFromCoords && $scope.aside.driveToCoords) {
            route.startLatLng = $scope.aside.driveFromCoords.k + ',' + $scope.aside.driveFromCoords.B;
            route.endLatLng = $scope.aside.driveToCoords.k + ',' + $scope.aside.driveToCoords.B;
            setRoute(route);
        } else {
            mapService.geocode({ 'address': $scope.aside.driveFrom }).then(function (result) {
                route.startLatLng = result[0].geometry.location.lat() + ',' + result[0].geometry.location.lng();
                mapService.geocode({ 'address': $scope.aside.driveTo }).then(function (result) {
                    route.endLatLng = result[0].geometry.location.lat() + ',' + result[0].geometry.location.lng();
                    setRoute(route);
                });
            });
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

    mapService.onMapMarkersChanged(function (markers) { $scope.markers = markers; });

    mapService.onFromMarkerSelected(function (address, coords) {
        $scope.aside.driveFrom = address;
        $scope.aside.driveFromCoords = coords;

        if ($scope.aside.driveFrom && $scope.aside.driveTo) {
            showAside();
        }
    });

    mapService.onToMarkerSelected(function (address, coords) {
        $scope.aside.driveTo = address;
        $scope.aside.driveToCoords = coords;

        if ($scope.aside.driveFrom && $scope.aside.driveTo) {
            showAside();
        }
    });

    mapService.ready.then(function (gmaps) { mapService.centerOnMe(); });

    initAside();

    function initAside() {
        $scope.aside = {
            title: "Еду",
            driveFromCoords: null,
            driveToCoords: null,
            driveFrom: null,
            driveTo: null
        };
    };
});