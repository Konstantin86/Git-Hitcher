/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/scripts/angular-resource.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/const/appConst.js"/>

"use strict";

app.service("searchService", function ($resource, appConst) {

    var config = {
        visible: false
    };

    var show = function() {
        config.visible = true;
    };

    this.config = config;
    this.show = show;
});