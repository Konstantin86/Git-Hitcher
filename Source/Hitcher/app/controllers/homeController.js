/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/app/app.js"/>

app.controller("homeController", ["$scope", function ($scope) {

    var slides = $scope.slides = [];

    slides.push({
        image: "/content/images/lp_1.jpg",
        text: "Альтернатива такси есть..."
    });

    slides.push({
        image: "/content/images/lp_2.jpg",
        text: "Путешевствуйте вместе..."
    });

    slides.push({
        image: "/content/images/lp_3.jpg",
        text: "Надоело ездить на шестерке?"
    });

    slides.push({
        image: "/content/images/lp_4.jpg",
        text: "Путешевствуйте между городами и даже странами"
    });

    slides.push({
        image: "/content/images/lp_7.jpg",
        text: "Найдите попутчика внутри города"
    });

    slides.push({
        image: "/content/images/lp_5.jpg",
        text: "Надоело ездить на ланосе?"
    });

    slides.push({
        image: "/content/images/lp_6.jpg",
        text: "Надоело ездить на Тойоте?"
    });

    $scope.myInterval = 5000;
}]);