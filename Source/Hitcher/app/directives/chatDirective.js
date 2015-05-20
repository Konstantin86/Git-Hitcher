app.directive('chatView', function () {
    return {
        restrict: 'E',
        scope: {
            routeInfo: '=route'
        },
        templateUrl: "/app/directives/chatView.html"
    };
});