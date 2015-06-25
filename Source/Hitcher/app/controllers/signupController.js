/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/const/msgConst.js"/>
/// <reference path="~/app/services/authService.js"/>
/// <reference path="~/app/services/statusService.js"/>
/// <reference path="~/app/services/errorService.js"/>
/// <reference path="~/app/utils/system/system-ns.js" />
/// <reference path="~/app/utils/system/system-string.js" />

app.controller("signupController", ["$scope", "$location", "$timeout", "msgConst", "errorService", "authService", "statusService", function ($scope, $location, $timeout, msgConst, errorService, authService, statusService) {
    statusService.clear();

    $scope.success = false;
    $scope.submitted = false;

    $scope.formData = { userName: "", email: "", password: "", confirmPassword: "" };

    $scope.signUp = function () {
        $scope.submitted = true;
        authService.logout();
        authService.auth.save($scope.formData, onSignupSucceed, onSignupFailed);

        function onSignupSucceed() {
            $scope.success = true;

            statusService.success(system.string.format(msgConst.SIGNUP_SUCCESS_FORMAT, $scope.formData.userName));

            var startTimer = function () {
                var timer = $timeout(function () {
                    $timeout.cancel(timer);
                    $location.path("/login");
                }, 5000);
            }

            startTimer();
        }

        function onSignupFailed(response) {
            statusService.error(errorService.parseFormResponse(response));
        }
    };
}]);