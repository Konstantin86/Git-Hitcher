/// <reference path="~/app/utils/system/system-ns.js"/>

"use strict";

system.time = (function () {

    var timeSpan = function (startDate, endDate) {
        if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
            throw "Invalid input params";
        }

        this.timeDiff = startDate.getTime() - endDate.getTime();
    };

    timeSpan.prototype.getSeconds = function () {
        return this.timeDiff / 1000;
    };

    timeSpan.prototype.getMinutes = function () {
        return this.timeDiff / (1000 * 60);
    };

    timeSpan.prototype.getHours = function () {
        return this.timeDiff / (1000 * 60 * 60);
    };

    function convertUtcDateToLocalDate(date) {
        var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);

        var offset = date.getTimezoneOffset() / 60;
        var hours = date.getHours();

        newDate.setHours(hours - offset);

        return newDate;
    }

    function convertToUTCDate(date) {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    }

    return {
        timeSpan: timeSpan,
        convertUTCDateToLocalDate: convertUtcDateToLocalDate,
        convertToUTCDate: convertToUTCDate
    };
}());