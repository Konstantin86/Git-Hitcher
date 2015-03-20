/// <reference path="~/scripts/angular.min.js"/>

/// <reference path="~/app/app.js"/>

"use strict";

app.controller("homeController", function ($scope, uiGmapGoogleMapApi) {
    //    // Do stuff with your $scope.
    //    // Note: Some of the directives require at least something to be defined originally!
    //    // e.g. $scope.markers = []
    $scope.randomMarkers = [];

    var markers = [];

    var centerMap = function (lat, lng) {
        $scope.map.center = {
            latitude: lat,
            longitude: lng
        };

        $scope.map.zoom = 12;
        $scope.$apply();
    };

    var route = {
            start: { name: 'Tokyo Station', latlng: '35.6813177190391,139.76609230041504' },
            end: { name: 'Ootemon', latlng: '35.68567497604782,139.7612428665161' }
        }

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


    uiGmapGoogleMapApi.then(function (maps) {

        var geocoder = new maps.Geocoder();

        var directionsDisplay = new maps.DirectionsRenderer();
        var directionsService = new maps.DirectionsService();

        //$scope.map.control = {};

        function codeAddress(address, callback) {
            geocoder.geocode({ 'address': address }, function (results, status) {
                if (status === maps.GeocoderStatus.OK) {
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

        var createRoute = function (routePoints) {
            directionsDisplay.setMap($scope.map.control.getGMap());
            var directionsService = new maps.DirectionsService();
            var start = routePoints.start.latlng;
            var end = routePoints.end.latlng;
            var request = {
                origin: start,
                destination: end,
                travelMode: maps.TravelMode.WALKING
            };
            directionsService.route(request, function (response, status) {
                if (status == maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(response);
                }
            });
            return;
        };

        codeAddress("Харьков, новгородская 3б", function (results) {
            route.start.latlng = results[0].geometry.location.lat() + ',' + results[0].geometry.location.lng();
            codeAddress("Харьков, героев сталинграда 136б", function (results) {
                route.end.latlng = results[0].geometry.location.lat() + ',' + results[0].geometry.location.lng();
                createRoute(route);
            });
        });
        //codeAddress("Харьков, героев сталинграда 136б");

        $scope.map = { center: { latitude: 40.1451, longitude: -99.6680 }, zoom: 4, bounds: {} };

        $scope.map.control = {};

        var pos = new maps.LatLng(40.1451, -99.6680);

        function calcRoute() {
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
            $scope.$apply();
        };

        function onError(error) {
            console.log('code: ' + error.code + "\n" + 'message: ' + error.message + "\n");
        };

        navigator.geolocation.getCurrentPosition(onSuccess, onError);

        //$scope.polylines = [
        //    {
        //        id: 1,
        //        path: [
        //            { latitude: 45, longitude: -74 },
        //            { latitude: 30, longitude: -89 },
        //            { latitude: 37, longitude: -122 },
        //            { latitude: 60, longitude: -95 }
        //        ],
        //        stroke: { color: "#6060FB", weight: 3 },
        //        editable: true,
        //        draggable: true,
        //        geodesic: true,
        //        visible: true,
        //        icons: [{ icon: { path: maps.SymbolPath.BACKWARD_OPEN_ARROW }, offset: "25px", repeat: "50px" }]
        //    }
        //];
    });
});