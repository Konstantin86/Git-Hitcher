/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/const/appConst.js"/>
/// <reference path="~/app/const/msgConst.js"/>
/// <reference path="~/app/services/authService.js"/>
/// <reference path="~/app/services/statusService.js"/>
/// <reference path="~/app/utils/system/system-ns.js" />
/// <reference path="~/app/utils/system/system-string.js" />
"use strict";

app.controller("loginController", function ($scope, $location, $alert, statusService, authService, errorService, appConst, msgConst) {

    $scope.formData = { userName: "", password: "" };

    $scope.login = function () {
        authService.login($scope.formData).then(function () {
            $location.path("/map");
        }, function (response) {
            $scope.formData = { userName: "", password: "" };
            statusService.error(errorService.parseAuthResponse(response));
        });
    };

    $scope.forgotPasswordModal =
    {
        title: "Password recovery",
        editable: true,
        input: "",
        content: msgConst.LOGIN_PWD_RECOVERY_INSTRUCTIONS,
        yes: function () {
            var modal = this;
            authService.auth.resetPassword({ email: modal.input, callbackLink: location.protocol + "//" + location.host + "/#/login" }, function () {
                modal.$hide();
                statusService.success(system.string.format(msgConst.LOGIN_PWD_RECOVERY_LINK_SENT_FORMAT, modal.input));
            }, function (response) {
                modal.$hide();
                statusService.error(errorService.parseDataResponse(response));
            });
        }
    };

    $scope.externalLogin = function (provider) {
        var redirectUri = location.protocol + "//" + location.host + "/authcomplete.html";
        var externalProviderUrl = "/api/auth/externalLogin?provider=" + provider + "&response_type=token&client_id=" + "Hitcher" + "&redirect_uri=" + redirectUri;
        window.$windowScope = $scope;
        window.open(externalProviderUrl, "Authenticate Account", "location=0,status=0,width=600,height=750");
    };

    $scope.authCompletedCB = function (fragment) {
        $scope.$apply(function () {
            authService.obtainAccessToken({ provider: fragment.provider, externalAccessToken: fragment.external_access_token, userId: fragment.user_id }).then(function () {
                $location.path("/map");
            }, function (response) {
                statusService.error(errorService.parseDataResponse(response));
            });
        });
    }
});