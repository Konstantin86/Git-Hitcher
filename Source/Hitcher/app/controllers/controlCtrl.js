app.controller('controlCtrl', function ($scope) {
    $scope.controlText = 'I\'m a custom control';
    $scope.danger = false;
    $scope.handleCenterMe = function () {
        $scope.danger = !$scope.danger;
        alert('custom control clicked!');
    };
});