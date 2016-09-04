String.prototype.parameterize = function () {
    return this.replace(/^\s+|\s+$/g, "-").toLowerCase();
};

String.prototype.toMonth = function() {
    if (this.match(/^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/)) {
        return this.substring(0, 5);
    } else {
        return this;
    }
};

var snack4meLib = function() {};

snack4meLib.toQueryString = function (_object) {
 var params =  Object.keys(_object).map(function(k) { 
   return encodeURIComponent(k) + '=' + encodeURIComponent(_object[k]);
 }).join('&');
 return params;
};

snack4meLib.cloneObject = function(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
};

snack4meLib.string2Date = function(str) {
	return new Date(str);
}

Date.prototype.getBeautifulHour = function() { 
	var hour = this.getHours(),
	    minutes = this.getMinutes();

	hour = (hour < 10) ? '0' + hour : hour;
	minutes = (minutes < 10) ? '0' + minutes : minutes

	return hour + ':' + minutes;
}

function dateObj(d) {
    var parts = d.split(/:|\s/),
        date  = new Date();
    if (parts.pop().toLowerCase() == 'pm') parts[0] = (+parts[0]) + 12;
    date.setHours(+parts.shift());
    date.setMinutes(+parts.shift());
    return date;
}