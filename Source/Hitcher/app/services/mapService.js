/// <reference path="~/scripts/gMapsContextMenu.js"/>
/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/scripts/angular-resource.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/const/appConst.js"/>
/// <reference path="~/app/services/statusService.js"/>
/// <reference path="~/app/services/routeService.js"/>

"use strict";

app.service("mapService", function ($rootScope, $q, $http, $timeout, $compile, appConst, routeService, statusService, uiGmapGoogleMapApi, uiGmapIsReady) {
    var gmaps, geocoder, mapControl;                                                            // google maps api objects
    var selectedRouteOptions, tempDirection, highlightRoutePolyline;                            // temp route objects
    var infoWindow, infoWindowCreating, infoWindowDelayTimer, underMouseLatLng;                 // infoWindow objects

    var polylines = [];
    var markers = [];

    var currentType;

    var routeOptions = [{ colors: ["#047D28", "#0FAB3E", "#06C941"], markerImage: "content/images/glyphicons-563-person-walking.png" },
                        { colors: ["#00CFFD", "#00B1FD", "#006EFD"], markerImage: "content/images/glyphicons-6-car.png" }];

    var currentLocation;

    var onMapMarkersChangedCallback, onFromMarkerSelectedCallback, onToMarkerSelectedCallback;

    var onSearchFromMarkerSelectedCallback, onSearchToMarkerSelectedCallback;

    var onResetSelectedCallbacks = [];
    var onAddRouteCallbacks = [];
    var onMarkerDragCallbacks = [];
    var onRouteChangedCallbacks = [];

    var ready = $q.defer();
    var contextMenuReady = $q.defer();

    var map = { center: { latitude: 49.1451, longitude: 35.6680 }, zoom: 4, control: {}, bounds: {} };

    var getShortAddress = function (address) {
        var route = "";
        var streetNum = "";

        for (var j = 0; j < address.address_components.length; j++) {
            if ($.inArray("route", address.address_components[j].types) >= 0) route = address.address_components[j].short_name;
            if ($.inArray("street_number", address.address_components[j].types) >= 0) streetNum = address.address_components[j].short_name;
        }

        return route + " " + streetNum;
    };

    var geocode = function (request, local, plain) {
        if (local && request.address) {
            request.address = currentLocation.city + ", " + request.address;
        }

        if (plain) return $http.get('https://maps.googleapis.com/maps/api/geocode/json', { params: request });

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
    };

    var centerOnMe = function () {
        navigator.geolocation.getCurrentPosition(function (pos) {
            centerMap(pos.coords.latitude, pos.coords.longitude, 12);
            var latlng = new gmaps.LatLng(pos.coords.latitude, pos.coords.longitude);
            geocode({ 'latLng': latlng }).then(function (result) {
                
                currentLocation = {};
                var addressComponents = result[0].address_components;

                for (var j = 0; j < addressComponents.length; j++) {
                    if ($.inArray("country", addressComponents[j].types) >= 0) currentLocation.country = addressComponents[j].short_name;
                    if ($.inArray("locality", addressComponents[j].types) >= 0) currentLocation.city = addressComponents[j].short_name;
                }
            });
        }, function () { }, { enableHighAccuracy: true, timeout: 2000 });
    };

    var setMarker = function (lat, lng, key, image, title) {
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
            icon: image || pinIcon,
            latitude: lat,
            longitude: lng,
            title: "Test",
            options: title ? { title: title } : { draggable: true, animation: gmaps.Animation.DROP }
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
    };

    var getRouteInfo = function (route) {
        var path = [];


        var legs = route.legs;
        for (var i = 0; i < legs.length; i++) {

            var steps = legs[i].steps;
            for (var j = 0; j < steps.length; j++) {
                var nextSegment = steps[j].path;
                for (var k = 0; k < nextSegment.length; k++) {
                    path.push({ Lat: nextSegment[k].lat(), Lng: nextSegment[k].lng() });
                }
            }
        }

        return { path: path };
    };

    var declareRoute = function (route) {
        var deferred = $q.defer();

        var rendererOptions = {
            draggable: true,
            preserveViewport: false,
            polylineOptions: { strokeColor: "#FF5900", strokeOpacity: 1, strokeWeight: 7, zIndex: 1000 }
        };

        var directionsDisplay = new gmaps.DirectionsRenderer(rendererOptions);
        directionsDisplay.setMap(mapControl);

        tempDirection = directionsDisplay;

        var request = { origin: route.startLatLng, destination: route.endLatLng, travelMode: gmaps.TravelMode.DRIVING };

        var directionsService = new gmaps.DirectionsService();

        directionsService.route(request, function (response, status) {
            if (status === gmaps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);

                gmaps.event.addListener(directionsDisplay, 'directions_changed', function () {
                    if (onRouteChangedCallbacks.length) {
                        onRouteChangedCallbacks.forEach(function (callback) {
                            if (typeof (callback) == "function") { callback(directionsDisplay); }
                        });
                    }
                });

                var routeInfo = getRouteInfo(response.routes[0]);
                routeInfo.totalDistance = response.routes[0].legs[0].distance.value;
                routeInfo.totalDuration = response.routes[0].legs[0].duration.value;
                deferred.resolve(routeInfo);
            }

            deferred.reject();
        });

        return deferred.promise;
    };

    var removeMarkers = function () {
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

    var removeTempMarkers = function () {

        var searchMarkers = [];
        for (var i = 0; i < markers.length; i++) {
            if (markers[i]["id"].indexOf("_temp") === -1) {
                searchMarkers.push(markers[i]);
            }
        }

        markers = searchMarkers;

        if (typeof (onMapMarkersChangedCallback) == "function") { onMapMarkersChangedCallback(markers); }
    };

    function clearTempDirection() {
        if (tempDirection) { tempDirection.set('directions', null); }
    };

    var clearAll = function () {
        polylines.forEach(function (pol) {
            pol.polyline.setMap(null);
        });

        removeMarkers();

        polylines = [];
    };

    var clearTemp = function () {
        removeTempMarkers();

        if (highlightRoutePolyline) {
            highlightRoutePolyline.polyline.setMap(null);
            highlightRoutePolyline = null;
        }
    };

    var setRoute = function (routeInfo, temp) {
        var polyline = new gmaps.Polyline({
            path: routeInfo.coords.map(function (r) { return new gmaps.LatLng(r.lat, r.lng); }),
            strokeColor: temp ? 'red' : routeOptions[routeInfo.type].colors[Math.floor((Math.random() * routeOptions[routeInfo.type].colors.length) + 0)],
            strokeOpacity: temp ? 0.3 : 0.6,
            strokeWeight: 6
        });

        polyline.setMap(mapControl);

        gmaps.event.addListener(polyline, "mouseover", function (e) {
            var polylinePoints = this.getPath().getArray();
            var polylineStartPoint = polylinePoints[0];
            var polylineEndPoint = polylinePoints[polylinePoints.length - 1];

            var info;

            polylines.forEach(function (p) {
                var points = p.polyline.getPath().getArray();
                if (points[0] === polylineStartPoint && points[points.length - 1] === polylineEndPoint) {
                    info = p.info;
                }
            });

            selectedRouteOptions = { strokeColor: this.strokeColor, strokeOpacity: this.strokeOpacity, zIndex: 1, strokeWeight: 5 };

            this.setOptions({ strokeColor: "#ffffff", strokeOpacity: 1, zIndex: 999, strokeWeight: 10 });

            $rootScope.highlightedRouteInfo = routeService.getRouteViewModel(info, true);
            var content = "<div><route-view route='highlightedRouteInfo'></route-view></div>";
            
            var compiled = $compile(content)($rootScope);

            if (infoWindow && infoWindow.isOpen()) {
                infoWindow.close();
                infoWindow = null;
            }

            if (!infoWindowCreating) {
                infoWindowDelayTimer = $timeout(function () {
                    if (infoWindowCreating) {
                        infoWindow = new gmaps.InfoWindow({ disableAutoPan: false });
                        if (underMouseLatLng) {
                            infoWindow.setPosition(new gmaps.LatLng(underMouseLatLng.lat() + 0.003, underMouseLatLng.lng()));
                        } else {
                            infoWindow.setPosition(new gmaps.LatLng(e.latLng.lat() + 0.003, e.latLng.lng()));
                        }
                        infoWindow.setContent(compiled[0]);

                        if (!infoWindow.isOpen()) {
                            infoWindow.open(mapControl);
                        }
                    }

                    infoWindowCreating = false;
                }, 1000);

                infoWindowCreating = true;
            }
        });

        gmaps.event.addListener(polyline, "mousemove", function (e) {
            if (infoWindow && infoWindow.isOpen()) {
                infoWindow.setPosition(new gmaps.LatLng(e.latLng.lat() + 0.003, e.latLng.lng()));
            }
        });

        gmaps.event.addListener(polyline, "mouseout", function () {
            this.setOptions(selectedRouteOptions);
            infoWindowCreating = false;
            $timeout.cancel(infoWindowDelayTimer);
        });

        var polylineInfo = { polyline: polyline, info: routeInfo };

        if (temp) {
            highlightRoutePolyline = polylineInfo;
        } else {
            polylines.push(polylineInfo);
        }

        var endMarkerKey = temp ? routeInfo.startLatLng + "_end_temp" : routeInfo.startLatLng + "_end";
        var startMarkerKey = temp ? routeInfo.endLatLng + "_start_temp" : routeInfo.endLatLng + "_start";

        var endCoords = routeInfo.coords[routeInfo.coords.length - 1];
        var startCoords = routeInfo.coords[0];

        setMarker(endCoords.lat, endCoords.lng, endMarkerKey, routeOptions[routeInfo.type].markerImage, routeInfo.endName);
        setMarker(startCoords.lat, startCoords.lng, startMarkerKey, routeOptions[routeInfo.type].markerImage, routeInfo.startName);
    };

    var onMapMarkersChanged = function (callback) { onMapMarkersChangedCallback = callback; };

    var onFromMarkerSelected = function (callback) { onFromMarkerSelectedCallback = callback; };

    var onToMarkerSelected = function (callback) { onToMarkerSelectedCallback = callback; };

    var onSearchFromMarkerSelected = function (callback) { onSearchFromMarkerSelectedCallback = callback; };

    var onSearchToMarkerSelected = function (callback) { onSearchToMarkerSelectedCallback = callback; };

    var onResetSelected = function (callback) {
        onResetSelectedCallbacks.push(callback);
    };

    // mode: 0 - hitcher, 1 driver
    var showRoutes = function (request, showOnMap) {
        if ((request.type != currentType) || !showOnMap) {
            currentType = request.type;

            var deferred = $q.defer();

            clearTempDirection();
            clearTemp();
            clearAll();

            routeService.resource.query(request, function(result) {
                if (result && result.length) {
                    for (var i = 0; i < result.length; i++) {
                        if (showOnMap) {
                            setRoute(result[i]);
                        }
                    }

                    deferred.resolve(result);
                }

                deferred.resolve(0);
            });

            return deferred.promise;
        }
    };

    var showMostRecentRoute = function () {
        clearTempDirection();

        routeService.resource.mostRecent({}, function(result) {
            if (result) {
                setRoute(result);
            }
        });
    };

    uiGmapGoogleMapApi.then(function (maps) {
        gmaps = maps;
        geocoder = new maps.Geocoder();
    });

    uiGmapIsReady.promise().then(function (googlemap) {
        mapControl = map.control.getGMap();

        gmaps.event.addListener(mapControl, 'mousemove', function (event) {
            underMouseLatLng = event.latLng;
        });

        initGmapsContextMenu(gmaps);

        var menuStyle = { menu: 'context_menu', menuSeparator: 'context_menu_separator', menuItem: 'context_menu_item' };

        var menuOptions = {
            id: "map_rightclick",
            eventName: "menu_item_selected",
            classNames: menuStyle,
            menuItems:
            [
               { label: 'Проложить маршрут отсюда', id: 'menu_go_from', eventName: 'onGoFromClick' },
               { label: 'Проложить маршрут сюда', id: 'menu_go_to', eventName: 'onGoToClick' },
               { label: 'Искать отсюда', id: 'menu_search_from', eventName: 'onSearchFromClick' },
               { label: 'Искать сюда', id: 'menu_search_to', eventName: 'onSearchToClick' },
               { id: 'Separator' },
               { label: 'Сброс', id: 'menu_reset', eventName: 'onResetClick' }
            ]
        };

        var contextMenu = new googlemaps.ContextMenu(mapControl, menuOptions);

        var handleContextMenyRouteClick = function (coords, markerType, callback) {
            setMarker(coords.k, coords.B, markerType);

            geocode({ 'latlng': coords.lat() + ',' + coords.lng(), 'language': 'ru' }, false, true).then(function (result) {
                if (result.data.results && result.data.results.length && typeof (callback) == "function") {
                    callback(getShortAddress(result.data.results[0]), coords);
                }
            });
        };

        var handleContextMenyResetClick = function (callbacks) {
            if (callbacks.length) {
                callbacks.forEach(function (callback) {
                    if (typeof (callback) == "function") { callback(); }
                });
            }
        };

        gmaps.event.addListener(mapControl, 'rightclick', function (mouseEvent) {
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

    var maskRoutes = function () {
        polylines.forEach(function (p) {
            p.polyline.setOptions({ strokeOpacity: 0.3 });
        });
    };

    var unmaskRoutes = function () {
        polylines.forEach(function (p) {
            p.polyline.setOptions({ strokeOpacity: 0.6 });
        });
    };

    function onMarkerDrag(callback) { onMarkerDragCallbacks.push(callback); };
    function onRouteChanged(callback) { onRouteChangedCallbacks.push(callback); };
    function onAddRoute(callback) { onAddRouteCallbacks.push(callback); };

    function addRoute () {
        if (onAddRouteCallbacks.length) {
            onAddRouteCallbacks.forEach(function (callback) {
                if (typeof (callback) == "function") { callback(); }
            });
        }
    };

    function refresh() {
        if (mapControl) {
            $timeout(function () {
                gmaps.event.trigger(mapControl, "resize");
                centerOnMe();
            }, 100);
        }
    };

    this.refresh = refresh;
    this.addRoute = addRoute;
    this.onAddRoute = onAddRoute;
    this.map = map;
    this.markers = markers;
    this.centerOnMe = centerOnMe;
    this.centerMap = centerMap;
    this.geocode = geocode;
    this.setMarker = setMarker;
    this.setRoute = setRoute;
    this.clearAll = clearAll;
    this.clearTemp = clearTemp;
    this.declareRoute = declareRoute;
    this.ready = ready.promise;
    this.contextMenuReady = contextMenuReady.promise;
    this.onMapMarkersChanged = onMapMarkersChanged;
    this.onFromMarkerSelected = onFromMarkerSelected;
    this.onToMarkerSelected = onToMarkerSelected;
    this.onSearchFromMarkerSelected = onSearchFromMarkerSelected;
    this.onSearchToMarkerSelected = onSearchToMarkerSelected;
    this.onResetSelected = onResetSelected;
    this.onMarkerDrag = onMarkerDrag;
    this.onRouteChanged = onRouteChanged;
    this.clearTempDirection = clearTempDirection;
    this.removeMarkers = removeMarkers;
    this.removeRouteMarkers = removeRouteMarkers;
    this.removeSearchMarkers = removeSearchMarkers;
    this.showRoutes = showRoutes;
    this.showMostRecentRoute = showMostRecentRoute;
    this.markerEvents = markerEvents;
    this.getShortAddress = getShortAddress;
    this.maskRoutes = maskRoutes;
    this.unmaskRoutes = unmaskRoutes;
});