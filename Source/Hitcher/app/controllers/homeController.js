/// <reference path="~/scripts/angular.min.js"/>

/// <reference path="~/app/app.js"/>
/// <reference path="~/app/services/routeService.js"/>

"use strict";

app.controller("homeController", function ($scope, $alert, $http, $q, $timeout, $interval, uiGmapGoogleMapApi, uiGmapIsReady, statusService, routeService) {

    var googleMaps = null;
    var geocoder = null;
    var loadCount = 0;

    $scope.map = { center: { latitude: 40.1451, longitude: -99.6680 }, zoom: 4, control: {}, bounds: {} };

    $scope.randomMarkers = [];

    $scope.driveFrom = "";
    $scope.driveTo = "";

    var route = {
        startName: 'Tokyo Station',
        startLatLng: '35.6813177190391,139.76609230041504',
        endName: 'Ootemon',
        endLatLng: '35.68567497604782,139.7612428665161'
    }

    $scope.declareRoute = function () {
        var asideScope = this;

        if (asideScope.driveFrom && asideScope.driveTo) {
            route.startName = asideScope.driveFrom;
            route.endName = asideScope.driveTo;

            codeAddress(asideScope.driveFrom, function (results) {
                route.startLatLng = results[0].geometry.location.lat() + ',' + results[0].geometry.location.lng();
                codeAddress(asideScope.driveTo, function (results) {
                    route.endLatLng = results[0].geometry.location.lat() + ',' + results[0].geometry.location.lng();
                    createRoute(route);

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
        var params = { address: viewValue, sensor: false };
        return $http.get('https://maps.googleapis.com/maps/api/geocode/json', { params: params })
        .then(function (res) {
            return res.data.results;
        });
    };

    $scope.aside = {
        "title": "Подвезу",
        "content": "Hello Aside<br />This is a multiline message!"
    };

    var handleCenterMe = function() {
        var onSuccess = function (position) {
            $scope.map.center = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };

            $scope.map.zoom = 12;
            $scope.$apply();
        };

        function onError(error) {
            console.log('code: ' + error.code + "\n" + 'message: ' + error.message + "\n");
        };

        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    };

    var markers = [];

    var centerMap = function (lat, lng) {
        $scope.map.center = {
            latitude: lat,
            longitude: lng
        };

        $scope.map.zoom = 12;
        $scope.$apply();
    };

    var createRandomMarker = function (lat, lng, idKey) {

        if (idKey == null) {
            idKey = "id";
        }

        var ret = {
            latitude: lat,
            longitude: lng,
            title: "Test"
        };

        ret[idKey] = markers.length + 1;

        return ret;
    };

    function codeAddress(address, callback) {
        geocoder.geocode({ 'address': address }, function (results, status) {
            if (status === googleMaps.GeocoderStatus.OK) {
                //In this case it creates a marker, but you can get the lat and lng from the location.LatLng


                markers.push(createRandomMarker(results[0].geometry.location.lat(), results[0].geometry.location.lng()));
                $scope.randomMarkers = markers;

                if (typeof (callback) == "function") {
                    callback(results);
                } else {
                    //  $scope.$apply();
                }


                //centerMap(results[0].geometry.location.lat(), results[0].geometry.location.lng());
            } else {
                alert("Geocode was not successful for the following reason: " + status);
            }
        });
    }

    function createRoute(routePoints, i) {

        var deferred = $q.defer();

        var rendererOptions = {
            preserveViewport: true,
            //suppressMarkers: true,
            routeIndex: i
        };

        var directionsDisplay = new googleMaps.DirectionsRenderer(rendererOptions);
        directionsDisplay.setMap($scope.map.control.getGMap());
        var start = routePoints.startLatLng;
        var end = routePoints.endLatLng;
        var request = {
            origin: start,
            destination: end,
            travelMode: googleMaps.TravelMode.DRIVING
        };

        var directionsService = new googleMaps.DirectionsService();
        directionsService.route(request, function (response, status) {
            if (status === googleMaps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);

                if (loadCount > 0) {
                    loadCount--;
                }

                if (loadCount === 0) {
                    statusService.clear();
                }
            }
            else if (status === googleMaps.GeocoderStatus.ZERO_RESULTS) {
            }
            else if (status === googleMaps.GeocoderStatus.OVER_QUERY_LIMIT) {
                console.log("Hello from " + status);
                deferred.reject(i);
            }

            deferred.resolve(i);
        });

        return deferred.promise;
    };

    uiGmapGoogleMapApi.then(function (maps) {

        googleMaps = maps;
        geocoder = new maps.Geocoder();

        //var directionsDisplay = new maps.DirectionsRenderer();
        var directionsService = new maps.DirectionsService();

        function codeAddress(address, callback) {
            geocoder.geocode({ 'address': address }, function (results, status) {
                if (status === maps.GeocoderStatus.OK) {
                    markers.push(createRandomMarker(results[0].geometry.location.lat(), results[0].geometry.location.lng()));
                    $scope.randomMarkers = markers;

                    if (typeof (callback) == "function") {
                        callback(results);
                    }
                } else {
                    alert("Geocode was not successful for the following reason: " + status);
                }
            });
        }

        var pos = new maps.LatLng(40.1451, -99.6680);

        function calcRoute() {
            var directionsDisplay = new maps.DirectionsRenderer();
            var start = "37.891586,-4.7844853";
            var end = pos.k + "," + pos.B;

            var request = {
                origin: start,
                destination: end,
                optimizeWaypoints: true,
                travelMode: maps.TravelMode.DRIVING
            };

            directionsService.route(request, function (response, status) {
                if (status == maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(response);
                    console.log('enter!');
                }
            });
        }

        calcRoute();

        var onSuccess = function (position) {
            $scope.map.center = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };

            $scope.map.zoom = 12;
            //$scope.$apply();
        };

        function onError(error) {
            console.log('code: ' + error.code + "\n" + 'message: ' + error.message + "\n");
        };

        navigator.geolocation.getCurrentPosition(onSuccess, onError);

        // Waiting for maps.control.getGMap is one of the things that the uiGmapIsReady service in Angular Google Maps was designed for
        uiGmapIsReady.promise().then(function (gmaps) {
            drawRoutes();
        });

        function drawRoutes() {
            routeService.resource.query({}, function (result) {
                if (result) {
                    loadCount = result.length - 1;
                    statusService.loading("Загрузка маршрутов...");
                    //TODO to overcome over query limit issues refer:
                    //http://stackoverflow.com/questions/14014074/google-maps-api-over-query-limit-per-second-limit
                    //http://stackoverflow.com/questions/11792916/over-query-limit-in-google-maps-api-v3-how-do-i-pause-delay-in-javascript-to-sl

                    var drawRoute = function (i) {
                        createRoute(result[i], i).then(function() {}, function (index) {
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
});