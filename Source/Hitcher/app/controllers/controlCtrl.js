app.controller('controlCtrl', function ($scope, mapService) {
    $scope.controlText = 'I\'m a custom control';
    $scope.danger = false;
    $scope.handleCenterMe = function () {
        mapService.centerOnMe();
    };
});