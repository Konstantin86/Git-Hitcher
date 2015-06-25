/// <reference path="~/app/utils/system/system-ns.js"/>

system.format = (function () {
    var setPrecision = function (obj, precisionValue) {

        for (var property in obj) {
            if (obj.hasOwnProperty(property) && obj[property]) {
                if (!isNaN(obj[property])) {
                    obj[property] = parseFloat(obj[property].toFixed(precisionValue));
                }
                else if (obj[property] instanceof Object) {
                    setPrecision(obj[property], precisionValue);
                }
            }
        }
    };

    return {
        setPrecision: setPrecision
    }
}());