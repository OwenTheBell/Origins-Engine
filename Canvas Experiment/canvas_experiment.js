var canvas, context;
var fps = 60;
var elements = [];
var reciever = {};
var globalMouse = {};
var globalFrames = 0;
var pulse = 1;

$(document).ready(function(){
	canvas = $('#myCanvas').get(0);
	context = canvas.getContext('2d');
	
	elements.push(new Emitter(canvas.width / 2, canvas.height / 2, 5, pulse));
	reciever = new Reciever(100, 100, 5);
	elements.push(reciever);
	elements.push(new emitterWaveForm(pulse));
	
	startDraw();		
})

function startDraw () {
	setInterval(loop, 1000/30);
}

function loop() {
	globalMouse = inputState.getMouse();
	
	$(elements).each(function(){
		this.update();
	});
	
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	$(elements).each(function(){
		this.draw();
	});
	globalFrames++;
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

var emitterWaveForm = klass(function(pulse){
	this.canvas = $('#emitterCanvas').get(0);
	this.context = this.canvas.getContext('2d');
	this.points = [];
	this.currentX = 0;
	this.pulse = fps / pulse;
})
	.methods({
		update: function(){
			if (globalFrames >= this.pulse){
				var y = Math.cos(this.currentX * Math.PI/(this.pulse / 2));
	
				y = (this.canvas.height / 2 ) - y * (this.canvas.height / 2);
				
				var newPoint = {X: this.canvas.width, Y:y};
				
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

var Emitter = klass(function(x, y, radius, generate){
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.move = 1.5;
	this.circles = [];
	this.generate = fps / generate;
})
	.methods({
		update: function() {
			if ((globalFrames >= this.generate) && (globalFrames % this.generate == 0)){
				elements.push(new Pulse(this.x, this.y, this.radius, 2));
			}
			
			$(this.circles).each(function(){
				this.update();
			});
			
			var x = 0, y = 0;
			
			if(globalMouse.down){
				if((globalMouse.Y >= 0) && (globalMouse.Y < canvas.height) && (globalMouse.X >= 0) && (globalMouse.X < canvas.width)){
					var rads = Math.atan2(globalMouse.Y - this.y, globalMouse.X - this.x);
					var degrees = rads * 180 / Math.PI;
					x = 90 - Math.abs(degrees);
					x = x / 90;
					x = this.move * x;
					//calculate angle relative to y-axis
					rads = Math.atan2(globalMouse.X - this.x, globalMouse.Y - this.y);
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
		},
		
	});

var Reciever = klass(function(x, y, radius){
	this.x = x;
	this.y = y;
	this.radius = radius;
})
	.methods({
		update: function() {
		},
		draw: function() {
			context.beginPath();
			context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
			context.closePath();
			context.fill();
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
				var index = elements.indexOf(this);
				elements.splice(index, 1);
			}
			//check collision with the reciever
			if (!this.collision){
				var distance = getDistance(this.x, this.y, reciever.x, reciever.y);
					if((this.radius > (distance - reciever.radius)) && (this.radius < (distance + reciever.radius))){
						this.collision = true;
					}
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