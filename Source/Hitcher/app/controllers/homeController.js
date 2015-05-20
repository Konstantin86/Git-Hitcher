/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/services/mapService.js"/>
/// <reference path="~/app/services/statusService.js"/>
/// <reference path="~/app/services/authService.js"/>
/// <reference path="~/app/services/routeService.js"/>

"use strict";

app.controller("homeController", function ($scope, $route, $alert, $aside, $http, $modal, $q, $timeout, $interval, userService, authService, mapService, statusService, routeService, chatService) {
    var driveAside;
    var routeCreating = false;

    $scope.map = mapService.map;
    $scope.markers = mapService.markers;
    $scope.markerEvents = mapService.markerEvents;

    $scope.userData = authService.userData;

    $scope.chatOptions = chatService.options;
    $scope.chatMessage = "";
    $scope.chatMessages = [];

    var updateMenuCommandsAvailability = function (onMapVisChange) {
        if ($('#menu_go_from').length) {
            if (onMapVisChange) {
                $('#menu_go_from')[0].style.display = $scope.userData.isAuth ? 'block' : 'none';
            } else {
                $('#menu_go_from')[0].style.display = $scope.userData.isAuth && $('#menu_go_from')[0].style.display === 'block' ? 'block' : 'none';
            }
        }

        if ($('#menu_go_to').length) {
            $('#menu_go_to')[0].style.display = $scope.userData.isAuth && $('#menu_go_to')[0].style.display === 'block' ? 'block' : 'none';
        }
    };

    $scope.$watch('userData.isAuth', function () { updateMenuCommandsAvailability(true); });

    $scope.$on('$routeChangeSuccess', function () {
        $scope.mapVisible = !arguments[1].loadedTemplateUrl || arguments[1].redirectTo === "/home";
    });

    $scope.$watch('mapVisible', function (value) {
        if (value) {
            mapService.refresh();
        } else {
            $scope.hideDriveAside();
        }

        updateMenuCommandsAvailability(true);
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
        $scope.route.name = $scope.userData.userName;
        $scope.route.phone = $scope.userData.phoneNumber;

        if (!driveAside || !driveAside.$isShown) {
            driveAside = $aside({ scope: $scope, backdrop: false, dismissable: false, placement: 'left', template: 'app/views/modal/aside.html' });
            driveAside.$promise.then(function () { driveAside.show(); });

            mapService.maskRoutes();
        }
    };

    $scope.hideDriveAside = function () {
        if (driveAside) {
            initAside();
            mapService.removeRouteMarkers();
            mapService.clearTempDirection();
            routeCreating = false;
            driveAside.hide();
            mapService.unmaskRoutes();
        }
    };

    $scope.toggleAside = function () {
        if (!driveAside || !driveAside.$isShown) {
            showAside();
        } else {
            $scope.hideDriveAside();
        }
    }

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
                $alert({ content: 'Route is successfully created.', placement: 'top-right', type: 'success', duration: 3, show: true });
                //statusService.success("Route is successfully created.");
            }

            initAside();
            driveAside.hide();
            routeCreating = false;
            mapService.showMostRecentRoute();
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
        if (driveAside && driveAside.$isShown) {
            $scope.hideDriveAside();
        }
    });

    mapService.onAddRoute(function () {
        if (!driveAside || !driveAside.$isShown) {
            showAside();
        } else {
            $scope.hideDriveAside();
        }
    });

    authService.onLogout($scope.hideDriveAside);

    var createRoute = function () {
        mapService.declareRoute($scope.route).then(function (routeData) {

            if (!routeData) {
                initAside();
                statusService.warning("Невозможно проложить маршрут.");
                return;
            };

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
                    mapService.clearTempDirection();
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
                    mapService.clearTempDirection();
                    createRoute();
                }
            });
        }
    });

    mapService.ready.then(function () {
        mapService.centerOnMe();

        $scope.$watch('user.type', function () {
            if (driveAside && driveAside.$isShown) $scope.hideDriveAside();
        });
    });

    mapService.contextMenuReady.then(function (gmaps) {
        $scope.$watch('route.startLatLng', function (value) {
            if ($('#menu_go_from').length) $('#menu_go_from')[0].style.display = value ? 'none' : 'block';
            if ($('#menu_go_to').length) $('#menu_go_to')[0].style.display = value ? 'block' : 'none';

            var resetDisplay = ((($('#menu_go_from').length && $('#menu_go_from')[0].style.display === 'none') && $scope.userData.isAuth) || ($('#menu_search_from').length && $('#menu_search_from')[0].style.display === 'none')) ? 'block' : 'none';

            if ($('#menu_reset').length) $('#menu_reset')[0].style.display = resetDisplay;
            if ($('.context_menu_separator').length) $('.context_menu_separator')[0].style.display = resetDisplay;

            updateMenuCommandsAvailability();
        });

        $scope.$watch('route.endLatLng', function (value) {
            if ($('#menu_go_to').length) $('#menu_go_to')[0].style.display = ($scope.route.startLatLng && $scope.route.endLatLng) || (!$scope.route.startLatLng) ? 'none' : 'block';

            updateMenuCommandsAvailability();
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
        var dateTimeNow = new Date();
        dateTimeNow.setHours(dateTimeNow.getHours() + 1);
        var defaultDueDate = new Date();
        defaultDueDate.setMonth(defaultDueDate.getMonth() + 1);

        $scope.route = {
            startName: null, endName: null,
            name: $scope.userData.userName,
            phone: $scope.userData.phoneNumber,
            startTime: dateTimeNow,
            recurrency: false,
            recurrencyMode: 1,
            recurrencyWeeklyMon: true,
            recurrencyWeeklyTue: true,
            recurrencyWeeklyWed: true,
            recurrencyWeeklyThr: true,
            recurrencyWeeklyFri: true,
            recurrencyWeeklySat: true,
            recurrencyWeeklySun: true,
            recurrencyInterval: 1,
            dueDate: defaultDueDate,
            //icons: [{ "value": "Gear", "label": "<i class=\"fa fa-gear\"></i> Gear" }, { "value": "Globe", "label": "<i class=\"fa fa-globe\"></i> Globe" }, { "value": "Heart", "label": "<i class=\"fa fa-heart\"></i> Heart" }, { "value": "Camera", "label": "<i class=\"fa fa-camera\"></i> Camera" }]
            recurrencyModes: [{ value: 0, label: "Каждый день" }, { value: 1, label: "Каждую неделю" }, { value: 2, label: "Каждый месяц" }]
        };
    };
});