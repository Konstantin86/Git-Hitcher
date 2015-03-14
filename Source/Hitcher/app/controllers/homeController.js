/// <reference path="~/scripts/angular.min.js"/>

/// <reference path="~/app/app.js"/>

"use strict";

app.controller("homeController", function ($scope, uiGmapGoogleMapApi) {
    //    // Do stuff with your $scope.
    //    // Note: Some of the directives require at least something to be defined originally!
    //    // e.g. $scope.markers = []

    //    $scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };

    //    var onSuccess = function (position) {
    //        $scope.map.center = {
    //            latitude: position.coords.latitude,
    //            longitude: position.coords.longitude
    //        };

    //        $scope.map.zoom = 12;

    //        $scope.$apply();
    //    };

    //    function onError(error) {
    //        console.log('code: ' + error.code + "\n" + 'message: ' + error.message + "\n");
    //    };

    //    navigator.geolocation.getCurrentPosition(onSuccess, onError);

    //    // uiGmapGoogleMapApi is a promise.
    //    // The "then" callback function provides the google.maps object.
    //    uiGmapGoogleMapApi.then(function (maps) {

    //    });
    //});

    uiGmapGoogleMapApi.then(function (maps) {

        var directionsDisplay = new maps.DirectionsRenderer();
        var directionsService = new maps.DirectionsService();

        $scope.map = { center: { latitude: 40.1451, longitude: -99.6680 }, zoom: 4, bounds: {} };

        //directionsDisplay.setMap($scope.map);

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

        $scope.polylines = [
            {
                id: 1,
                path: [
                    { latitude: 45, longitude: -74 },
                    { latitude: 30, longitude: -89 },
                    { latitude: 37, longitude: -122 },
                    { latitude: 60, longitude: -95 }
                ],
                stroke: { color: "#6060FB", weight: 3 },
                editable: true,
                draggable: true,
                geodesic: true,
                visible: true,
                icons: [{ icon: { path: maps.SymbolPath.BACKWARD_OPEN_ARROW }, offset: "25px", repeat: "50px" }]
            }
        ];
    });
});