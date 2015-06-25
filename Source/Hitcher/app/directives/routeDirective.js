/// <reference path="~/scripts/angular.min.js"/>

/// <reference path="~/app/app.js"/>

app.directive('routeView', function () {
    return {
        restrict: 'E',
        scope: {
            routeInfo: '=route'
        },
        templateUrl: "/app/directives/routeView.html"
    };
});