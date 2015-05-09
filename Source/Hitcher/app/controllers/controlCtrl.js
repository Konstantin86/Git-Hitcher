app.controller('controlCtrl', function ($scope, mapService, authService, userService) {
    $scope.controlText = 'I\'m a custom control';
    $scope.danger = false;
    $scope.userData = authService.userData;
    //$scope.user = userService.user;

    //mapService.ready.then(function (gmaps) {
    //    $scope.$watch('user.type', function (value) {
    //        if (value !== type) {
    //            if (searchAside && searchAside.$isShown) {
    //                $scope.hideSearch();
    //            }

    //            mapService.showRoutes({ type: 1 - value }, true);
    //            type = value;
    //        }
    //    });
    //});

    $scope.addRoute = function () {
        mapService.addRoute();
    };

    $scope.handleCenterMe = function () {
        mapService.centerOnMe();
    };
});