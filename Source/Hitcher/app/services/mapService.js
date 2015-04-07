/// <reference path="~/scripts/gMapsContextMenu.js"/>
/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/scripts/angular-resource.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/const/appConst.js"/>
/// <reference path="~/app/service/statusService.js"/>
/// <reference path="~/app/service/routeService.js"/>

"use strict";

app.service("mapService", function ($q, $http, $timeout, routeService, statusService, uiGmapGoogleMapApi, uiGmapIsReady) {
    var gmaps;
    var geocoder;
    var mapControl;

    var loadCount;

    var colors = ["#7F38EC", "#4B0082", "#F433FF", "#E42217", "#FFA62F", "#4CC417", "#008080", "#4EE2EC", "#3BB9FF", "#2B65EC", "#000000"];

    var directions = [];

    var currentLocation;

    var onMapConfigChangedCallback;
    var onMapMarkersChangedCallback;
    var onFromMarkerSelectedCallback;
    var onToMarkerSelectedCallback;

    var onResetSelectedCallbacks = [];

    var onSearchFromMarkerSelectedCallback;
    var onSearchToMarkerSelectedCallback;

    var onMarkerDragCallbacks = [];

    var ready = $q.defer();
    var contextMenuReady = $q.defer();

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
        // Use this doc to find info regarding icon image generation: https://developers.google.com/chart/image/docs/gallery/dynamic_icons?csw=1#pins
        var letter = key && key.indexOf("to") > -1 ? "B" : "A";
        var color = key && key.indexOf("Search") > -1 ? "EDED0C" : "2DE02D";

        var pinIcon = new gmaps.MarkerImage(
                "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=" + letter + "|" + color,
                null, /* size is determined at runtime */
                null, /* origin is 0,0 */
                null, /* anchor is bottom center of the scaled image */
                new gmaps.Size(24, 37)
            );

        var marker = {
            //icon: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=A|FF0000|0030F2",
            icon: pinIcon,
            latitude: lat,
            longitude: lng,
            title: "Test",
            options: { draggable: true, animation: gmaps.Animation.DROP }
        };
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

    var getRouteInfo = function (route) {
        var totalDistance = 0;
        var totalDuration = 0;
        var legs = route.legs;
        for (var i = 0; i < legs.length; ++i) {
            totalDistance += legs[i].distance.value;
            totalDuration += legs[i].duration.value;
        }

        return {
            totalDistance: totalDistance,
            totalDuration: totalDistance,
            path: route.overview_path.map(function (m) { return { lat: m.lat(), lng: m.lng() }; })
        };
    };

    var setRoute = function (routePoints, preserveViewport, returnRouteInfo, index) {
        var deferred = $q.defer();

        var rendererOptions = {
            //draggable: true,   // TODO plan how to handle saving route coords to db
            preserveViewport: preserveViewport,
            polylineOptions: { strokeColor: colors[Math.floor((Math.random() * colors.length) + 0)], strokeOpacity: 0.7, strokeWeight: 5 },
            routeIndex: index
        };

        var directionsDisplay = new gmaps.DirectionsRenderer(rendererOptions);
        directionsDisplay.setMap(mapControl);

        directions.push(directionsDisplay);

        var directionsService = new gmaps.DirectionsService();
        var request = { origin: routePoints.startLatLng, destination: routePoints.endLatLng, travelMode: gmaps.TravelMode.DRIVING };
        directionsService.route(request, function (response, status) {
            if (status === gmaps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);

                if (returnRouteInfo) {
                    var routeInfo = getRouteInfo(response.routes[0]);
                    deferred.resolve(routeInfo);
                }
            } else if (status === gmaps.GeocoderStatus.ZERO_RESULTS) { } else if (status === gmaps.GeocoderStatus.OVER_QUERY_LIMIT) {
                deferred.reject(index);
            }

            deferred.resolve(index);
        });

        return deferred.promise;
    };

    var onMapConfigChanged = function (callback) { onMapConfigChangedCallback = callback; };

    var onMapMarkersChanged = function (callback) { onMapMarkersChangedCallback = callback; };

    var onFromMarkerSelected = function (callback) { onFromMarkerSelectedCallback = callback; };

    var onToMarkerSelected = function (callback) { onToMarkerSelectedCallback = callback; };

    var onSearchFromMarkerSelected = function (callback) { onSearchFromMarkerSelectedCallback = callback; };

    var onSearchToMarkerSelected = function (callback) { onSearchToMarkerSelectedCallback = callback; };

    var onResetSelected = function (callback) {
        onResetSelectedCallbacks.push(callback);
    };

    var removeMarkers = function () {
        //for (var i = 0; i < markers.length; i++) {
        //    if (markers[i]["id"] === "fromMarker" || markers[i]["id"] === "toMarker" || markers[i]["id"] === "fromSearchMarker" || markers[i]["id"] === "toSearchMarker") {
        //        markers = markers.splice(i, 1);
        //    }
        //}

        markers = [];

        if (typeof (onMapMarkersChangedCallback) == "function") { onMapMarkersChangedCallback(markers); }
    };

    var removeRouteMarkers = function () {

        var routeMarkers = [];
        for (var i = 0; i < markers.length; i++) {
            if (markers[i]["id"] !== "fromMarker" && markers[i]["id"] !== "toMarker") {
                routeMarkers.push(markers[i]);
            }
        }

        markers = routeMarkers;

        if (typeof (onMapMarkersChangedCallback) == "function") { onMapMarkersChangedCallback(markers); }
    };

    var removeSearchMarkers = function () {

        var searchMarkers = [];
        for (var i = 0; i < markers.length; i++) {
            if (markers[i]["id"] !== "fromSearchMarker" && markers[i]["id"] !== "toSearchMarker") {
                searchMarkers.push(markers[i]);
            }
        }

        markers = searchMarkers;

        if (typeof (onMapMarkersChangedCallback) == "function") { onMapMarkersChangedCallback(markers); }
    };

    // mode: 0 - hitcher, 1 driver
    var showRoutes = function (request) {
        var deferred = $q.defer();

        directions.forEach(function (dir) {
            dir.set('directions', null);
        });

        directions = [];

        routeService.resource.query(request, function (result) {
            if (result && result.length) {
                loadCount = result.length - 1;
                statusService.loading("Загрузка маршрутов...");

                var drawRoute = function (i) {
                    setRoute(result[i], true, false, i).then(function () {
                        if (loadCount > 0) {
                            loadCount--;
                        }

                        if (loadCount === 0) {
                            statusService.clear();
                            deferred.resolve(result.length);
                        }
                    }, function (index) {
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

            deferred.resolve(0);
        });

        return deferred.promise;
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
               { label: 'Еду сюда', id: 'menu_go_to', eventName: 'onGoToClick' },
               { label: 'Ищу отсюда', id: 'menu_search_from', eventName: 'onSearchFromClick' },
               { label: 'Ищу сюда', id: 'menu_search_to', eventName: 'onSearchToClick' },
               { id: 'Separator' },
               { label: 'Сброс', id: 'menu_reset', eventName: 'onResetClick' }
            ]
        };

        var contextMenu = new googlemaps.ContextMenu(mapControl, menuOptions);

        var handleContextMenyRouteClick = function (coords, markerType, callback) {
            setMarker(coords.k, coords.B, markerType);

            geocode({ 'latlng': coords.lat() + ',' + coords.lng(), 'language': 'ru' }, false, true).then(function (result) {
                if (result.data.results && result.data.results.length && typeof (callback) == "function") {
                    callback(result.data.results[0].formatted_address, coords);
                }
            });
        };

        var handleContextMenyResetClick = function (callbacks) {

            if (callbacks.length) {
                callbacks.forEach(function (callback) {
                    if (typeof (callback) == "function") { callback(); }
                });
            }

            //if (typeof (callback) == "function") {
            //    callback();
            //}
        };

        gmaps.event.addListener(mapControl, 'rightclick', function(mouseEvent) {
            contextMenu.show(mouseEvent.latLng);
            contextMenuReady.resolve();
        });

        gmaps.event.addListener(contextMenu, 'onGoFromClick', function (coords) { handleContextMenyRouteClick(coords, "fromMarker", onFromMarkerSelectedCallback); });
        gmaps.event.addListener(contextMenu, 'onGoToClick', function (coords) { handleContextMenyRouteClick(coords, "toMarker", onToMarkerSelectedCallback); });

        gmaps.event.addListener(contextMenu, 'onSearchFromClick', function (coords) { handleContextMenyRouteClick(coords, "fromSearchMarker", onSearchFromMarkerSelectedCallback); });
        gmaps.event.addListener(contextMenu, 'onSearchToClick', function (coords) { handleContextMenyRouteClick(coords, "toSearchMarker", onSearchToMarkerSelectedCallback); });

        gmaps.event.addListener(contextMenu, 'onResetClick', function () { handleContextMenyResetClick(onResetSelectedCallbacks); });

        ready.resolve(googlemap);
    });

    var markerEvents = {
        dragend: function (marker, eventName, args) {

            if (onMarkerDragCallbacks.length) {
                onMarkerDragCallbacks.forEach(function (callback) {
                    if (typeof (callback) == "function") { callback(marker, eventName, args); }
                });
            }
        }
    };

    var onMarkerDrag = function (callback) {
        onMarkerDragCallbacks.push(callback);
    }

    this.map = map;
    this.markers = markers;
    this.centerOnMe = centerOnMe;
    this.centerMap = centerMap;
    this.geocode = geocode;
    this.setMarker = setMarker;
    this.setRoute = setRoute;
    this.ready = ready.promise;
    this.contextMenuReady = contextMenuReady.promise;
    this.onMapConfigChanged = onMapConfigChanged;
    this.onMapMarkersChanged = onMapMarkersChanged;
    this.onFromMarkerSelected = onFromMarkerSelected;
    this.onToMarkerSelected = onToMarkerSelected;
    this.onSearchFromMarkerSelected = onSearchFromMarkerSelected;
    this.onSearchToMarkerSelected = onSearchToMarkerSelected;
    this.onResetSelected = onResetSelected;
    this.onMarkerDrag = onMarkerDrag;
    this.removeMarkers = removeMarkers;
    this.removeRouteMarkers = removeRouteMarkers;
    this.removeSearchMarkers = removeSearchMarkers;
    this.showRoutes = showRoutes;
    this.markerEvents = markerEvents;
});