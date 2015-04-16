/// <reference path="~/app/utils/system/system-ns.js"/>

system.json = (function () {
    var getKeys = function (obj) {
        var keys = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys;
    };

    var getValues = function (obj) {
        var values = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                values.push(obj[key]);
            }
        }
        return values;
    };

    return {
        getKeys: getKeys,
        getValues: getValues
    }
}());