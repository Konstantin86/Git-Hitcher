/// <reference path="~/app/utils/system/system-ns.js"/>

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

    return {
        timeSpan: timeSpan
    };
}());