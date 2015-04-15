/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/const/appConst.js"/>
///// <reference path="~/app/services/authService.js"/>
/// <reference path="~/app/services/statusService.js"/>
"use strict";

app.controller("loginController", function ($scope, $location) {

    //statusService.clear();

    //$scope.formData = { userName: "", password: "" };

    //$scope.login = function () {
    //    authService.login($scope.formData).then(function () {
    //        $location.path("/account");
    //    }, function (response) {
    //        statusService.error(errorService.parseAuthResponse(response));
    //    });
    //};

    //$scope.forgotPasswordModal =
    //{
    //    title: "Password recovery",
    //    editable: true,
    //    input: "",
    //    content: msgConst.LOGIN_PWD_RECOVERY_INSTRUCTIONS,
    //    yes: function () {
    //        var modal = this;
    //        authService.account.resetPassword({ email: modal.input }, function () {
    //            modal.$hide();
    //            statusService.success(system.string.format(msgConst.LOGIN_PWD_RECOVERY_LINK_SENT_FORMAT, modal.input));
    //        }, function (response) {
    //            modal.$hide();
    //            statusService.error(errorService.parseDataResponse(response));
    //        });

    //    }
    //};

    //$scope.authExternalProvider = function (provider) {
    //    var redirectUri = location.protocol + "//" + location.host + "/authcomplete.html";
    //    var externalProviderUrl = appConst.serviceBase + "api/account/externalLogin?provider=" + provider + "&response_type=token&client_id=" + "Keepfit" + "&redirect_uri=" + redirectUri;
    //    window.$windowScope = $scope;
    //    window.open(externalProviderUrl, "Authenticate Account", "location=0,status=0,width=600,height=750");
    //};

    //$scope.authCompletedCB = function (fragment) {
    //    $scope.$apply(function () {
    //        if (fragment.haslocalaccount === "False") {
    //            authService.logout();

    //            authService.externalAuthData = {
    //                provider: fragment.provider,
    //                userName: fragment.external_user_name,
    //                email: fragment.email,
    //                externalAccessToken: fragment.external_access_token
    //            };

    //            $location.path("/associate");
    //        }
    //        else {
    //            authService.obtainAccessToken({ provider: fragment.provider, externalAccessToken: fragment.external_access_token }).then(function () {
    //                $location.path("/workouts");
    //            }, function (response) {
    //                statusService.error(errorService.parseDataResponse(response));
    //            });
    //        }
    //    });
    //}
});