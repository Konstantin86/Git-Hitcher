/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/const/msgConst.js"/>

app.service("errorService", ["msgConst", function (msgConst) {
    var parseAuthResponse = function (response, defaultErrorMessage) {
        return response && response.data && response.data.error_description ? response.data.error_description : response.statusText || defaultErrorMessage || msgConst.LOGIN_UNRECOGNIZED_ERROR;
    };

    var parseDataResponse = function (response, defaultErrorMessage) {
        return response && response.data && response.data.message ? response.data.message : response.statusText || defaultErrorMessage || msgConst.UNEXPECTED_SERVER_ERROR;
    };

    var parseFormResponse = function (response) {
        if (response.data && response.data.modelState) {
            var errors = [];
            for (var key in response.data.modelState) {
                if (response.data.modelState.hasOwnProperty(key)) {
                    for (var i = 0; i < response.data.modelState[key].length; i++) {
                        errors.push(response.data.modelState[key][i]);
                    }
                }
            }

            return errors.join("; ");
        }

        return parseDataResponse(response);
    };

    this.parseAuthResponse = parseAuthResponse;
    this.parseDataResponse = parseDataResponse;
    this.parseFormResponse = parseFormResponse;
}]);