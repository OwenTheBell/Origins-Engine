var g_canvas, g_context;
var g_fps = 60;
var g_reciever = {};
var g_elements = [];
var g_Mouse = {};
var g_Frames = 0;
var g_generate = .5;

$(document).ready(function(){
	g_canvas = document.getElementById('myCanvas');
	//append these values to canvas since it doesn't normally have them
	g_canvas.left = $('#myCanvas').position().left;
	g_canvas.top = $('#myCanvas').position().top;
	g_context = g_canvas.getContext('2d');
	
	g_elements.push(new Emitter(g_canvas.width / 2, g_canvas.height / 2, 5, g_generate));
	g_reciever = new Reciever(100, 100, 5);
	g_elements.push(g_reciever);
	
	startDraw();		
})

function startDraw () {
	setInterval(loop, 1000/60);
}

function loop() {
	g_Mouse = inputState.getMouse();
	
	$(g_elements).each(function(){
		this.update();
	});
	
	g_context.clearRect(0, 0, g_canvas.width, g_canvas.height);
	
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
	this.move = .5;
	this.circles = [];
	this.generate = g_fps / generate;
	this.waveForm = null;
})
	.methods({
		update: function() {
			if ((g_Frames >= this.generate) && (g_Frames % this.generate == 0)){
				g_elements.push(new Pulse(this.x, this.y, this.radius, 1));
				if (!this.waveForm){
					this.waveForm = new WaveForm(this.generate, 'emitterCanvas');
				}
				// console.log(g_Frames);
			}
			
			$(this.circles).each(function(){
				this.update();
			});
			if (this.waveForm){
				this.waveForm.update();
			}
			
			var moveX = 0, moveY = 0;
			
			if(g_Mouse.down){
				//if the mouse is less than a move away in both dimensions don't update position
				if (Math.abs(g_Mouse.X - this.x) >= this.move || Math.abs(g_Mouse.Y - this.y) >= this.move){
					if((g_Mouse.Y >= 0) && (g_Mouse.Y < g_canvas.height) && (g_Mouse.X >= 0) && (g_Mouse.X < g_canvas.width)){
						function findMove(y, x){
							var temp = Math.atan2(y, x);
							temp = temp * 180 / Math.PI;
							temp = 90 - Math.abs(temp);
							return temp / 90;
						}
						moveX = this.move * findMove(g_Mouse.Y - this.y, g_Mouse.X - this.x);
						moveY = this.move * findMove(g_Mouse.X - this.x, g_Mouse.Y - this.y);
					}
				}
			}
			
			this.x += moveX;
			this.y += moveY;
			
			if (this.x + this.radius > g_canvas.width) this.x = g_canvas.width;
			else if (this.x - this.radius < 0) this.x = 0;
			if (this.y + this.radius > g_canvas.height) this.y = g_canvas.height;
			else if (this.y - this.radius < 0) this.y = 0;
		},
		draw: function() {
			g_context.beginPath();
			g_context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
			g_context.closePath();
			g_context.fill();
			
			$(this.circles).each(function(){
				this.draw();
			});
			if (this.waveForm){
				this.waveForm.draw();
			}
		}
	});

var Reciever = klass(function(x, y, radius){
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.frameCount = -1;
	this.pulseFrameCount = 0;
	this.frameBuffer = [];
	this.collided = [];
	this.waveForm = null;
	this.newWave = false;
	this.nextPulse = null;
})
	.methods({
		update: function() {
			//check for collision with the pulses
			for(var i = 0; i < g_elements.length; i++){
				var pulse = g_elements[i];
				/*
				 * Every pulse needs to be checked for collision as, depending on emitter speed,
				 * the reciever may collide with pulses in a different order than they were emitted
				 */
				if (pulse instanceof Pulse && this.collided.indexOf(pulse) == -1){
					var distance = getDistance(pulse.x, pulse.y, this.x, this.y);
					if ((pulse.radius > (distance - this.radius)) && (pulse.radius < (distance + this.radius))){
						// console.log('pulse detected ' + g_Frames);
						this.collided.push(pulse);
						this.nextPulse = null;
						if(g_elements[i+1]){
							this.nextPulse = g_elements[i+1];
							distance = getDistance(this.nextPulse.x, this.nextPulse.y, this.x, this.y);
							distance -= this.nextPulse.radius;
							var frames = Math.floor(distance / this.nextPulse.growth) - 1;
							if(!this.waveForm){
								this.waveForm = new WaveForm(frames, 'recieverCanvas');
							} else {
								var Y = this.waveForm.currentY;
								var newX = Math.round(Math.acos(Y) * (this.waveForm.generate/2)/Math.PI);
								this.waveForm.generate = frames;
								this.waveForm.currentX = newX;
								
								// this.waveForm.generate = frames;
								// var points = this.waveForm.points;
								// this.waveForm = new WaveForm(frames, 'recieverCanvas');
								// this.waveForm.points = points;
							}
						}
					} else if (this.waveForm && !this.nextPulse) {
						distance -= pulse.radius;
						var frames = Math.floor(distance / pulse.growth) - 1;
						
						var Y = this.waveForm.currentY;
						var newX = Math.round(Math.acos(Y) * (this.waveForm.generate/2)/Math.PI);
						this.waveForm.generate *= (frames / this.waveForm.frameCount);
						console.log(frames / this.waveForm.frameCount);
						this.waveForm.currentX = newX;
						this.nextPulse = pulse;
						
					// 	this.nextPulse = pulse;
					// 	distance -= this.nextPulse.radius;
					// 	var frames = Math.floor(distance / this.nextPulse.growth);
					// 	
					// 	if(frames != this.waveForm.frameCount){
					// 		var Y = this.waveFrom.currentY;
					// 		var newX = Math.round(Math.acos(Y) * (this.waveForm.generate/2)/Math.PI);
					// 		
					// 		
					// 		// helper.debugPrint(frames, this.waveForm.frameCount);
					// 		var points = this.waveForm.points;
					// 		var newSpeed = frames / this.waveForm.frameCount;
					// 		this.waveForm.generate = this.waveForm.generate * newSpeed;
					// 		this.waveForm.frameCount = frames;
					// 		console.log('recalculating')
					// 	}
					// 	
					// 	
					// 	// var currentX = this.waveForm.currentX;
					// 	// var points = this.waveForm.points;
					// 	// this.waveForm = new WaveForm(frames, 'recieverCanvas');
					// 	// this.waveForm.points = points;
					// 	// currentX = Math.round(Math.acos(this.waveForm.debugY) * (frames/2)/Math.PI);
					// 	// this.waveForm.currentX = currentX;
					// 	// console.log('recalculating');
					}
				}
			}
			if (this.waveForm){
				this.waveForm.update();
				if(this.waveForm.currentY == 1){
					console.log('waveForm peaked at ' + g_Frames);
				}
			}
		},
		draw: function() {
			g_context.beginPath();
			g_context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
			g_context.closePath();
			g_context.fill();
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
	var distances = [[g_canvas.left, g_canvas.top],
					[g_canvas.left+g_canvas.width, g_canvas.top],
					[g_canvas.left+g_canvas.width, g_canvas.top+g_canvas.height],
					[g_canvas.left, g_canvas.top+g_canvas.height]];
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
				//the first element in g_reciever.collided must be this pulse
				index = g_reciever.collided.indexOf(this);
				g_reciever.collided.splice(index, 1);
			}
		},
		draw: function() {
			if (this.radius < this.maxRadius){
				g_context.beginPath();
				g_context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
				g_context.closePath();
				g_context.stroke();
			}
		}
		
	});

var WaveForm = klass(function(generate, canvas){
	this.canvas = $('#' + canvas).get(0);
	this.context = this.canvas.getContext('2d');
	this.points = [];
	this.currentX = 0;
	this.generate = generate; //number frames between peaks
	this.frameCount = 0; //count of frames until the next peak
	this.currentY = 0;
})
	.methods({
		update: function(){ 
			this.currentY = Math.cos(this.currentX * Math.PI/(this.generate / 2));
			// var textX = Math.round(Math.acos(tempY) * (this.generate/2)/Math.PI);
			// helper.debugPrint(textX, this.currentX);
			// this.debugY = tempY;
			if (this.currentY == 1){
				this.frameCount = this.generate;
			}

			var tempY = (this.canvas.height / 2 ) - this.currentY * (this.canvas.height / 2);
			
			var newPoint = {X: this.canvas.width, Y:tempY};
			
			this.points.push(newPoint);
			if(this.points[0].X < 0){
				this.points.splice(0, 1);
			}
			this.currentX++;
			this.frameCount--;
		},
		draw: function(){
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			
			var prev = null;
			
			for(var i = 0; i < this.points.length - 1; i++){
				var next = this.points[i];
				if (prev){
					this.context.beginPath();
					this.context.moveTo(prev.X, prev.Y);
					this.context.lineTo(next.X, next.Y);
					this.context.stroke();
				}
				prev = {X: next.X, Y: next.Y};
				next.X--;
			}
		}
	});