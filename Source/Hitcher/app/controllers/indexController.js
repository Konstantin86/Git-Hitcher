/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/services/authService.js"/>
/// <reference path="~/app/services/mapService.js"/>
/// <reference path="~/app/services/statusService.js"/>

"use strict";

app.controller("indexController", function ($scope, $location, $aside, authService, userService, routeService, mapService, statusService) {
    var searchAside;

    var showAside = function () {
        if (!searchAside || !searchAside.$isShown) {
            searchAside = $aside({ scope: $scope, backdrop: false, dismissable: false, placement: 'right', template: 'app/views/modal/search.html' });
            searchAside.$promise.then(function () { searchAside.show(); });
        }
    };

    var hideSearch = function () {
        if (searchAside) {
            initAside();
            mapService.removeSearchMarkers();
            searchAside.hide();
        }
    };

    $scope.$on('$routeChangeSuccess', function () {
        $scope.mapVisible = !arguments[1].loadedTemplateUrl || arguments[1].redirectTo === "/home";

        if (!$scope.mapVisible) {
            hideSearch();
        }
    });

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

    $scope.authData = authService.userData;

    $scope.logout = function () {
        authService.logout();
        $location.path("/home");
    }

    mapService.ready.then(function (gmaps) {
        $scope.$watch('user.type', function (value) {
            if (value !== type) {
                if (searchAside && searchAside.$isShown) {
                    $scope.hideSearch();
                }

                mapService.showRoutes({ type: value });
                type = value;
            }
        });
    });

    mapService.contextMenuReady.then(function (gmaps) {
        $scope.$watch('searchModel.startLat', function (value) {
            if ($('#menu_search_from').length) $('#menu_search_from')[0].style.display = value ? 'none' : 'block';
            if ($('#menu_search_to').length) $('#menu_search_to')[0].style.display = value ? 'block' : 'none';

            var resetDisplay = ((($('#menu_go_from').length && $('#menu_go_from')[0].style.display === 'none') && $scope.authData.isAuth) || ($('#menu_search_from').length && $('#menu_search_from')[0].style.display === 'none')) ? 'block' : 'none';

            if ($('#menu_reset').length) $('#menu_reset')[0].style.display = resetDisplay;
            if ($('.context_menu_separator').length) $('.context_menu_separator')[0].style.display = resetDisplay;
        });

        $scope.$watch('searchModel.endLat', function (value) {
            if ($('#menu_search_to').length) $('#menu_search_to')[0].style.display = ($scope.searchModel.startLat && $scope.searchModel.endLat) || (!$scope.searchModel.startLat) ? 'none' : 'block';
        });
    });

    function initAside() {
        $scope.searchModel = {
            from: null,
            to: null,
            take: 2
            //routes: [
            //    { name: 'test1', description: 'descr1' }
            //],
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

        mapService.showRoutes($scope.searchModel).then(function (result) {

            var resultRoutes = [];

            if (result && result.length) {
                for (var i = 0; i < result.length; i++) {
                    resultRoutes.push({
                        name: result[i].startName + "-" + result[i].endName,
                        driver: result[i].name,
                        phone: result[i].phone,
                        distance: result[i].totalDistance,
                        duration: result[i].totalDuration
                    });
                }
            } else {
                statusService.warning("Подходящих результатов не найдено");
            }

            //initAside();
            resultRoutes[0].isActive = true;
            $scope.searchModel.routes = resultRoutes;
        });

        mapService.removeSearchMarkers();
        //searchAside.hide();
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

    $scope.hideSearch = hideSearch;

    $scope.onSearchClick = function () {
        if (!searchAside || !searchAside.$isShown) {
            showAside();
        }
        else {
            $scope.hideSearch();
        }
    };
});