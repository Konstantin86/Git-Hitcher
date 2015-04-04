/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/services/mapService.js"/>
/// <reference path="~/app/services/statusService.js"/>

"use strict";

app.controller("indexController", function ($scope, $location, $aside, userService, routeService, mapService, statusService) {

    var searchAside;

    var showAside = function () {
        searchAside = $aside({ scope: $scope, dismissable: false, placement: 'right', template: 'app/views/modal/search.html' });
        searchAside.$promise.then(function () { searchAside.show(); });
    };

    $scope.state = statusService.state;

    $scope.user = userService.user;

    $scope.app = {
        seachToggle: false
    }

    var type;

    $scope.closeAlert = function () { statusService.clear(); };

    $scope.logout = function () {
        //authService.logout();
        $location.path("/home");
    }

    mapService.ready.then(function (gmaps) {
        $scope.$watch('user.type', function (value) {
            if (value != type) {
                mapService.showRoutes({ type: value });
                type = value;
            }
        });
    });

    function initAside() {
        $scope.aside = {
            title: "Ищу",
            markerDriveFrom: null,
            markerDriveFromCoords: null,
            markerDriveTo: null,
            markerDriveToCoords: null,
            driveFrom: null,
            driveTo: null,
            resultsCount: 2
        };
    };

    initAside();

    $scope.getAddress = function (viewValue) {
        var params = { 'address': viewValue, 'region': 'UA', 'language': 'ru' };
        return mapService.geocode(params, true, true)
        .then(function (res) {
            return res.data.results;
        });
    };


    mapService.onSearchFromMarkerSelected(function (address, coords) {
        $scope.aside.markerDriveFrom = address;
        $scope.aside.markerDriveFromCoords = coords;

        if ($scope.aside.markerDriveFrom && $scope.aside.markerDriveTo) {
            showAside();
        }
    });

    mapService.onSearchToMarkerSelected(function (address, coords) {
        $scope.aside.markerDriveTo = address;
        $scope.aside.markerDriveToCoords = coords;

        if ($scope.aside.markerDriveFrom && $scope.aside.markerDriveTo) {
            showAside();
        }
    });

    $scope.search = function() {
        var search = { type: userService.user.type, take: $scope.aside.resultsCount };

        if ($scope.aside.markerDriveFromCoords && $scope.aside.markerDriveToCoords) {
            search.startLat = $scope.aside.markerDriveFromCoords.k;
            search.startLng = $scope.aside.markerDriveFromCoords.B;
            search.endLat = $scope.aside.markerDriveToCoords.k;
            search.endLng = $scope.aside.markerDriveToCoords.B;

            mapService.showRoutes(search).then(function () {
                initAside();
            });
        } else {
            if ($scope.aside.driveFrom && $scope.aside.driveTo) {
                mapService.geocode({ 'address': $scope.aside.driveFrom }).then(function (result) {
                    search.startLat = result[0].geometry.location.lat();
                    search.startLng = result[0].geometry.location.lng();
                    
                    mapService.geocode({ 'address': $scope.aside.driveTo }).then(function (result) {
                        search.endLat = result[0].geometry.location.lat();
                        search.endLng = result[0].geometry.location.lng();

                        mapService.showRoutes(search).then(function () {
                            initAside();
                        });
                    });
                });
            }
        }

        mapService.removeMarkers();
        searchAside.hide();
    };

    $scope.hideSearch = function () {
        initAside();
        mapService.removeMarkers();
        searchAside.hide();
    };

    $scope.onSearchClick = function() {
        showAside();
    };

    $scope.$watch('app.searchToggle', function (value) {
        if (value) {
            showAside();
        }
    });

    //$scope.userData = authService.userData;
});