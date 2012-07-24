var g = {
	canvas: {},
	context: {},
	fps: 60,
	reciever: {},
	emitter: {},
	target: {},
	elements: [],
	Mouse: {},
	Frames: 0,
	generate: .5, //this puts 120 pixels horizontally between peaks
	audioDIV: 'audio',
	waveDict: {},
	degError: 3,
	matchedAt: null,
	lastFrame: 0,
	lastLoopFrame: 0,
	getTime: function(){
		var d = new Date();
		return d.getTime();
	}
}

window.requestAnimFrame = (function(){
		return	window.requestAnimationFrame		||
				window.webkitRequestAnimationFrame	||
				window.mozRequestAnimationFrame		||
				window.oRequestAnimationFrame		||
				window.msRequestAnimationFrame;
})();

$(document).ready(function(){
	g.canvas = document.getElementById('myCanvas');
	//append these values to canvas since it doesn't normally have them
	g.canvas.left = $('#myCanvas').position().left;
	g.canvas.top = $('#myCanvas').position().top;
	g.context = g.canvas.getContext('2d');
	
	g.emitter = new Emitter(g.canvas.width / 2, g.canvas.height / 2, 5, g.generate);
	var randX = Math.floor(Math.random() * (g.canvas.width - 200) + 100);
	var randY = Math.floor(Math.random() * (g.canvas.height - 200) + 100);
	randX = g.canvas.width / 2 + 40;
	randY = g.canvas.height / 2 + 40;
	g.reciever = new Reciever(randX, randY, 5);
	g.target = new Target([0, 120, 240, 360]);
	g.elements.push(g.emitter);
	g.elements.push(g.reciever);
	g.elements.push(g.target);
	
	startDraw();
});

function startDraw () {
	//requestAnimFrame(startDraw);
	//loop();
	setInterval(loop, 1000/g.fps);
}

function loop() {
	g.Mouse = inputState.getMouse();

	$(g.elements).each(function(){
		this.update();
	});
	
	g.context.clearRect(0, 0, g.canvas.width, g.canvas.height);
	
	$(g.elements).each(function(){
		this.canvasDraw();
	});
	g.context.stroke();
		

	if (g.lastFrameTime){
		if (g.Frames >= g.lastFrame + g.fps){
			var newTime = g.getTime();
			$('#fpsTracker').html((newTime - g.lastFrameTime) + ' ' + (g.Frames - g.lastFrame));
			//console.log('Elapsed time in last 60 frames: ' + (newTime - g.lastFrameTime));
			//console.log('Number of elements in waveDict: ' + helper.countElements(g.waveDict));
			g.lastFrameTime = newTime;
			g.lastFrame = g.Frames;
		}
	} else {
		g.lastFrameTime = g.getTime();
		g.lastFrame = g.Frames;
	}
	
	//cleanup g.waveDict
	for (i in g.waveDict){
		if(i < g.Frames){
			delete g.waveDict[i];
		}
	}
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
		canvasDraw: function() {
			g.context.beginPath();
			g.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
			g.context.closePath();
			g.context.fill();
			
			if (this.waveForm){
				this.waveForm.canvasDraw();
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
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this.matched = false;
})
	.methods({
		update: function() {
			if (!this.matched){
				if(g.waveDict[g.Frames]){
					if(!this.waveFormArray){
						this.waveFormArray = [];
					}
					var tempY = (this.canvas.height / 2 ) - g.waveDict[g.Frames] * (this.canvas.height / 2);
					this.waveFormArray.push({X: this.canvas.width, Y: tempY});
					if (g.waveDict[g.Frames] == 1){
						// this.click.play();
					}
					delete g.waveDict[g.Frames];
				}
				//Now check against the target to see if we've completed the array
				var matchedPoints = 0;
				for (x in this.waveFormArray){
					if (this.waveFormArray[x].Y == 0){
						if ((this.waveFormArray[x].X >= g.target.targetPoints[matchedPoints] - g.degError) &&
							(this.waveFormArray[x].X <= g.target.targetPoints[matchedPoints] + g.degError)){
						
							matchedPoints++;
							if (matchedPoints == g.target.targetPoints.length){
								this.matched = true;
								g.matchedAt = g.Frames;
							}
						} else {
							//if the first point doesn't match up with the targetPoints
							//then there is no need to continue testing for a match
							break;
						}
					}
				}
			}
		},
		canvasDraw: function() {
			if (this.waveFormArray){
				this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
				
				if (this.matched){
					this.context.beginPath();
					this.context.rect(0, 0, this.canvas.width, this.canvas.height);
					this.context.fillStyle = '#00FF00';
					this.context.fill();
				}
				
				else {
					this.context.beginPath();
					var prev = null
					
					for (var i = 0; i < this.waveFormArray.length; i++){
						var next = this.waveFormArray[i];
						if(prev){
							this.context.moveTo(prev.X, prev.Y);
							this.context.lineTo(next.X, next.Y);
						}
						prev = {X: next.X, Y: next.Y};
						next.X--;
					}
					this.context.closePath();
					this.context.stroke();
				}
			}
			
			g.context.beginPath();
			g.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
			g.context.closePath();
			g.context.fill();
		}
		
	});

/*
 * Array of the x-coordinate for which the y-coordinate is at peak
 */
var Target = klass(function(highPoints){
	this.canvas = $('#targetCanvas').get(0);
	this.context = this.canvas.getContext('2d');
	this.updated = true;
	this.targetPoints = highPoints;
	this.waveFormArray = [];
	
	for(var i = 0; i < highPoints.length - 1; i++){
		var peakDif = highPoints[i+1] - highPoints[i];
		var xPos = highPoints[i];
		var xInc = Math.PI * 2 / peakDif    
		for(var j = 0; j < peakDif; j++){
			var y = (this.canvas.height / 2) - Math.cos(xInc * j) * (this.canvas.height / 2);
			this.waveFormArray.push({X: xPos + j, Y: y});
		}
		//this little bit of code keeps the graph clean by making sure it goes edge to edge
		if (!highPoints[i+2]){
			xPos = highPoints[i+1];
			var varyInc = 0;
			while(xPos <= this.canvas.width){
				var y = (this.canvas.height / 2) - Math.cos(xInc * varyInc++) * (this.canvas.height / 2);
				this.waveFormArray.push({X: xPos++, Y: y});
			}
		}
	}
})
	.methods({
		update: function(){
		},
		canvasDraw: function(){
			if (this.updated){
				this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
				this.context.beginPath();
				var prev = null;
				
				for(var i=0; i < this.waveFormArray.length; i++){
					var next = this.waveFormArray[i];
					if(prev){
						this.context.moveTo(prev.X, prev.Y);
						this.context.lineTo(next.X, next.Y);
					}
					prev = next;
				}
				this.context.closePath();
				this.context.stroke();
				this.updated = false;
			}
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
	this.canvas = document.createElement('canvas');
	this.canvas.width = g.canvas.width;
	this.canvas.height = g.canvas.height;
	this.context = this.canvas.getContext('2d');
	
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
		canvasDraw: function() {
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
		canvasDraw: function(){
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.context.beginPath();
			var prev = null;
			
			for(var i = 0; i < this.points.length - 1; i++){
				var next = this.points[i];
				if (prev){
					this.context.moveTo(prev.X, prev.Y);
					this.context.lineTo(next.X, next.Y);
				}
				prev = {X: next.X, Y: next.Y};
				next.X--;
			}
			this.context.closePath();
			this.context.stroke();
		},
		adjustFrames: function(newFrames){
			var spaceToFill = Math.PI * 2 - this.currentX;
			var distancePerFrame = spaceToFill / newFrames;
			helper.debugPrint(this.Xadjust, distancePerFrame);
			this.Xadjust = distancePerFrame;
		}
	});
