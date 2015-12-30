"use strict";

var Cursor;

module.exports = Cursor = (function() {
	function Cursor(args) {
		this.canvas = args.canvas || {};
		this.color = args.color || "#fff";
		this.strokeColor = args.strokeColor || "#000";
		this.strokeWidth = args.strokeWidth || 0;
		this.size = args.size || 5;
		this.radius = args.radius || 50;
		this.speed = args.speed || 4;
		this.dir = 0;
		this.angle = 30;

		this.draw = function() {
			var ctx = this.canvas.getContext('2d'),
			c_x = (this.canvas.width / 2) + (this.radius * Math.cos(this.angle * Math.PI / 180)),
			c_y = (this.canvas.height / 2) + (this.radius * Math.sin(this.angle * Math.PI / 180));

			this.angle = this.angle + (this.dir * this.speed);
			if (this.angle < 0)
				this.angle = 360 - this.angle;
			else if (this.angle > 360)
				this.angle %= 360;
			ctx.translate(c_x, c_y);
			ctx.rotate(this.angle * Math.PI / 180);
			ctx.translate(- c_x, - c_y);

			ctx.beginPath();
			ctx.moveTo(c_x - this.size, c_y - this.size);
			ctx.lineTo(c_x + this.size, c_y);
			ctx.lineTo(c_x - this.size, c_y + this.size);
			ctx.closePath();

			ctx.fillStyle = this.color;
			ctx.strokeStyle = this.strokeColor;
			ctx.lineWidth = this.strokeWidth;
			ctx.stroke();
			ctx.fill();

			ctx.translate(c_x, c_y);
			ctx.rotate(- this.angle * Math.PI / 180);
			ctx.translate(- c_x, - c_y);
		};

		this.getCoord = function() {
			var ctx = this.canvas.getContext('2d'),
			c_x = (this.canvas.width / 2) + (this.radius * Math.cos(this.angle * Math.PI / 180)),
			c_y = (this.canvas.height / 2) + (this.radius * Math.sin(this.angle * Math.PI / 180));

			return {
				a: this.angle,
				d: this.radius + (this.size * 2),
			};
		};
	};
	return Cursor;
}());
