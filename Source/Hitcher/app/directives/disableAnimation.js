/// <reference path="~/scripts/angular.min.js"/>

/// <reference path="~/app/app.js"/>

"use strict";

app.directive("disableAnimation", function ($animate) {
    return {
        restrict: "A",
        link: function ($scope, $element, $attrs) {
            $attrs.$observe("disableAnimation", function (value) {
                $animate.enabled(!value, $element);
            });
        }
    }
});