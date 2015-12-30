!function(){"use strict";var t="undefined"==typeof window?global:window;if("function"!=typeof t.require){var e={},s={},i={},n={}.hasOwnProperty,r="components/",a=function(t,e){var s=0;e&&(0===e.indexOf(r)&&(s=r.length),e.indexOf("/",s)>0&&(e=e.substring(s,e.indexOf("/",s))));var n=i[t+"/index.js"]||i[e+"/deps/"+t+"/index.js"];return n?r+n.substring(0,n.length-".js".length):t},h=/^\.\.?(\/|$)/,l=function(t,e){for(var s,i=[],n=(h.test(e)?t+"/"+e:e).split("/"),r=0,a=n.length;a>r;r++)s=n[r],".."===s?i.pop():"."!==s&&""!==s&&i.push(s);return i.join("/")},o=function(t){return t.split("/").slice(0,-1).join("/")},c=function(e){return function(s){var i=l(o(e),s);return t.require(i,e)}},d=function(t,e){var i={id:t,exports:{}};return s[t]=i,e(i.exports,c(t),i),i.exports},u=function(t,i){var r=l(t,".");if(null==i&&(i="/"),r=a(t,i),n.call(s,r))return s[r].exports;if(n.call(e,r))return d(r,e[r]);var h=l(r,"./index");if(n.call(s,h))return s[h].exports;if(n.call(e,h))return d(h,e[h]);throw new Error('Cannot find module "'+t+'" from "'+i+'"')};u.alias=function(t,e){i[e]=t},u.register=u.define=function(t,s){if("object"==typeof t)for(var i in t)n.call(t,i)&&(e[i]=t[i]);else e[t]=s},u.list=function(){var t=[];for(var s in e)n.call(e,s)&&t.push(s);return t},u.brunch=!0,u._cache=s,t.require=u}}(),require.register("Hexagon",function(t,e,s){"use strict";var i,n=e("src/Utils"),r=e("src/RegularPolygon"),a=e("src/Rays"),h=e("src/Wall"),l=e("src/Cursor"),o=e("src/Timer");s.exports=i=function(){function t(t){if("undefined"==typeof t)throw new Error("No args provided");if("undefined"==typeof t.canvas)throw new Error("No canvas provided");this.args=t,this.canvas=t.canvas,this.ctx=this.canvas.getContext("2d"),this.angleSpeed="number"==typeof t.angleSpeed?t.angleSpeed:2,this.walls=[null,null,null,null],this.wallColors=t.wallColors||["#1EAAA5","#4EFC96"],this.currentWallColor=this.wallColors[0],this.backgroundColors=t.backgroundColors||["#0A2727","#103D3D"],this.rays=new a({amount:6}),this.hexagon=new r({canvas:this.canvas,sides:6,size:1e3}),this.cursor=new l({canvas:this.canvas,size:7,color:this.wallColors[0],strokeColor:"rgba(0,0,0,0)",strokeWidth:1,radius:75,speed:t.cursorSpeed||5}),this.wallSpeed=t.wallSpeed||2,this.minDist=Math.sqrt(Math.pow(this.canvas.width,2)+Math.pow(this.canvas.height,2))/2,this.timer=(new o).init(this.wallColors,"timing.JSON");for(var e,s=0,i=!1,c=0,d=1,u=0;u<this.walls.length;u++)this.walls[u]=new h({distance:this.minDist+this.minDist/3*(u+1)}),this.walls[u].generatePattern(6);this.init=function(){return this.angleSpeed="number"==typeof t.angleSpeed?t.angleSpeed:2,Math.floor(Date.now())%2==0&&(this.angleSpeed*=-1),this.wallSpeed=t.wallSpeed||2,this.cursor.size=7,this.timer.currentLevel=0,this.timer.levelText.innerHTML="POINT",s=0,this},this.play=function(){var t=this;i=!1,document.onkeydown=function(e){var s=e.which||e.keyCode;27==s&&(i=!0),t.moveCursor(e)},document.onkeyup=function(e){t.stopCursor(e)},e=requestAnimationFrame(v.bind(this))},this.moveCursor=function(t){var e=t.which||t.keyCode;39==e?this.cursor.dir=1:37==e&&(this.cursor.dir=-1)},this.stopCursor=function(t){var e=t.which||t.keyCode;(39==e&&1==this.cursor.dir||37==e&&-1==this.cursor.dir)&&(this.cursor.dir=0)},this.die=function(){this.hexagon.draw(this.canvas,this.backgroundColors[c],this.currentWallColor,7),this.cursor.draw(),this.cursor.dir=0,document.onkeydown=null,document.onkeyup=null,s=0,e=requestAnimationFrame(g.bind(this))};var v=function(){var t=60>=s%120?s%120:60-(s%120-60);this.currentWallColor=n.interpolateColor(this.wallColors[0],this.wallColors[1],60,t),s%300==0&&Math.floor(100*Math.random())<5&&(this.angleSpeed*=-1),this.ctx.fillStyle=this.backgroundColors[c],this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height),this.ctx.translate(this.canvas.width/2,this.canvas.height/2),this.ctx.rotate(this.angleSpeed*Math.PI/180),this.ctx.translate(-this.canvas.width/2,-this.canvas.height/2),this.rays.draw(this.canvas,[this.backgroundColors[c],this.backgroundColors[d]]);for(var r=0;r<this.walls.length;r++)this.walls[r].draw(this.canvas,this.currentWallColor),this.walls[r].distance-=this.wallSpeed,this.walls[r].distance<=0&&(this.walls[r].distance=this.minDist+this.minDist/3,this.walls[r].generatePattern(6)),this.walls[r].checkCollision(this.cursor.getCoord(),this.canvas)&&(i=!0);return this.cursor.color=this.currentWallColor,this.cursor.draw(),this.cursor.radius>75&&(this.cursor.radius-=25),this.cursor.size>7&&(this.cursor.size-=1),this.hexagon.draw(this.backgroundColors[c],this.currentWallColor,7),this.hexagon.size>50&&(this.hexagon.size-=25),this.timer.update(s),i?this.die():(s++,void(e=requestAnimationFrame(v.bind(this))))},g=function(){if(this.angleSpeed>.4?(this.angleSpeed-=.01,this.angleSpeed<.4&&(this.angleSpeed=.4)):this.angleSpeed<-.4&&(this.angleSpeed+=.01,this.angleSpeed>-.4&&(this.angleSpeed=-.4)),this.wallSpeed>0&&(this.wallSpeed=0),30==s&&(this.wallSpeed=-50),s>=48&&this.hexagon.size<250&&(this.hexagon.size+=50,this.cursor.radius+=50,this.cursor.size+=1),this.hexagon.size>=250){var t=this;cancelAnimationFrame(e),window.onkeydown=function(s){var i=s.which||s.keyCode;if(32==i||38==i){for(var n=0;n<t.walls.length;n++)t.walls[n]=new h({distance:t.minDist+t.minDist/3*(n+1)}),t.walls[n].generatePattern(6);return window.onkeydown=null,cancelAnimationFrame(e),void t.init().play()}}}this.ctx.fillStyle=this.backgroundColors[c],this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height),this.ctx.translate(this.canvas.width/2,this.canvas.height/2),this.ctx.rotate(this.angleSpeed*Math.PI/180),this.ctx.translate(-this.canvas.width/2,-this.canvas.height/2),this.rays.draw(this.canvas,[this.backgroundColors[c],this.backgroundColors[d]]);for(var i=0;i<this.walls.length;i++)this.walls[i].draw(this.canvas,this.currentWallColor),this.walls[i].distance-=this.wallSpeed,this.walls[i].distance<=0&&(this.walls[i].distance=this.minDist+this.minDist/3,this.walls[i].generatePattern(6));this.cursor.color=3>s%6?this.wallColors[0]:this.wallColors[1],this.cursor.draw(),this.hexagon.draw(this.backgroundColors[c],this.currentWallColor,7),s++,e=requestAnimationFrame(g.bind(this))};return this}return t}()}),require.register("src/Cursor",function(t,e,s){"use strict";var i;s.exports=i=function(){function t(t){this.canvas=t.canvas||{},this.color=t.color||"#fff",this.strokeColor=t.strokeColor||"#000",this.strokeWidth=t.strokeWidth||0,this.size=t.size||5,this.radius=t.radius||50,this.speed=t.speed||4,this.dir=0,this.angle=30,this.draw=function(){var t=this.canvas.getContext("2d"),e=this.canvas.width/2+this.radius*Math.cos(this.angle*Math.PI/180),s=this.canvas.height/2+this.radius*Math.sin(this.angle*Math.PI/180);this.angle=this.angle+this.dir*this.speed,this.angle<0?this.angle=360-this.angle:this.angle>360&&(this.angle%=360),t.translate(e,s),t.rotate(this.angle*Math.PI/180),t.translate(-e,-s),t.beginPath(),t.moveTo(e-this.size,s-this.size),t.lineTo(e+this.size,s),t.lineTo(e-this.size,s+this.size),t.closePath(),t.fillStyle=this.color,t.strokeStyle=this.strokeColor,t.lineWidth=this.strokeWidth,t.stroke(),t.fill(),t.translate(e,s),t.rotate(-this.angle*Math.PI/180),t.translate(-e,-s)},this.getCoord=function(){this.canvas.getContext("2d"),this.canvas.width/2+this.radius*Math.cos(this.angle*Math.PI/180),this.canvas.height/2+this.radius*Math.sin(this.angle*Math.PI/180);return{a:this.angle,d:this.radius+2*this.size}}}return t}()}),require.register("src/Rays",function(t,e,s){"use strict";var i;s.exports=i=function(){function t(t){this.amount="undefined"!=typeof t.amount?t.amount:3,this.draw=function(t,e){for(var s=t.getContext("2d"),i=t.width/2,n=t.height/2,r=t.width>t.height?t.width:t.height,a=1;a<=this.amount;a++)s.beginPath(),s.moveTo(i,n),s.lineTo(i+r*Math.cos(2*a*Math.PI/this.amount),n+r*Math.sin(2*a*Math.PI/this.amount)),s.lineTo(i+r*Math.cos((a+1)%this.amount*2*Math.PI/this.amount),n+r*Math.sin((a+1)%this.amount*2*Math.PI/this.amount)),s.fillStyle=e[a%2],s.fill()}}return t}()}),require.register("src/RegularPolygon",function(t,e,s){"use strict";var i;s.exports=i=function(){function t(t){if("undefined"==typeof t)throw new Error("RegularPolygon: No args provided");if("undefined"==typeof t.canvas)throw new Error("RegularPolygon: No target canvas provided");if("undefined"!=typeof t.sides&&t.sides<3)throw new Error("RegularPolygon: Sides cannot be less than 3");this.sides=t.sides||3,this.size=t.size||10,this.canvas=t.canvas||{},this.draw=function(t,e,s){var i=this.canvas.getContext("2d"),n=this.canvas.width/2||0,r=this.canvas.height/2||0;i.beginPath(),i.moveTo(n+this.size*Math.cos(0),r+this.size*Math.sin(0));for(var a=1;a<=this.sides;a++)i.lineTo(n+this.size*Math.cos(2*a*Math.PI/this.sides),r+this.size*Math.sin(2*a*Math.PI/this.sides));i.fillStyle=t,i.strokeStyle=e,i.lineCap="round",i.lineWidth=s,i.fill(),i.stroke()}}return t}()}),require.register("src/Timer",function(t,e,s){"use strict";var i,n=e("src/Utils");s.exports=i=function(){function t(t){this.currentLevel=0,this.levelTimings=[10,20,30,45,60],this.levelTexts=["POINT","LINE","TRIANGLE","SQUARE","PENTAGON","HEXAGON"],this.element,this.timeText,this.label,this.level,this.levelText,this.levelProgressContainer,this.levelProgress,this.load=function(t){n.getJSON(t,function(e){return"undefined"==typeof e?void console.error("HexagonJS @ "+t+": Can't get data."):"undefined"==typeof e.levels?void console.error("HexagonJS @ "+t+': "levels" object not found.'):"undefined"==typeof e.levels.timings||"undefined"==typeof e.levels.texts?void console.error("HexagonJS @ "+t+': Missing "timings" or "texts" arrays.'):e.levels.timings.length!=e.levels.texts.length-1?void console.error("HexagonJS @ "+t+": Level timings represent the end of each level. There should be one less timings than level names since the last level lasts forever."):(this.levelTimings=e.levels.timings,this.levelTexts=e.levels.texts,void(this.levelText.innerHTML=this.levelTexts[0]))}.bind(this))},this.init=function(t,e){return"string"==typeof e&&this.load(e),this.element=document.createElement("div"),this.element.classList.add("hjs"),this.element.classList.add("timer"),document.getElementsByTagName("body")[0].appendChild(this.element),this.timeText=document.createElement("span"),this.element.appendChild(this.timeText),this.label=document.createElement("div"),this.label.classList.add("hjs"),this.label.classList.add("label"),this.label.innerHTML="TIME",this.element.appendChild(this.label),this.level=document.createElement("div"),this.level.classList.add("hjs"),this.level.classList.add("level"),document.getElementsByTagName("body")[0].appendChild(this.level),this.levelText=document.createElement("span"),this.levelText.innerHTML=this.levelTexts[0],this.level.appendChild(this.levelText),this.levelProgressContainer=document.createElement("div"),this.level.appendChild(this.levelProgressContainer),this.levelProgress=document.createElement("div"),this.levelProgress.style.backgroundColor=t[1],this.levelProgressContainer.appendChild(this.levelProgress),this},this.update=function(t){var e=Math.floor(t/60),s=Math.floor(t-60*e);s=("0"+s).slice(-2),this.timeText.innerHTML=e+":"+s;var i=t/(60*this.levelTimings[this.currentLevel])*100;this.currentLevel>0&&(i=(t-60*this.levelTimings[this.currentLevel-1])/(60*this.levelTimings[this.currentLevel]-60*this.levelTimings[this.currentLevel-1])*100),i%=100,this.levelProgress.style.width=i+"%";for(var n=0;n<this.levelTimings.length;n++)e==this.levelTimings[n]&&this.currentLevel==n&&(this.currentLevel++,this.levelText.innerHTML=this.levelTexts[this.currentLevel])}}return t}()}),require.register("src/Utils",function(t,e,s){"use strict";var i={interpolateColor:function(t,e,s,i){function n(t){return t.toString(16)}function r(t){return parseInt(t,16)}if(0==i)return t;if(i==s)return e;for(var a="#",h=1;6>=h;h+=2){for(var l=new Number(r(t.substr(h,2))),o=new Number(r(e.substr(h,2))),c=l+(o-l)*(i/s),d=n(Math.floor(c));d.length<2;)d="0"+d;a+=d}return a},getJSON:function(t,e){var s="undefined"!=typeof XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP");s.open("get",t,!0),s.onreadystatechange=function(){var t,i;4==s.readyState&&(t=s.status,200==t?(i=JSON.parse(s.responseText),e&&e(i)):console.error("Error: "+t))},s.send()}};s.exports=i}),require.register("src/Wall",function(t,e,s){"use strict";var i;s.exports=i=function(){function t(t){this.walls=[!1,!1,!1,!1,!1,!1],this.distance=t.distance||250,this.width=t.width||50;var e=function(t){for(var e=0;e<t.length;e++)if(0==t[e])return!0;return!1};this.generatePattern=function(t){for(var s=0;t>s;s++)this.walls[s]=Boolean(Math.round(Math.random()));e(this.walls)||this.generatePattern(t)},this.draw=function(t,e){for(var s=t.getContext("2d"),i=t.width/2,n=t.height/2,r=0;r<this.walls.length;r++)this.walls[r]&&(s.beginPath(),s.moveTo(i+this.distance*Math.cos(2*r*Math.PI/6),n+this.distance*Math.sin(2*r*Math.PI/6)),s.lineTo(i+this.distance*Math.cos(2*(r+1)*Math.PI/6),n+this.distance*Math.sin(2*(r+1)*Math.PI/6)),s.lineTo(i+(this.distance-this.width)*Math.cos(2*(r+1)*Math.PI/6),n+(this.distance-this.width)*Math.sin(2*(r+1)*Math.PI/6)),s.lineTo(i+(this.distance-this.width)*Math.cos(2*r*Math.PI/6),n+(this.distance-this.width)*Math.sin(2*r*Math.PI/6)),s.closePath(),s.fillStyle=e,s.strokeStyle=e,s.lineWidth=1,s.fill(),s.stroke())},this.checkCollision=function(t,e){for(var s=0;s<this.walls.length;s++){var i=60*s,n=60*(s+1);if(this.walls[s]&&i<=t.a&&n>=t.a&&this.distance-this.width<=t.d&&this.distance>=t.d)return!0}return!1}}return t}()});