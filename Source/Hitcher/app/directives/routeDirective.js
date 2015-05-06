app.directive('routeView', function () {
    return {
        restrict: 'E',
        scope: {
            routeInfo: '=route'
        },
        templateUrl: "/app/directives/routeView.html"
    };
});