/// <reference path="~/scripts/gMapsContextMenu.js"/>
/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/scripts/angular-resource.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/const/appConst.js"/>
/// <reference path="~/app/service/statusService.js"/>
/// <reference path="~/app/service/routeService.js"/>

"use strict";

app.service("mapService", function ($q, $http, $timeout, userService, routeService, statusService, uiGmapGoogleMapApi, uiGmapIsReady) {
    var gmaps;
    var geocoder;
    var mapControl;

    //var colors = ["#7F38EC", "#4B0082", "#F433FF", "#E42217", "#FFA62F", "#4CC417", "#008080", "#4EE2EC", "#3BB9FF", "#2B65EC", "#000000"];
    var colors = ["#DB0042", "#DB00B3", "#A100DB", "#3700DB", "#0066DB", "#00B7DB", "#00D17D", "#42D100", "#80B300", "#B37A00", "#B32100"];

    var currentColor = null;

    var tempRouteDirection = null;

    var directions = [];

    var polylines = [];

    String.prototype.toHHMMSS = function () {
        var sec_num = parseInt(this, 10); // don't forget the second param
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours < 10) { hours = "0" + hours; }
        if (minutes < 10) { minutes = "0" + minutes; }
        if (seconds < 10) { seconds = "0" + seconds; }
        var time = hours + ':' + minutes + ':' + seconds;
        return time;
    }

    var currentLocation;

    var onMapConfigChangedCallback;
    var onMapMarkersChangedCallback;
    var onFromMarkerSelectedCallback;
    var onToMarkerSelectedCallback;

    var onResetSelectedCallbacks = [];

    var onSearchFromMarkerSelectedCallback;
    var onSearchToMarkerSelectedCallback;

    var onMarkerDragCallbacks = [];
    var onRouteChangedCallbacks = [];

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
            polylineOptions: { strokeColor: colors[Math.floor((Math.random() * colors.length) + 0)], strokeOpacity: 0.7, strokeWeight: 5 }
        };

        var directionsDisplay = new gmaps.DirectionsRenderer(rendererOptions);
        directionsDisplay.setMap(mapControl);

        tempRouteDirection = directionsDisplay;
        //directions.push(directionsDisplay);

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

                //var infowindow = new gmaps.InfoWindow({
                //    content: 'tesdt'
                //});

                //infowindow.open(mapControl);
                var routeInfo = getRouteInfo(response.routes[0]);
                routeInfo.totalDistance = response.routes[0].legs[0].distance.value;
                routeInfo.totalDuration = response.routes[0].legs[0].duration.value;
                deferred.resolve(routeInfo);
            } else if (status === gmaps.GeocoderStatus.ZERO_RESULTS) { } else if (status === gmaps.GeocoderStatus.OVER_QUERY_LIMIT) {
                deferred.reject();
            }

            deferred.resolve();
        });

        return deferred.promise;
    };

    var setRoute = function (routePoints, index) {
        var rendererOptions = {
            preserveViewport: true,
            polylineOptions: { strokeColor: colors[Math.floor((Math.random() * colors.length) + 0)], strokeOpacity: 0.7, strokeWeight: 5 },
            routeIndex: index
        };

        var polyline = new gmaps.Polyline({
            path: routePoints.coords.map(function (r) { return new gmaps.LatLng(r.lat, r.lng); }),

            // TODO uncomment to display each 10 point
            //path: routePoints.coords.filter(function (element) { return routePoints.coords.indexOf(element) % 10 === 0; }).map(function (r) { return new gmaps.LatLng(r.lat, r.lng); }),
            strokeColor: colors[Math.floor((Math.random() * colors.length) + 0)],
            strokeOpacity: 0.6,
            strokeWeight: 5
        });

        var info = {
            startName: routePoints.startName,
            endName: routePoints.endName,
            totalDistance: routePoints.totalDistance,
            totalDuration: routePoints.totalDuration
        };

        polyline.setMap(mapControl);


        var infowindow = new gmaps.InfoWindow({
            content: 'tesdt'
        });

        //infowindow.open(mapControl);

        gmaps.event.addListener(polyline, "click", function (e) {
            var content = '<div style="width:200px;">'
    + '<b>From: </b>' + info.startName + '<br/>'
    + '<b>To: </b>' + info.endName + '<br/>'
    + '<b>Distance: </b>' + Math.floor(info.totalDistance / 1000) + ' км, ' + info.totalDistance % 1000 + ' м<br/>'
    + '<b>Duration: </b>' + (' ' + info.totalDuration).toHHMMSS() + '<br/>'
    + '<b>Driver: </b>Василий Залупенко' + '<br/>'
    + '<b>Phone: </b>+3(096)123-45-67'
    + '</div>';

            //infowindow.setPosition(new gmaps.LatLng(e.latLng.lat() + 0.001, e.latLng.lng()));
            infowindow.setContent(content);
        });

        gmaps.event.addListener(polyline, "mouseover", function (e) {
            var polylinePoints = this.getPath().getArray();
            var polylineStartPoint = polylinePoints[0];
            var polylineEndPoint = polylinePoints[polylinePoints.length - 1];

            var info;

            polylines.forEach(function (p) {
                p.polyline.setOptions({ strokeOpacity: 0.3 });

                var points = p.polyline.getPath().getArray();
                if (points[0] === polylineStartPoint && points[points.length - 1] === polylineEndPoint) {
                    info = p.info;
                }
            });

            currentColor = this.strokeColor;
            this.setOptions({ strokeColor: "#ffffff", strokeOpacity: 1, zIndex: 999, strokeWeight: 10 });

            //var content = this.getPath().getArray()[this.getPath().getArray().length - 1];

            var content = '<div style="width:200px;">'
                //+ '<b>From:</b>' + info.startName + '<br/>'
                //+ '<b>To:</b>' + info.endName + '<br/>'
                //+ '<b>Distance:</b>' + info.totalDistance + '<br/>'
                //+ '<b>Duration:</b>' + info.totalDuration + '<br/>'
                + '<b>Driver: </b>Василий Залупенко' + '<br/>'
                + '<b>Phone: </b>+3(096)123-45-67' + '<br/><br/>'
                + '<i>Click for more details...</i>'
                + '</div>';

            infowindow.setPosition(new gmaps.LatLng(e.latLng.lat() + 0.001, e.latLng.lng()));
            infowindow.setContent(content);
            //if (!infowindow.isOpen()) {
            infowindow.open(mapControl);
            //}
        });

        gmaps.event.addListener(polyline, "mousemove", function (e) {
            infowindow.setPosition(new gmaps.LatLng(e.latLng.lat() + 0.001, e.latLng.lng()));
        });

        gmaps.event.addListener(polyline, "mouseout", function (e) {
            polylines.forEach(function (p) {
                p.polyline.setOptions({ strokeOpacity: 0.6 });
            });

            if (currentColor) {
                this.setOptions({ strokeColor: currentColor, strokeOpacity: 0.6, zIndex: 1, strokeWeight: 5 });
            }

            //$timeout(function() {
                infowindow.close();
            //}, 500);
            
        });

        var polylineInfo = {
            polyline: polyline,
            info: info
        };

        polylines.push(polylineInfo);
        //polylines.push(polyline);

        var test = {
            "mc": { destination: routePoints.startLatLng, origin: routePoints.endLatLng, travelMode: "DRIVING" },
            "routes": [{
                "legs": [{
                    "end_address": routePoints.endName,
                    "end_location": { "lat": routePoints.coords[routePoints.coords.length - 1].lat, "lng": routePoints.coords[routePoints.coords.length - 1].lng },
                    "start_address": routePoints.startName,
                    "start_location": { "lat": routePoints.coords[0].lat, "lng": routePoints.coords[0].lng }
                }]
            }]
        };

        var directionsDisplay = new gmaps.DirectionsRenderer(rendererOptions);
        directionsDisplay.setMap(mapControl);

        directions.push(directionsDisplay);

        directionsDisplay.setDirections(test);
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

        if (tempRouteDirection) {
            tempRouteDirection.set('directions', null);
        }

        directions.forEach(function (dir) {
            dir.set('directions', null);
        });

        polylines.forEach(function (pol) {
            pol.polyline.setMap(null);
            //pol.setMap(null);
        });

        directions = [];
        polylines = [];


        routeService.resource.query(request, function (result) {
            if (result && result.length) {
                for (var i = 0; i < result.length; i++) {
                    setRoute(result[i], i);
                }

                deferred.resolve(result.length);
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

    var onMarkerDrag = function (callback) {
        onMarkerDragCallbacks.push(callback);
    };

    var onRouteChanged = function (callback) {
        onRouteChangedCallbacks.push(callback);
    };

    var removeTempRoute = function () {
        if (tempRouteDirection) {
            tempRouteDirection.set('directions', null);
        }
    };

    this.map = map;
    this.markers = markers;
    this.centerOnMe = centerOnMe;
    this.centerMap = centerMap;
    this.geocode = geocode;
    this.setMarker = setMarker;
    this.setRoute = setRoute;
    this.declareRoute = declareRoute;
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
    this.onRouteChanged = onRouteChanged;
    this.removeTempRoute = removeTempRoute;
    this.removeMarkers = removeMarkers;
    this.removeRouteMarkers = removeRouteMarkers;
    this.removeSearchMarkers = removeSearchMarkers;
    this.showRoutes = showRoutes;
    this.markerEvents = markerEvents;
});