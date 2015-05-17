app.controller('controlCtrl', function ($scope, mapService, authService, userService) {
    $scope.controlText = 'I\'m a custom control';
    $scope.danger = false;
    $scope.userData = authService.userData;

    $scope.user = userService.user;

    $scope.authData = authService.userData;
    $scope.displayOptions = mapService.displayOptions;

    mapService.ready.then(function () {
        $scope.$watch('displayOptions.highlightMyRoutes', function () { mapService.updateHighlight(); });
    });

    $scope.addRoute = function () {
        mapService.addRoute();
    };

    $scope.handleCenterMe = function () {
        mapService.centerOnMe();
    };
});