//
//  hexagon.js for HexagonJS in /home/Schlipak/web/hexagonjs/dist/
//
//  Made by Guillaume De Matos
//  Login   <Schlipak@Aether>
//
//  Created on 2015-12-24 18:18:08
//
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or (at
// your option) any later version.
//
// This program is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with GNU Emacs.  If not, see <http://www.gnu.org/licenses/>.
//
//

(function() {
	var Utils = function() {
		this.interpolateColor = function(minColor, maxColor, maxDepth, depth){
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
		};
	};

	var RegularPolygon = function(args) {
		this.sides = args.sides || 3,
		this.size = args.size || 10,
		this.canvas = args.canvas || {};
		cx = this.canvas.width / 2 || 0,
		cy = this.canvas.height / 2 || 0;

		this.draw = function(canvas, fillColor, strokeColor, strokeWidth) {
			var ctx = canvas.getContext('2d');
			cx = this.canvas.width / 2 || 0,
			cy = this.canvas.height / 2 || 0;

			ctx.beginPath();
			ctx.moveTo(cx + this.size * Math.cos(0), cy + this.size *  Math.sin(0));
			for (var i = 1; i <= this.sides; i++) {
				ctx.lineTo(cx + this.size * Math.cos(i * 2 * Math.PI / this.sides), cy + this.size * Math.sin(i * 2 * Math.PI / this.sides));
			}

			ctx.fillStyle = fillColor;
			ctx.strokeStyle = strokeColor;
			ctx.lineCap = "round";
			ctx.lineWidth = strokeWidth;
			ctx.fill();
			ctx.stroke();
		};
	};

	var Rays = function(args) {
		this.amount = args.amount || 3;

		this.draw = function(canvas, colors) {
			var ctx = canvas.getContext('2d');
			var cx = canvas.width / 2,
			cy = canvas.height / 2,
			sz = canvas.width > canvas.height ? canvas.width : canvas.height;

			for (var i = 1; i <= this.amount; i++) {
				ctx.beginPath();
				ctx.moveTo(cx, cy);
				ctx.lineTo(cx + sz * Math.cos(i * 2 * Math.PI / this.amount), cy + sz * Math.sin(i * 2 * Math.PI / this.amount));
				ctx.lineTo(cx + sz * Math.cos((i+1)%this.amount * 2 * Math.PI / this.amount), cy + sz * Math.sin((i+1)%this.amount * 2 * Math.PI / this.amount));
				ctx.fillStyle = colors[i % 2];
				ctx.fill();
			}
		};
	};

	var Wall = function(args) {
		this.walls = [false, false, false, false, false, false];
		this.distance = args.distance || 250;
		this.width = args.width || 50;

		var _checkValid = function(walls) {
			for (var i = 0; i < walls.length; i++) {
				if (walls[i] == false)
					return true;
			}
			return false;
		};

		this.generatePattern = function(amount) {
			for (var i = 0; i < amount; i++)
				this.walls[i] = Boolean(Math.round(Math.random()));
			if (!_checkValid(this.walls))
				this.generatePattern(amount);
		};

		this.draw = function(canvas, color) {
			var ctx = canvas.getContext('2d');
			var cx = canvas.width / 2,
				cy = canvas.height / 2;

			for (var i = 0; i < this.walls.length; i++) {
				if (!this.walls[i])
					continue;

				ctx.beginPath();
				ctx.moveTo(cx + this.distance * Math.cos(i * 2 * Math.PI / 6), cy + this.distance * Math.sin(i * 2 * Math.PI / 6));
				ctx.lineTo(cx + this.distance * Math.cos((i + 1) * 2 * Math.PI / 6), cy + this.distance * Math.sin((i + 1) * 2 * Math.PI / 6));
				ctx.lineTo(cx + (this.distance - this.width) * Math.cos((i + 1) * 2 * Math.PI / 6), cy + (this.distance - this.width) * Math.sin((i + 1) * 2 * Math.PI / 6));
				ctx.lineTo(cx + (this.distance - this.width) * Math.cos(i * 2 * Math.PI / 6), cy + (this.distance - this.width) * Math.sin(i * 2 * Math.PI / 6));
				ctx.closePath();

				ctx.fillStyle = color;
				ctx.strokeStyle = color;
				ctx.lineWidth = 1;
				ctx.fill();
				ctx.stroke();
			}
		};

		this.checkCollision = function(coord, canvas) {
			for (var i = 0; i < this.walls.length; i++) {
				var a_1 = i * (360 / 6),
					a_2 = (i + 1) * (360 / 6);
				if (!this.walls[i])
					continue;
				if (a_1 <= coord.a && a_2 >= coord.a) {
					if ((this.distance - this.width) <= coord.d &&
						this.distance >= coord.d)
						return true;
				}
			};

			return false;
		};
	};

	var Cursor = function(args) {
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

	var Timer = function(args) {
		this.element;
		this.label;
		this.text;
		this.start = Date.now();

		this.init = function() {
			this.element = document.createElement('div');
			this.element.classList.add('hjs');
			this.element.classList.add('timer');
			document.getElementsByTagName('body')[0].appendChild(this.element);

			this.text = document.createElement('span');
			this.element.appendChild(this.text);

			this.label = document.createElement('div');
			this.label.classList.add('hjs');
			this.label.classList.add('label');
			this.label.innerHTML = "TIME";
			this.element.appendChild(this.label);
			return this;
		};

		this.update = function(canvas) {
			var curTime = Date.now() - this.start,
				seconds = Math.floor(curTime / 1000),
				dec = Math.floor((curTime - (seconds * 1000)) / 10);
			dec = ('0' + dec).slice(-2);
			this.text.innerHTML = seconds + ':' + dec;
		};

		return this;
	};

	Hexagon = function(args) {
		if (typeof args === 'undefined')
			throw new Error("No args provided");
		if (typeof args.canvas === 'undefined')
			throw new Error("No canvas provided");

		this.canvas = args.canvas;
		this.ctx = this.canvas.getContext('2d');
		this.angleSpeed = args.angleSpeed || 2;
		this.rays = new Rays({
			amount: 6
		});
		this.hexagon = new RegularPolygon({
			canvas: this.canvas,
			sides: 6,
			size: 1000
		});
		this.cursor = new Cursor({
			canvas: this.canvas,
			size: 7,
			color: "#6EA796",
			strokeColor: "rgba(0,0,0,0)",
			strokeWidth: 1,
			radius: 75,
			speed: 5
		});
		this.wallSpeed = args.wallSpeed || 2;
		this.minDist = Math.sqrt(
			Math.pow(this.canvas.width, 2) +
			Math.pow(this.canvas.height, 2)
		) / 2;
		this.walls = [null, null, null, null];
		this.timer = new Timer().init(this.canvas);
		this.wallColors = args.wallColors || ["#1EAAA5", "#4EFC96"];
		this.currentWallColor = this.wallColors[0];
		this.backgroundColors = args.backgroundColors || ["#0A2727", "#103D3D"];

		var _utils = new Utils();
		var _animation_id_;
		var _frameCount = 0;
		var COLOR_DARK = 0, COLOR_LIGHT = 1;

		for (var i = 0; i < this.walls.length; i++) {
			this.walls[i] = new Wall({
				distance: this.minDist + ((this.minDist / 3) * (i + 1))
			});
			this.walls[i].generatePattern(6);
		};

		this.play = function() {
			var _this = this;
			document.onkeydown = function(event) {
				_this.moveCursor(event);
			};
			document.onkeyup = function(event) {
				_this.stopCursor(event);
			}
			_animation_id_ = requestAnimationFrame(_update.bind(this))
		};

		this.moveCursor = function(event) {
			var key = event.which || event.keyCode;
			if (key == 39)
				this.cursor.dir = 1;
			else if (key == 37)
				this.cursor.dir = -1;
		}

		this.stopCursor = function(event) {
			var key = event.which || event.keyCode;
			if ((key == 39 && this.cursor.dir == 1) || (key == 37 && this.cursor.dir == -1))
				this.cursor.dir = 0;
		}

		var _update = function() {
			var _isDead = false,
				_fc_acc = (_frameCount % 120) <= 60 ? (_frameCount % 120) : 60 - ((_frameCount % 120) - 60);
			this.currentWallColor = _utils.interpolateColor(
				this.wallColors[0],
				this.wallColors[1],
				60,
				_fc_acc
			);

			this.ctx.fillStyle = this.backgroundColors[COLOR_DARK];
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
			this.ctx.rotate(this.angleSpeed * Math.PI / 180);
			this.ctx.translate(- this.canvas.width / 2, - this.canvas.height / 2);
			this.rays.draw(this.canvas, [this.backgroundColors[COLOR_DARK], this.backgroundColors[COLOR_LIGHT]]);
			for (var i = 0; i < this.walls.length; i++) {
				this.walls[i].draw(this.canvas, this.currentWallColor);
				this.walls[i].distance -= this.wallSpeed;
				if (this.walls[i].distance <= 0) {
					this.walls[i].distance = this.minDist + (this.minDist / 3);
					this.walls[i].generatePattern(6);
				}
				if (this.walls[i].checkCollision(this.cursor.getCoord(), this.canvas))
					_isDead = true;
			}
			this.cursor.color = this.currentWallColor;
			this.cursor.draw();
			this.hexagon.draw(this.canvas, this.backgroundColors[COLOR_DARK], this.currentWallColor, 7);
			if (this.hexagon.size > 50)
				this.hexagon.size -= 50;
			this.timer.update();

			if (_isDead) {
				var _this = this;
				this.hexagon.draw(this.canvas, this.backgroundColors[COLOR_DARK], this.currentWallColor, 7);
				this.cursor.draw();
				this.cursor.dir = 0;
				document.onkeydown = null;
				document.onkeyup = null;
				_animation_id_ = requestAnimationFrame(_dead.bind(this));
				_frameCount = 0;
				return false;
			}

			_frameCount++;
			_animation_id_ = requestAnimationFrame(_update.bind(this));
		};

		var _dead = function() {
			if (this.angleSpeed > 0)
				this.angleSpeed -= .01;
			if (this.angleSpeed < 0)
				this.angleSpeed = 0;
			if (this.wallSpeed > 0)
				this.wallSpeed = 0;

			if (_frameCount == (.3 * 60))
				this.wallSpeed = -50;
			if (_frameCount >= (.8 * 60) && this.hexagon.size < 1000)
				this.hexagon.size += 50;
			if (this.hexagon.size >= 1000) {
				var _this = this;
				cancelAnimationFrame(_animation_id_);
				window.onkeydown = function(event) {
					var key = event.which || event.keyCode;
					if (key == 32) {
						_this.wallSpeed = 5;
						_this.angleSpeed = 1.2;
						_this.timer.start = Date.now();
						for (var i = 0; i < _this.walls.length; i++) {
							_this.walls[i] = new Wall({
								distance: _this.minDist + ((_this.minDist / 3) * (i + 1))
							});
							_this.walls[i].generatePattern(6);
						};
						window.onkeydown = null;
						_this.play();
					};
				};
				return false;
			}

			this.ctx.fillStyle = this.backgroundColors[COLOR_DARK];
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
			this.ctx.rotate(this.angleSpeed * Math.PI / 180);
			this.ctx.translate(- this.canvas.width / 2, - this.canvas.height / 2);
			this.rays.draw(this.canvas, [this.backgroundColors[COLOR_DARK], this.backgroundColors[COLOR_LIGHT]]);
			for (var i = 0; i < this.walls.length; i++) {
				this.walls[i].draw(this.canvas, this.currentWallColor);
				this.walls[i].distance -= this.wallSpeed;
				if (this.walls[i].distance <= 0) {
					this.walls[i].distance = this.minDist + (this.minDist / 3);
					this.walls[i].generatePattern(6);
				}
			}
			this.cursor.draw();
			this.hexagon.draw(this.canvas, this.backgroundColors[COLOR_DARK], this.currentWallColor, 7);

			_frameCount++;
			_animation_id_ = requestAnimationFrame(_dead.bind(this));
		};

		return this;
	};
}());
