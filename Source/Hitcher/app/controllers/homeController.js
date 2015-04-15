﻿/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/services/mapService.js"/>
/// <reference path="~/app/services/statusService.js"/>
/// <reference path="~/app/services/routeService.js"/>

"use strict";

app.controller("homeController", function ($scope, $route, $alert, $aside, $http, $q, $timeout, $interval, userService, mapService, statusService, routeService) {
    var driveAside;
    var routeCreating = false;
    var type;

    //if (!mapService.isLoaded()) {
        $scope.map = mapService.map;
        $scope.markers = mapService.markers;
        $scope.markerEvents = mapService.markerEvents;
    //}

        $scope.$on('$routeChangeSuccess', function () {
            $scope.mapVisible = !arguments[1].loadedTemplateUrl || arguments[1].redirectTo === "/home";
        });

    $scope.user = userService.user;

    mapService.onMarkerDrag(function (marker, eventName, args) {
        var coords = marker.position;
        var markerKey = marker.key;

        if (markerKey !== "fromMarker" && markerKey !== "toMarker") return;

        var params = { 'latlng': coords.lat() + ',' + coords.lng(), 'language': 'ru' };
        mapService.geocode(params, false, true)
        .then(function (res) {
            if (markerKey === "fromMarker") {
                $scope.route.startName = mapService.getShortAddress(res.data.results[0]);
                $scope.route.startLatLng = coords;
            } else if (markerKey === "toMarker") {
                $scope.route.endName = mapService.getShortAddress(res.data.results[0]);
                $scope.route.endLatLng = coords;
            }
        });
    });

    var showAside = function () {
        if (!driveAside || !driveAside.$isShown) {
            driveAside = $aside({ scope: $scope, backdrop: false, dismissable: false, placement: 'left', template: 'app/views/modal/aside.html' });
            driveAside.$promise.then(function () { driveAside.show(); });

            mapService.maskRoutes();
        }
    };

    $scope.toggleAside = function () {
        if (!driveAside || !driveAside.$isShown) {
            showAside();
        } else {
            $scope.hideDriveAside();
        }
    }

    $scope.hideDriveAside = function () {
        initAside();
        mapService.removeRouteMarkers();
        mapService.removeTempRoute();
        routeCreating = false;
        driveAside.hide();
        mapService.unmaskRoutes();
    };

    $scope.declareRoute = function () {
        $scope.route.type = userService.user.type;
        $scope.route.startLatLng = $scope.route.startLatLng.lat() + "," + $scope.route.startLatLng.lng();
        $scope.route.endLatLng = $scope.route.endLatLng.lat() + "," + $scope.route.endLatLng.lng();

        $scope.route.totalDistance = $scope.route.totalDistanceToSave;
        $scope.route.totalDuration = $scope.route.totalDurationToSave;

        var km = $scope.route.totalDistance / 1000;

        if (km >= 10) {
            var granularity = 4;

            if (km > 50 && km <= 75) {
                granularity = 3;
            } else if (km > 75 && km <= 100) {
                granularity = 2;
            } else if (km > 100) {
                granularity = 1;
            }

            var maxPoints = Math.floor(km * granularity);
            var step = Math.floor($scope.route.path.length / maxPoints);
            //alert($scope.route.path.length + ' - ' + maxPoints + ' - every ' + step + ' gran ' + granularity);

            var pountsToSave = [];

            for (var i = 0; i < $scope.route.path.length; i++) {
                if ((i === 0) || (i === $scope.route.path.length - 1) || (i % step === 0)) {
                    pountsToSave.push($scope.route.path[i]);
                }
            }

            $scope.route.path = pountsToSave;
        }

        routeService.resource.save($scope.route, function (result) {
            if (result) {
                statusService.success("Route is successfully created.");
            }

            initAside();
            driveAside.hide();
            routeCreating = false;

            mapService.showRoutes({ type: type });
        });
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
        showAside();
    });

    mapService.onToMarkerSelected(function (address, coords) {
        $scope.route.endName = address;
        $scope.route.endLatLng = coords;
        showAside();
    });

    mapService.onResetSelected(function () {
        //mapService.removeMarkers();
        //initAside();
        if (driveAside && driveAside.$isShown) {
            $scope.hideDriveAside();
        }
    });

    mapService.onAddRoute(function() {
        if (!driveAside || !driveAside.$isShown) {
            showAside();
        } else {
            $scope.hideDriveAside();
        }
    });

    var createRoute = function () {
        mapService.declareRoute($scope.route).then(function (routeData) {

            if (!routeData) {
                initAside();
                statusService.warning("Невозможно проложить маршрут.");
                return;
            };

            //var maxPoints = Math.floor((routeData.totalDistance / 1000) * 3);
            //alert(routeData.path.length + ' - ' + maxPoints);

            //$scope.route.path = routeData.path.filter(function (element) { return routeData.path.indexOf(element) % 10 === 0; });
            $scope.route.path = routeData.path;

            $scope.route.totalDistanceToSave = routeData.totalDistance;
            $scope.route.totalDistance = Math.floor(routeData.totalDistance / 1000) + ' км, ' + routeData.totalDistance % 1000 + ' м';
            $scope.route.totalDurationToSave = routeData.totalDuration;
            $scope.route.totalDuration = routeData.totalDuration.toString().toHHMMSS();

            mapService.removeRouteMarkers();

            routeCreating = true;
        });
    };

    $scope.$on('$typeahead.select', function (value, index) {
        if ($scope.route.startName === index) {
            mapService.geocode({ 'address': $scope.route.startName }).then(function (result) {
                var location = result[0].geometry.location;
                $scope.route.startLatLng = location;
                mapService.setMarker(location.lat(), location.lng(), "fromMarker");
                mapService.centerMap(location.lat(), location.lng(), 12);

                if (routeCreating) {
                    //routeCreating = false;
                    // TODO redraw route
                    mapService.removeTempRoute();
                    createRoute();
                }
            });
        } else if ($scope.route.endName === index) {
            mapService.geocode({ 'address': $scope.route.endName }).then(function (result) {
                var location = result[0].geometry.location;
                $scope.route.endLatLng = location;
                mapService.setMarker(location.lat(), location.lng(), "toMarker");
                mapService.centerMap(location.lat(), location.lng(), 12);

                if (routeCreating) {
                    //routeCreating = false;
                    // TODO redraw route
                    mapService.removeTempRoute();
                    createRoute();
                }
            });
        }
    });

    mapService.ready.then(function (gmaps) {
        mapService.centerOnMe();

        $scope.$watch('user.type', function (value) {
            if (value !== type) {
                if (driveAside && driveAside.$isShown) {
                    $scope.hideDriveAside();
                }

                type = value;
            }
        });
    });

    mapService.contextMenuReady.then(function (gmaps) {
        $scope.$watch('route.startLatLng', function (value) {
            var contextMenu = $('.context_menu');

            if (contextMenu.length) {
                contextMenu.children()[0].style.display = value ? 'none' : 'block';
                contextMenu.children()[1].style.display = value ? 'block' : 'none';

                var resetDisplay = contextMenu.children()[2].style.display === 'none' || contextMenu.children()[0].style.display === 'none' ? 'block' : 'none';

                contextMenu.children()[4].style.display = resetDisplay;
                contextMenu.children()[5].style.display = resetDisplay;
            }
        });

        $scope.$watch('route.endLatLng', function (value) {
            var contextMenu = $('.context_menu');

            if (contextMenu.length) {
                contextMenu.children()[1].style.display = ($scope.route.startLatLng && $scope.route.endLatLng) || (!$scope.route.startLatLng) ? 'none' : 'block';
            }
        });
    });

    $scope.$watch('route.startLatLng', function (value) {
        if ($scope.route.endLatLng && $scope.route.startLatLng && !routeCreating) {
            createRoute();
        }
    });

    $scope.$watch('route.endLatLng', function (value) {
        if ($scope.route.endLatLng && $scope.route.startLatLng && !routeCreating) {
            createRoute();
        }
    });

    mapService.onRouteChanged(function (directionsDisplay) {
        var directions = directionsDisplay.getDirections();

        if (!directions) return;

        var path = [];

        // TODO This code is duplicated. Introduce an appropriate function.
        var legs = directions.routes[0].legs;
        for (var i = 0; i < legs.length; i++) {
            var steps = legs[i].steps;
            for (var j = 0; j < steps.length; j++) {
                var nextSegment = steps[j].path;
                for (var k = 0; k < nextSegment.length; k++) {
                    path.push({ Lat: nextSegment[k].lat(), Lng: nextSegment[k].lng() });
                }
            }
        }

        $scope.route.path = path;
        $scope.route.startLatLng = directions.mc.origin;
        $scope.route.endLatLng = directions.mc.destination;
        var distance = directions.routes[0].legs[0].distance.value;
        $scope.route.totalDistanceToSave = distance;
        $scope.route.totalDistance = Math.floor(distance / 1000) + ' км, ' + distance % 1000 + ' м';
        var duration = directions.routes[0].legs[0].duration.value;
        $scope.route.totalDurationToSave = duration;
        $scope.route.totalDuration = duration.toString().toHHMMSS();
        
        mapService.geocode({ 'latlng': $scope.route.startLatLng.lat() + ',' + $scope.route.startLatLng.lng(), 'language': 'ru' }, false, true).then(function (res) {
            //$scope.route.startName = res.data.results[0].formatted_address;
            $scope.route.startName = mapService.getShortAddress(res.data.results[0]);
        });

        mapService.geocode({ 'latlng': $scope.route.endLatLng.lat() + ',' + $scope.route.endLatLng.lng(), 'language': 'ru' }, false, true).then(function (res) {
            //$scope.route.endName = res.data.results[0].formatted_address;
            $scope.route.endName = mapService.getShortAddress(res.data.results[0]);
        });
    });

    initAside();

    function initAside() {
        $scope.route = { startName: null, endName: null, name: null, phone: null };
    };
});