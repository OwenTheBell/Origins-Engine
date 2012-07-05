var canvas, context;
var fps = 60;
var g_elements = [];
var reciever = {};
var g_Mouse = {};
var g_Frames = 0;
var g_generate = 1;

$(document).ready(function(){
	canvas = $('#myCanvas').get(0);
	context = canvas.getContext('2d');
	
	g_elements.push(new Emitter(canvas.width / 2, canvas.height / 2, 5, g_generate));
	reciever = new Reciever(100, 100, 5);
	g_elements.push(reciever);
	// g_elements.push(new WaveForm(pulse));
	
	startDraw();		
})

function startDraw () {
	setInterval(loop, 1000/30);
}

function loop() {
	g_Mouse = inputState.getMouse();
	
	$(g_elements).each(function(){
		this.update();
	});
	
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	$(g_elements).each(function(){
		this.draw();
	});
	g_Frames++;
}

function getDistance(x1, y1, x2, y2){
	var x = Math.pow((x2 - x1), 2);
	var y = Math.pow((y2 - y1), 2);
	return Math.sqrt(x + y)
}

function getMax(array){
	var max = 0;
	$(array).each(function(){
		if (this > max){
			max = this;
		}
	});
	return max;
}

var Emitter = klass(function(x, y, radius, generate){
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.move = 1.5;
	this.circles = [];
	this.generate = fps / generate;
	this.waveForm = new WaveForm(this.generate, 'emitterCanvas');
})
	.methods({
		update: function() {
			if ((g_Frames >= this.generate) && (g_Frames % this.generate == 0)){
				g_elements.push(new Pulse(this.x, this.y, this.radius, 2));
				// console.log(g_Frames);
			}
			
			$(this.circles).each(function(){
				this.update();
			});
			this.waveForm.update();
			
			var x = 0, y = 0;
			
			if(g_Mouse.down){
				if((g_Mouse.Y >= 0) && (g_Mouse.Y < canvas.height) && (g_Mouse.X >= 0) && (g_Mouse.X < canvas.width)){
					var rads = Math.atan2(g_Mouse.Y - this.y, g_Mouse.X - this.x);
					var degrees = rads * 180 / Math.PI;
					x = 90 - Math.abs(degrees);
					x = x / 90;
					x = this.move * x;
					//calculate angle relative to y-axis
					rads = Math.atan2(g_Mouse.X - this.x, g_Mouse.Y - this.y);
					degrees = rads * 180 / Math.PI;
					y = 90 - Math.abs(degrees);
					y = y / 90;
					y = this.move * y;
				}
			}
			
			this.x += x;
			this.y += y;
			
			if (this.x + this.radius > canvas.width) this.x = canvas.width;
			else if (this.x - this.radius < 0) this.x = 0;
			if (this.y + this.radius > canvas.height) this.y = canvas.height;
			else if (this.y - this.radius < 0) this.y = 0;
		},
		draw: function() {
			context.beginPath();
			context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
			context.closePath();
			context.fill();
			
			$(this.circles).each(function(){
				this.draw();
			});
			this.waveForm.draw();
		},
		
	});

var Reciever = klass(function(x, y, radius){
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.lastCollide = {};
	this.waveForm = null;
})
	.methods({
		update: function() {
			//check for collision with the pulses
			for(var i = 0; i < g_elements.length; i++){
				var pulse = g_elements[i];
				if (pulse instanceof Pulse && pulse != this.lastCollide){
					var distance = getDistance(pulse.x, pulse.y, this.x, this.y);
					if ((pulse.radius > (distance - this.radius)) && (pulse.radius < (distance + this.radius))){
						this.lastCollide = pulse; //track the last collided pulse to avoid collide again
						//g_elements is organized such that i+1 will be a pulse
						var nextPulse = g_elements[i+1];
						distance = getDistance(nextPulse.x, nextPulse.y, this.x, this.y);
						remainingDis = distance - nextPulse.radius;
						remainingFrames = remainingDis / nextPulse.growth;
						if (!this.waveForm){
							this.waveForm = new WaveForm(remainingFrames, 'recieverCanvas');
						} else {
							this.waveForm.pulse = remainingFrames;
						}
						break;
					}
				}
			};
			if (this.waveForm){
				this.waveForm.update();
			}
		},
		draw: function() {
			context.beginPath();
			context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
			context.closePath();
			context.fill();
			if(this.waveForm){
				this.waveForm.draw();
			}
		},
		
	});

var Pulse = klass(function(x, y, radius, growth){
	this.x = x;
	this.y = y;
	this.growth = growth;
	this.collision = false;
	this.radius = radius;
	var distances = [];
	var canvasPos = $('#myCanvas').position();
	distances.push(getDistance(
		this.x,
		this.y,
		canvasPos.left,
		canvasPos.top
	));
	distances.push(getDistance(
		this.x,
		this.y, 
		canvasPos.left + canvas.width,
		canvasPos.top
	));
	
	distances.push(getDistance(
		this.x,
		this.y,
		canvasPos.left + canvas.width,
		canvasPos.top + canvas.height
	));
	distances.push(getDistance(
		this.x,
		this.y,
		canvasPos.left,
		canvasPos.top + canvas.height
	));
	//The maximum radius the circle can have before it no longer appears on screen
	this.maxRadius = getMax(distances);
	
})
	.methods({
		update: function(){
			if (this.radius < this.maxRadius){
				this.radius += this.growth;
			} else {
				var index = g_elements.indexOf(this);
				g_elements.splice(index, 1);
			}
		},
		draw: function() {
			if (this.radius < this.maxRadius){
				context.beginPath();
				context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
				context.closePath();
				context.stroke();
			}
		},
		
	});

var WaveForm = klass(function(generate, canvas){
	this.canvas = $('#' + canvas).get(0);
	this.context = this.canvas.getContext('2d');
	this.points = [];
	this.currentX = 0;
	this.generate = generate;
})
	.methods({
		update: function(){
			if (g_Frames >= this.generate){
				var tempY = Math.cos(this.currentX * Math.PI/(this.generate / 2));
				// if(tempY == 1){
					// console.log(g_Frames);
				// }
	
				tempY = (this.canvas.height / 2 ) - tempY * (this.canvas.height / 2);
				
				var newPoint = {X: this.canvas.width, Y:tempY};
				
				this.points.push(newPoint);
				if(this.points[0].X < 0){
					this.points.splice(0, 1);
				}
				this.currentX++;
			}
		},
		draw: function(){
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			
			var prev = this.points[0];
			
			for(var i = 0; i < this.points.length - 1; i++){
				var next = this.points[i];
				this.context.beginPath();
				this.context.moveTo(prev.X, prev.Y);
				this.context.lineTo(next.X, next.Y);
				
				this.context.stroke();
				
				prev = helper.cloneObj(next);
				
				next.X--;
			}
		},
	});