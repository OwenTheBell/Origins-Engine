var canvas, context;
var fps = 60;
var elements = [];
var reciever = {};
var globalMouse = {};

$(document).ready(function(){
	canvas = document.getElementById('myCanvas');
	context = canvas.getContext('2d');
	
	elements.push(new Emitter(canvas.width / 2, canvas.height / 2, 5));
	reciever = new Reciever(100, 100, 5);
	elements.push(reciever);
	
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
}

function getDistance(x1, y1, x2, y2){
	var x = Math.pow((x2 - x1), 2);
	var y = Math.pow((y2 - y1), 2);
	return Math.sqrt(x + y)
}

var Emitter = klass(function(x, y, radius){
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.move = 1;
	this.circles = [];
	this.generate = 2;
	this.frameCounter = 0;
})
	.methods({
		update: function() {
			if (this.frameCounter > (fps / this.generate)){
				elements.push(new Pulse(this.x, this.y, 2));
				this.frameCounter = 0;
				// var rads = Math.atan2(this.y - reciever.y, this.x - reciever.x);
				// var degrees = rads * 180 / Math.PI;
				// console.log('the angle should, in theory, be: ' + degrees);
			}
			this.frameCounter++;
			
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

var Pulse = klass(function(x, y, growth){
	this.x = x;
	this.y = y;
	this.growth = growth;
	this.collision = false;
	this.radius = 0;
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
	this.maxRadius = Math.max(distances[0], distances[1], distances[2], distances[3]);
	
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