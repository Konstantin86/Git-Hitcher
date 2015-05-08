/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/const/appConst.js"/>
/// <reference path="~/app/const/msgConst.js"/>
/// <reference path="~/app/services/authService.js"/>
/// <reference path="~/app/services/statusService.js"/>

"use strict";

app.controller("accountController", function ($scope, $location, authService, errorService, appConst, msgConst, statusService) {
    statusService.clear();

    if (!authService.userData.isAuth) {
        $location.path("/login");
    }

    var maxdate = new Date();
    maxdate.setDate(maxdate.getDate() - 12 * 365);
    $scope.maxDate = maxdate;

    $scope.formData = authService.userData;
    resetSecurityFormData();
    $scope.photoWidth = appConst.userPhotoWidth;

    $scope.onFilesAdded = function () {
        if ((arguments[0][0].file.type.indexOf("image") === -1) || arguments[0][0].size > 20000000) {
            statusService.warning("You are allowed to upload only image files up to 20 Mb size");
            return false;
        } else {
            this.$flow.defaults.headers.Authorization = authService.getAuthHeader();
        }
    };
    $scope.onUploadProgress = function () { statusService.loading("Uploading photo..."); };

    $scope.onUploadSuccess = function (file, message) {
        statusService.success("User photo is updated successfully");
        authService.setPhoto(message.split('"').join(''));
    };

    $scope.deleteUserModal =
    {
        title: "Delete Confirmation",
        content: msgConst.ACCOUNT_DELETE,
        yes: function () {
            var modal = this;
            authService.auth.delete({}, function () {
                modal.$hide();
                $location.path("/home");
                authService.logout();
            }, function (response) {
                this.$hide();
                statusService.error(errorService.parseDataError(response));
            });
        }
    };

    $scope.update = function () {
        authService.auth.update($scope.formData, function () {
            statusService.success(msgConst.ACCOUNT_UPDATE_SUCCESS);
        }, function (response) {
            statusService.error(errorService.parseFormResponse(response));
        });
    };

    $scope.changePassword = function () {
        authService.auth.updatePassword($scope.securityFormData, function () {
            resetSecurityFormData();
            statusService.success(msgConst.ACCOUNT_PWD_CHANGE_SUCCESS);
        }, function (response) {
            resetSecurityFormData();
            statusService.error(errorService.parseFormResponse(response));
        });
    };

    function resetSecurityFormData() { $scope.securityFormData = { oldPassword: "", password: "", confirmPassword: "" }; };
});