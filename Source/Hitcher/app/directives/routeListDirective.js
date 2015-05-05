app.directive('routeListView', function () {
    return {
        restrict: 'E',
        scope: {
            routesInfo: '=routelist',
            testInfo: '=test'
        },
        templateUrl: "/app/directives/routeListView.html"
    };
});