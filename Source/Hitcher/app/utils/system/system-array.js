Array.prototype.getIndexByPropertyValue = function (attr, value) {
    for (var i = 0; i < this.length; i += 1) {
        if (this[i][attr] === value) {
            return i;
        }
    }
}