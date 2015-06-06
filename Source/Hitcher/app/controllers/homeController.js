/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/services/authService.js"/>
/// <reference path="~/app/services/mapService.js"/>
/// <reference path="~/app/services/statusService.js"/>

"use strict";

app.controller("homeController", function ($scope, $location, $aside, appConst, authService, userService, routeService, mapService, statusService, chatService) {
    statusService.clear();

    //$scope.welcomeText = msgConst.HOME_WELCOME;
    //$scope.welcomeHeader = msgConst.HOME_WELCOME_HEADER;

    var hostUri = appConst.serviceBase;

    var slides = $scope.slides = [];

    slides.push({
        image: hostUri + "content/images/lp_1.jpg",
        text: "Альтернатива такси есть..."
    });

    slides.push({
        image: hostUri + "content/images/lp_2.jpg",
        text: "Путешевствуйте вместе..."
    });

    slides.push({
        image: hostUri + "content/images/lp_3.jpg",
        text: "Надоело ездить на шестерке?"
    });

    slides.push({
        image: hostUri + "content/images/lp_4.jpg",
        text: "Путешевствуйте между городами и даже странами"
    });

    slides.push({
        image: hostUri + "content/images/lp_7.jpg",
        text: "Найдите попутчика внутри города"
    });

    slides.push({
        image: hostUri + "content/images/lp_5.jpg",
        text: "Надоело ездить на ланосе?"
    });

    slides.push({
        image: hostUri + "content/images/lp_6.jpg",
        text: "Надоело ездить на Тойоте?"
    });

    //slides.push({
    //    image: hostUri + "content/images/3-work-hard.jpg",
    //    text: "Work hard..."
    //});

    //slides.push({
    //    image: hostUri + "content/images/4-take-suggestions-from-community.jpg",
    //    text: "Suggest with community..."
    //});

    //slides.push({
    //    image: hostUri + "content/images/5-do-something-every-day.jpg",
    //    text: "Do something every day..."
    //});

    //slides.push({
    //    image: hostUri + "content/images/6-achieve-your-goals.jpg",
    //    text: "Achieve your goals..."
    //});

    //slides.push({
    //    image: hostUri + "content/images/7-share-your-success.jpg",
    //    text: "Share your success..."
    //});

    //slides.push({
    //    image: hostUri + "content/images/8-observe-places.jpg",
    //    text: "Observe Places..."
    //});

    $scope.myInterval = 5000;
});