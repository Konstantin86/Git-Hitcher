/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/scripts/angular-resource.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/const/appConst.js"/>

"use strict";

app.service("mapService", function ($q, uiGmapGoogleMapApi, uiGmapIsReady) {

    var gmaps;
    var geocoder;

    var ready = $q.defer();

    var map = { center: { latitude: 40.1451, longitude: -99.6680 }, zoom: 4, control: {}, bounds: {} };
    var markers = [];

    var centerMap = function (lat, lng, zoom) {
        map.center = { latitude: lat, longitude: lng };
        map.zoom = zoom;
    };

    var centerOnMe = function () {
        navigator.geolocation.getCurrentPosition(function (pos) { centerMap(pos.coords.latitude, pos.coords.longitude, 12) });
    };

    var getLatLng = function (address) {
        var deferred = $q.defer();

        geocoder.geocode({ 'address': address }, function (response, status) {
            if (status === gmaps.GeocoderStatus.OK) {
                deferred.resolve(response);
            } else {
                deferred.reject(status);
            }
        });

        return deferred.promise;
    }

    var setMarker = function (lat, lng, key) {
        if (key == null) {
            key = "id";
        }

        var marker = { latitude: lat, longitude: lng, title: "Test" };
        marker[key] = markers.length + 1;

        markers.push(marker);
    };

    var setRoute = function (routePoints, index) {

        var deferred = $q.defer();

        var rendererOptions = {
            preserveViewport: true,
            routeIndex: index
        };

        var directionsDisplay = new gmaps.DirectionsRenderer(rendererOptions);
        directionsDisplay.setMap(map.control.getGMap());
        var start = routePoints.startLatLng;
        var end = routePoints.endLatLng;
        var request = { origin: start, destination: end, travelMode: gmaps.TravelMode.DRIVING };

        var directionsService = new gmaps.DirectionsService();
        directionsService.route(request, function (response, status) {
            if (status === gmaps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
            } else if (status === gmaps.GeocoderStatus.ZERO_RESULTS) {
            } else if (status === gmaps.GeocoderStatus.OVER_QUERY_LIMIT) {
                deferred.reject(index);
            }

            deferred.resolve(index);
        });

        return deferred.promise;
    };

    uiGmapGoogleMapApi.then(function (maps) {
        gmaps = maps;
        geocoder = new maps.Geocoder();
    });

    uiGmapIsReady.promise().then(function (gmaps) {
        ready.resolve(gmaps);
    });

    this.map = map;
    this.markers = markers;
    this.centerOnMe = centerOnMe;
    this.getLatLng = getLatLng;
    this.setMarker = setMarker;
    this.setRoute = setRoute;
    this.ready = ready.promise;
});