/// <reference path="~/scripts/gMapsContextMenu.js"/>
/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/scripts/angular-resource.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/const/appConst.js"/>

"use strict";

app.service("mapService", function ($q, $http, uiGmapGoogleMapApi, uiGmapIsReady) {
    var gmaps;
    var geocoder;
    var mapControl;

    var colors = ["#7F38EC", "#4B0082", "#F433FF", "#E42217", "#FFA62F", "#4CC417", "#008080", "#4EE2EC", "#3BB9FF", "#2B65EC", "#000000"];

    var currentLocation;

    var onMapConfigChangedCallback;
    var onMapMarkersChangedCallback;
    var onFromMarkerSelectedCallback;
    var onToMarkerSelectedCallback;

    var ready = $q.defer();

    var map = { center: { latitude: 49.1451, longitude: 35.6680 }, zoom: 4, control: {}, bounds: {} };
    var markers = [];

    var geocode = function (request, local, plain) {
        if (local && request.address) {
            request.address = currentLocation.city + ", " + request.address;
        }

        if (plain) {
            return $http.get('https://maps.googleapis.com/maps/api/geocode/json', { params: request });
        }

        var deferred = $q.defer();

        geocoder.geocode(request, function (response, status) {
            if (status === gmaps.GeocoderStatus.OK) {
                deferred.resolve(response);
            } else { deferred.reject(status); }
        });

        return deferred.promise;
    }

    var centerMap = function (lat, lng, zoom) {
        mapControl.panTo(new gmaps.LatLng(lat, lng));
        mapControl.setZoom(zoom);

        if (typeof (onMapConfigChangedCallback) == "function") {
            onMapConfigChangedCallback();
        }
    };

    var centerOnMe = function () {
        navigator.geolocation.getCurrentPosition(function (pos) {
            centerMap(pos.coords.latitude, pos.coords.longitude, 12);
            var latlng = new gmaps.LatLng(pos.coords.latitude, pos.coords.longitude);
            geocode({ 'latLng': latlng }).then(function (result) {
                currentLocation = {};
                for (var j = 0; j < result[0].address_components.length; j++) {
                    if ($.inArray("country", result[0].address_components[j].types) >= 0) {
                        currentLocation.country = result[0].address_components[j].short_name;
                    }

                    if ($.inArray("locality", result[0].address_components[j].types) >= 0) {
                        currentLocation.city = result[0].address_components[j].short_name;
                    }
                }
            });
        }, function () { }, { enableHighAccuracy: true, timeout: 2000 });
    };

    var setMarker = function (lat, lng, key) {
        var marker = { latitude: lat, longitude: lng, title: "Test" };
        marker["id"] = key;

        var markerIndex = null;

        for (var i = 0; i < markers.length; i++) {
            if (markers[i]["id"] === key) {
                markerIndex = i;
                break;
            }
        }

        if (markerIndex != null) {
            markers[markerIndex].latitude = lat;
            markers[markerIndex].longitude = lng;
        } else {
            markers.push(marker);
        }

        if (typeof (onMapConfigChangedCallback) == "function") {
            onMapConfigChangedCallback();
        }
    };

    var setRoute = function (routePoints, index) {
        var deferred = $q.defer();

        var rendererOptions = {
            preserveViewport: true,
            polylineOptions: { strokeColor: colors[Math.floor((Math.random() * colors.length) + 0)], strokeOpacity: 0.7, strokeWeight: 5 },
            routeIndex: index
        };

        var directionsDisplay = new gmaps.DirectionsRenderer(rendererOptions);
        directionsDisplay.setMap(mapControl);
        
        var directionsService = new gmaps.DirectionsService();
        var request = { origin: routePoints.startLatLng, destination: routePoints.endLatLng, travelMode: gmaps.TravelMode.DRIVING };
        directionsService.route(request, function (response, status) {
            if (status === gmaps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
            } else if (status === gmaps.GeocoderStatus.ZERO_RESULTS) {} else if (status === gmaps.GeocoderStatus.OVER_QUERY_LIMIT) {
                deferred.reject(index);
            }

            deferred.resolve(index);
        });

        return deferred.promise;
    };

    var onMapConfigChanged = function (callback) { onMapConfigChangedCallback = callback; };

    var onMapMarkersChanged = function(callback) { onMapMarkersChangedCallback = callback; };

    var onFromMarkerSelected = function (callback) { onFromMarkerSelectedCallback = callback; };

    var onToMarkerSelected = function (callback) { onToMarkerSelectedCallback = callback; };

    var removeMarkers = function() {
        for (var i = 0; i < markers.length; i++) {
            if (markers[i]["id"] === "fromMarker" || markers[i]["id"] === "toMarker") {
                markers = markers.splice(1, i);
            }
        }

        if (typeof (onMapMarkersChangedCallback) == "function") { onMapMarkersChangedCallback(markers); }
    };

    uiGmapGoogleMapApi.then(function (maps) {
        gmaps = maps;
        geocoder = new maps.Geocoder();
    });

    uiGmapIsReady.promise().then(function (googlemap) {
        mapControl = map.control.getGMap();

        initGmapsContextMenu(gmaps);

        var menuStyle = { menu: 'context_menu', menuSeparator: 'context_menu_separator', menuItem: 'context_menu_item' };

        var menuOptions = {
            id: "map_rightclick",
            eventName: "menu_item_selected",
            classNames: menuStyle,
            menuItems:
            [
               { label: 'Еду отсюда', id: 'menu_go_from', eventName: 'onGoFromClick' },
               { label: 'Еду сюда', id: 'menu_go_to', eventName: 'onGoToClick' }
            ]
        };

        var contextMenu = new googlemaps.ContextMenu(mapControl, menuOptions);

        var handleContextMenyRouteClick = function (coords, markerType, callback) {
            setMarker(coords.k, coords.B, markerType);

            geocode({ 'latLng': coords }).then(function (result) {
                if (result && result.length && typeof (callback) == "function") {
                    callback(result[0].formatted_address, coords);
                }
            });
        };

        gmaps.event.addListener(mapControl, 'rightclick', function (mouseEvent) { contextMenu.show(mouseEvent.latLng); });

        gmaps.event.addListener(contextMenu, 'onGoFromClick', function (coords) { handleContextMenyRouteClick(coords, "fromMarker", onFromMarkerSelectedCallback); });

        gmaps.event.addListener(contextMenu, 'onGoToClick', function (coords) { handleContextMenyRouteClick(coords, "toMarker", onToMarkerSelectedCallback); });

        ready.resolve(googlemap);
    });

    this.map = map;
    this.markers = markers;
    this.centerOnMe = centerOnMe;
    this.geocode = geocode;
    this.setMarker = setMarker;
    this.setRoute = setRoute;
    this.ready = ready.promise;
    this.onMapConfigChanged = onMapConfigChanged;
    this.onMapMarkersChanged = onMapMarkersChanged;
    this.onFromMarkerSelected = onFromMarkerSelected;
    this.onToMarkerSelected = onToMarkerSelected;
    this.removeMarkers = removeMarkers;
});