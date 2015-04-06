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
                    $scope.route.startName = res.data.results[0].formatted_address;
                    $scope.route.startLatLng = coords;
                } else if (markerKey === "toMarker") {
                    $scope.route.endName = res.data.results[0].formatted_address;
                    $scope.route.endLatLng = coords;
                }
            });
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

    var setRoute = function () {
        mapService.setRoute($scope.route, false, true).then(function (routeData) {

            $scope.route.totalDistance = routeData.totalDistance;
            $scope.route.totalDuration = routeData.totalDistance;
            $scope.route.path = routeData.path;

            $scope.route.startLatLng = $scope.route.startLatLng.lat() + "," + $scope.route.startLatLng.lng();
            $scope.route.endLatLng = $scope.route.endLatLng.lat() + "," + $scope.route.endLatLng.lng();

            routeService.resource.save($scope.route, function (result) {
                if (result) {
                    // show alert!
                }

                initAside();
            });
        });
    };

    $scope.declareRoute = function () {
        $scope.route.type = userService.user.type;

        setRoute();

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
        $scope.route.startName = address;
        $scope.route.startLatLng = coords;

        if ($scope.route.startName && $scope.route.endName) {
            showAside();
        }
    });

    mapService.onToMarkerSelected(function (address, coords) {
        $scope.route.endName = address;
        $scope.route.endLatLng = coords;

        if ($scope.route.startName && $scope.route.endName) {
            showAside();
        }
    });

    $scope.$on('$typeahead.select', function (value, index) {
        if ($scope.route.startName === index) {
            mapService.geocode({ 'address': $scope.route.startName }).then(function (result) {
                var location = result[0].geometry.location;
                //$scope.route.startLatLng = location.lat() + "," + location.lng();
                $scope.route.startLatLng = location;
                mapService.setMarker(location.lat(), location.lng(), "fromMarker");
                mapService.centerMap(location.lat(), location.lng(), 12);
            });
        } else if ($scope.route.endName === index) {
            mapService.geocode({ 'address': $scope.route.endName }).then(function (result) {
                var location = result[0].geometry.location;
                //$scope.route.endLatLng = location.lat() + "," + location.lng();
                $scope.route.endLatLng = location;
                mapService.setMarker(location.lat(), location.lng(), "toMarker");
                mapService.centerMap(location.lat(), location.lng(), 12);
            });
        }
    });

    mapService.ready.then(function (gmaps) { mapService.centerOnMe(); });

    initAside();

    function initAside() {
        $scope.route = {
            type: userService.user.type,
            startName: null,
            endName: null
        };
    };
});