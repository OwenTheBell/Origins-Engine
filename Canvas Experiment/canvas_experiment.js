var canvas, context;
var fps = 60;
var g_elements = [];
var g_Mouse = {};
var g_Frames = 0;
var g_generate = 1;

$(document).ready(function(){
	canvas = document.getElementById('myCanvas');
	console.log(canvas.left)
	//append these values to canvas since it doesn't normally have them
	canvas.left = $('#myCanvas').position().left;
	canvas.top = $('#myCanvas').position().top;
	context = canvas.getContext('2d');
	
	g_elements.push(new Emitter(canvas.width / 2, canvas.height / 2, 5, g_generate));
	g_elements.push(new Reciever(100, 100, 5));
	
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
			
			var moveX = 0, moveY = 0;
			
			if(g_Mouse.down){
				//if the mouse is less than a move away in both dimensions don't update position
				if (Math.abs(g_Mouse.X - this.x) >= this.move || Math.abs(g_Mouse.Y - this.y) >= this.move){
					if((g_Mouse.Y >= 0) && (g_Mouse.Y < canvas.height) && (g_Mouse.X >= 0) && (g_Mouse.X < canvas.width)){
						function findMove(y, x){
							var temp = math.atan2(y, x);
							var temp = temp * 180 / Math.PI;
							return temp / 90;
							return temp;
						}
						moveX = this.move * findMove(g_Mouse.Y - this.y, g_Mouse.X - this.x);
						moveY = this.move * findMove(g_Mouse.X - this.x, g_Mouse.Y - this.y);
					}
				}
			}
			
			this.x += moveX;
			this.y += moveY;
			
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
		}
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
						console.log('pulse detected at: ' + g_Frames);
						/*
						 * elements is organized such that if there is a i+1 it will be a pulse
						 * if there is not a pulse at that position, though, then the reciever needs
						 * to determine when it thinks the next pulse will arrive based on the rate of
						 * pulse generation and how quickly the pulses move
						 */
						var nextPulse = g_elements[i+1];
						distance = getDistance(nextPulse.x, nextPulse.y, this.x, this.y) - this.radius;
						distance = distance - nextPulse.radius;
						//add one to account for pulses updating before the reciever
						var frames = Math.floor(distance / nextPulse.growth) + 1;
						if (!this.waveForm){
							this.waveForm = new WaveForm(frames, 'recieverCanvas');
						} else {
							//save the points from the previous waveForm
							var points = this.waveForm.points;
							this.waveForm = new WaveForm(frames, 'recieverCanvas');
							this.waveForm.points = points;
						}
						break;
					}
				}
			};
			if (this.waveForm){
				this.waveForm.update();
				if (this.waveForm.debugY == 1){
					console.log('wave form peaked at: '+ g_Frames);
				}
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
		}
		
	});

var Pulse = klass(function(x, y, radius, growth){
	this.x = x;
	this.y = y;
	this.growth = growth;
	this.collision = false;
	this.radius = radius;
	var distances = [[canvas.left, canvas.top],
					[canvas.left+canvas.width, canvas.top],
					[canvas.left+canvas.width, canvas.top+canvas.height],
					[canvas.left, canvas.top+canvas.height]];
	for(i in distances){
		distances[i] = getDistance(this.x, this.y, distances[i][0], distances[i][1]);
	}
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
		}
		
	});

var WaveForm = klass(function(generate, canvas){
	this.canvas = $('#' + canvas).get(0);
	this.context = this.canvas.getContext('2d');
	this.points = [];
	this.currentX = 0;
	this.generate = generate;
	this.debugY = 0;
})
	.methods({
		update: function(){
			if (g_Frames >= this.generate){
				var tempY = Math.cos(this.currentX * Math.PI/(this.generate / 2));
				this.debugY = tempY;
	
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
		}
	});