"use strict";

var Utils = {
	interpolateColor: function interpolateColor(minColor, maxColor, maxDepth, depth) {
		function d2h(d) {return d.toString(16);}
		function h2d(h) {return parseInt(h,16);}

		if (depth == 0)
			return minColor;
		if (depth == maxDepth)
			return maxColor;

		var color = "#";
		for (var i = 1; i <= 6; i += 2) {
			var minVal = new Number(h2d(minColor.substr(i,2)));
			var maxVal = new Number(h2d(maxColor.substr(i,2)));
			var nVal = minVal + (maxVal - minVal) * (depth / maxDepth);
			var val = d2h(Math.floor(nVal));
			while(val.length < 2){
				val = "0"+val;
			}
			color += val;
		};
		return color;
	}
};

module.exports = Utils;
