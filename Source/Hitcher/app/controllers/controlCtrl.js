app.controller('controlCtrl', function ($scope, mapService, authService, userService) {
    $scope.controlText = 'I\'m a custom control';
    $scope.danger = false;
    $scope.userData = authService.userData;

    $scope.user = userService.user;

    $scope.addRoute = function () {
        mapService.addRoute();
    };

    $scope.handleCenterMe = function () {
        mapService.centerOnMe();
    };
});