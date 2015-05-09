app.controller('controlCtrl', function ($scope, mapService, authService) {
    $scope.controlText = 'I\'m a custom control';
    $scope.danger = false;
    $scope.userData = authService.userData;

    $scope.addRoute = function () {
        mapService.addRoute();
    };

    $scope.handleCenterMe = function () {
        mapService.centerOnMe();
    };
});