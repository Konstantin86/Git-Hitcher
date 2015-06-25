/// <reference path="~/scripts/angular.min.js"/>

/// <reference path="~/app/app.js"/>

app.directive('routeListView', function () {
    return {
        restrict: 'E',
        scope: {
            routesInfo: '=routelist'
        },
        templateUrl: "/app/directives/routeListView.html"
    };
});