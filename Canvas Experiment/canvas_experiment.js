var g = {
	canvas: {},
	context: {},
	fps: 60,
	reciever: {},
	emitter: {},
	elements: [],
	Mouse: {},
	Frames: 0,
	generate: .5,
	audioDIV: 'audio',
	waveDict: {}
}

$(document).ready(function(){
	g.canvas = document.getElementById('myCanvas');
	//append these values to canvas since it doesn't normally have them
	g.canvas.left = $('#myCanvas').position().left;
	g.canvas.top = $('#myCanvas').position().top;
	g.context = g.canvas.getContext('2d');
	
	g.emitter = new Emitter(g.canvas.width / 2, g.canvas.height / 2, 5, g.generate);
	g.reciever = new Reciever(100, 100, 5);
	g.elements.push(g.emitter);
	g.elements.push(g.reciever);
	
	startDraw();
});

function startDraw () {
	setInterval(loop, 1000/g.fps);
}

function loop() {
	g.Mouse = inputState.getMouse();
	
	$(g.elements).each(function(){
		this.update();
	});
	
	g.context.clearRect(0, 0, g.canvas.width, g.canvas.height);
	
	$(g.elements).each(function(){
		this.draw();
	});
	g.Frames++;
}

function getDistance(x1, y1, x2, y2){
	var x = Math.pow((x2 - x1), 2);
	var y = Math.pow((y2 - y1), 2);
	return Math.sqrt(x + y);
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

var Emitter = klass(function(x, y, radius, pulsePerSecond){
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.move = .5;
	this.growth = 1;
	this.circles = [];
	this.pulsePerSecond = pulsePerSecond;
	this.waveForm = new WaveForm(g.fps / this.pulsePerSecond, 'emitterCanvas');
})
	.methods({
		update: function() {
			
			this.waveForm.update();
			var distance = helper.getDistance(this.x, this.y, g.reciever.x, g.reciever.y);
			var frames = Math.ceil(distance / this.growth);
			g.waveDict[frames + g.Frames] = this.waveForm.currentY;
			
			if (this.waveForm.currentY == 1){
				g.elements.push(new Pulse (this.x, this.y, this.radius, this.growth));
			}
			
			var moveX = 0, moveY = 0;
			
			if(g.Mouse.down){
				//if the mouse is less than a move away in both dimensions don't update position
				if (Math.abs(g.Mouse.X - this.x) >= this.move || Math.abs(g.Mouse.Y - this.y) >= this.move){
					if((g.Mouse.Y >= 0) && (g.Mouse.Y < g.canvas.height) && (g.Mouse.X >= 0) && (g.Mouse.X < g.canvas.width)){
						function findMove(y, x){
							var temp = Math.atan2(y, x);
							temp = temp * 180 / Math.PI;
							temp = 90 - Math.abs(temp);
							return temp / 90;
						}
						moveX = this.move * findMove(g.Mouse.Y - this.y, g.Mouse.X - this.x);
						moveY = this.move * findMove(g.Mouse.X - this.x, g.Mouse.Y - this.y);
					}
				}
			}
			
			this.x += moveX;
			this.y += moveY;
			
			if (this.x + this.radius > g.canvas.width) this.x = g.canvas.width;
			else if (this.x - this.radius < 0) this.x = 0;
			if (this.y + this.radius > g.canvas.height) this.y = g.canvas.height;
			else if (this.y - this.radius < 0) this.y = 0;
		},
		draw: function() {
			g.context.beginPath();
			g.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
			g.context.closePath();
			g.context.fill();
			
			if (this.waveForm){
				this.waveForm.draw();
			}
		}
	});

var Reciever = klass(function(x, y, radius){
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.click = new audioElement('click', '../Audio/click');
	this.waveFormArray = null;
	this.canvas = $('#recieverCanvas').get(0);
	this.context = this.canvas.getContext('2d');
})
	.methods({
		update: function() {
			
			if(!this.waveFormArray){
				if(g.waveDict[g.Frames]){
					this.waveFormArray = [];
					var tempY = (this.canvas.height / 2 ) - g.waveDict[g.Frames] * (this.canvas.height / 2);
					this.waveFormArray.push({X: this.canvas.width, Y: tempY});
					delete g.waveDict[g.Frames];
				}
			} else {
				if (g.waveDict[g.Frames]){
					var tempY = (this.canvas.height / 2 ) - g.waveDict[g.Frames] * (this.canvas.height / 2);
					this.waveFormArray.push({X: this.canvas.width, Y: tempY});
					if (g.waveDict[g.Frames] == 1){
						this.click.play();
					}
					delete g.waveDict[g.Frames];
				}
				/*
				 * Some coordinates will be missed but this is ok since the waveform
				 * is still acceptably smooth despite the lacking a data point for every
				 * x coordinate
				 */
				if (this.waveFormArray[0].X < 0){
					this.waveFormArray.splice(0, 1);
				}
			}
		},
		draw: function() {
			if (this.waveFormArray){
				this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
				
				var prev = null
				
				for (var i = 0; i < this.waveFormArray.length; i++){
					var next = this.waveFormArray[i];
					if(prev){
						this.context.beginPath();
						this.context.moveTo(prev.X, prev.Y);
						this.context.lineTo(next.X, next.Y);
						this.context.stroke();
					}
					prev = {X: next.X, Y: next.Y};
					next.X--;
				}
			}
			
			g.context.beginPath();
			g.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
			g.context.closePath();
			g.context.fill();
		}
		
	});

var Pulse = klass(function(x, y, radius, growth){
	this.x = x;
	this.y = y;
	this.growth = growth;
	this.collision = false;
	this.radius = radius;
	var distances = [[g.canvas.left, g.canvas.top],
					[g.canvas.left+g.canvas.width, g.canvas.top],
					[g.canvas.left+g.canvas.width, g.canvas.top+g.canvas.height],
					[g.canvas.left, g.canvas.top+g.canvas.height]];
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
				var index = g.elements.indexOf(this);
				g.elements.splice(index, 1);
			}
		},
		draw: function() {
			if (this.radius < this.maxRadius){
				g.context.beginPath();
				g.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
				g.context.closePath();
				g.context.stroke();
			}
		}
		
	});

var WaveForm = klass(function(frames, canvas){
	this.canvas = $('#' + canvas).get(0);
	this.context = this.canvas.getContext('2d');
	this.points = [];
	this.currentX = 0; //value varying between 0 and 2*PI
	this.currentY = 0; //value varying between 1 and -1
	this.frames = frames; //num of frames between pulses
	this.Xadjust = (Math.PI * 2) / this.frames; //amount to change currentX per frame
})
	.methods({
		update: function(){
			this.currentY = Math.sin(this.currentX);
			if (this.currentX >= (Math.PI * 2)){
				this.currentX -= Math.PI * 2;
			}
			var tempY = (this.canvas.height / 2 ) - this.currentY * (this.canvas.height / 2);
			
			var newPoint = {X: this.canvas.width, Y:tempY};
			
			this.points.push(newPoint);
			if(this.points[0].X < 0){
				this.points.splice(0, 1);
			}
			this.currentX += this.Xadjust;
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
		},
		adjustFrames: function(newFrames){
			var spaceToFill = Math.PI * 2 - this.currentX;
			var distancePerFrame = spaceToFill / newFrames;
			helper.debugPrint(this.Xadjust, distancePerFrame);
			this.Xadjust = distancePerFrame;
		}
	});