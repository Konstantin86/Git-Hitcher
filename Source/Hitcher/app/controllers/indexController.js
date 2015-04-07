/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/services/mapService.js"/>
/// <reference path="~/app/services/statusService.js"/>

"use strict";

app.controller("indexController", function ($scope, $location, $aside, userService, routeService, mapService, statusService) {
    var searchAside;

    var showAside = function () {
        if (!searchAside || !searchAside.$isShown) {
            searchAside = $aside({ scope: $scope, backdrop: false, dismissable: false, placement: 'right', template: 'app/views/modal/search.html' });
            searchAside.$promise.then(function () { searchAside.show(); });
        }
    };

    $scope.state = statusService.state;
    $scope.user = userService.user;
    $scope.markerEvents = mapService.markerEvents;

    mapService.onMarkerDrag(function (marker, eventName, args) {
        var coords = marker.position;
        var markerKey = marker.key;

        if (markerKey !== "fromSearchMarker" && markerKey !== "toSearchMarker") return;

        var params = { 'latlng': coords.lat() + ',' + coords.lng(), 'language': 'ru' };
        mapService.geocode(params, false, true)
        .then(function (res) {
            if (markerKey === "fromSearchMarker") {
                $scope.searchModel.from = res.data.results[0].formatted_address;
                $scope.searchModel.startLat = coords.lat();
                $scope.searchModel.startLng = coords.lng();
            } else if (markerKey === "toSearchMarker") {
                $scope.searchModel.to = res.data.results[0].formatted_address;
                $scope.searchModel.endLat = coords.lat();
                $scope.searchModel.endLng = coords.lng();
            }
        });
    });

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

    mapService.contextMenuReady.then(function (gmaps) {
        $scope.$watch('searchModel.startLat', function (value) {
            var contextMenu = $('.context_menu');

            if (contextMenu.length) {
                contextMenu.children()[2].style.display = value ? 'none' : 'block';
                contextMenu.children()[3].style.display = value ? 'block' : 'none';
                contextMenu.children()[5].style.display = contextMenu.children()[2].style.display === 'none' || contextMenu.children()[0].style.display === 'none' ? 'block' : 'none';
            }
        });

        $scope.$watch('searchModel.endLat', function (value) {
            var contextMenu = $('.context_menu');

            if (contextMenu.length) {
                contextMenu.children()[3].style.display = ($scope.searchModel.startLat && $scope.searchModel.endLat) || (!$scope.searchModel.startLat) ? 'none' : 'block';
            }
        });
    });

    function initAside() {
        $scope.searchModel = {
            from: null,
            to: null,
            take: 2
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
        $scope.searchModel.from = address;
        $scope.searchModel.startLat = coords.lat();
        $scope.searchModel.startLng = coords.lng();
        showAside();
    });

    mapService.onSearchToMarkerSelected(function (address, coords) {
        $scope.searchModel.to = address;
        $scope.searchModel.endLat = coords.lat();
        $scope.searchModel.endLng = coords.lng();
        showAside();
    });

    mapService.onResetSelected(function () {
        if (searchAside && searchAside.$isShown) {
            $scope.hideSearch();
        }
    });

    $scope.search = function () {
        $scope.searchModel.type = userService.user.type;
        //var search = { type: userService.user.type, take: $scope.aside.resultsCount };

        mapService.showRoutes($scope.searchModel).then(function (routesCount) {
            if (routesCount === 0) {
                statusService.warning("Подходящих результатов не найдено");
            }

            initAside();
        });

        mapService.removeSearchMarkers();
        searchAside.hide();
    };

    $scope.$on('$typeahead.select', function (value, index) {
        if ($scope.searchModel.from === index) {
            mapService.geocode({ 'address': $scope.searchModel.from }).then(function (result) {
                var location = result[0].geometry.location;
                $scope.searchModel.startLat = location.lat();
                $scope.searchModel.startLng = location.lng();
                mapService.setMarker(location.lat(), location.lng(), "fromSearchMarker");
                mapService.centerMap(location.lat(), location.lng(), 12);
            });
        } else if ($scope.searchModel.to === index) {
            mapService.geocode({ 'address': $scope.searchModel.to }).then(function (result) {
                var location = result[0].geometry.location;
                $scope.searchModel.endLat = location.lat();
                $scope.searchModel.endLng = location.lng();
                mapService.setMarker(location.lat(), location.lng(), "toSearchMarker");
                mapService.centerMap(location.lat(), location.lng(), 12);
            });
        }
    });

    $scope.hideSearch = function () {
        initAside();
        mapService.removeSearchMarkers();
        searchAside.hide();
    };

    $scope.onSearchClick = function () {
        if (!searchAside || !searchAside.$isShown) {
            showAside();
        }
        else {
            $scope.hideSearch();
        }
    };
});