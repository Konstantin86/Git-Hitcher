app.directive('routeListView', function () {
    return {
        restrict: 'E',
        scope: {
            routesInfo: '=routelist'
        },
        templateUrl: "/app/directives/routeListView.html"
    };
});