/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/app/app.js"/>

"use strict";

app.service("statusService", function ($alert, cfpLoadingBar) {

    var alert;
    // statuses valid values: success, warning, danger, info
    var state = { message: "", status: "success" };

    var set = function (msg, stat) {
        cfpLoadingBar.complete();
        state.message = msg;
        state.status = stat;
    };

    var success = function (msg) {
        $alert({ content: msg, placement: 'top-right', type: 'success', duration: 3, show: true });
    };

    var warning = function (msg) {
        set(msg, "warning");
    };

    var error = function (msg) {
        $alert({ content: msg || "Unable to connect to service", placement: 'top-right', type: 'danger', duration: 3, show: true });
    };

    var loading = function (msg) {
        set(msg, "info");
        //alert = $alert({ title: 'Info!', content: msg, placement: 'top', type: 'info', show: true });
        cfpLoadingBar.start();
    };

    var clear = function () {
        cfpLoadingBar.complete();
        //alert.hide();
        state.message = "";
    };

    var info = function(msg) {
        $alert({ content: msg, placement: 'top-right', type: 'info', duration: 3, show: true });
    }

    this.info = info;
    this.set = set;
    this.state = state;
    this.success = success;
    this.loading = loading;
    this.warning = warning;
    this.error = error;
    this.clear = clear;
});