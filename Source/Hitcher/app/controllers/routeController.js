app.controller("routeController", function ($scope, uiGmapGoogleMapApi) {

    uiGmapGoogleMapApi.then(function (maps) {
        angular.extend($scope, {
            map: {
                center: {
                    latitude: 35.681382,
                    longitude: 139.766084
                },
                options: {
                    maxZoom: 20,
                    minZoom: 3
                },
                zoom: 16,
                control: {},
                routes: {
                    start: [
                      { name: 'Tokyo Station', latlng: '35.6813177190391,139.76609230041504' },
                      { name: 'Ooimathi Station', latlng: '35.684228393108306,139.76293802261353' }
                    ],
                    end: [
                      { name: 'Ootemon', latlng: '35.68567497604782,139.7612428665161' },
                      { name: 'Nijyubashi', latlng: '35.67947017023017,139.75772380828857' }
                    ]
                }
            },
            routePoints: {
                start: {},
                end: {}
            }
        });
        $scope.routePoints.start = $scope.map.routes.start[0];
        $scope.routePoints.end = $scope.map.routes.end[0];

        var directionsDisplay = new maps.DirectionsRenderer();

        $scope.calcRoute = function (routePoints) {
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
    });
});