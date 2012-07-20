//global variable container for this game
var doppler = {
	canvas: {},
	reciever: {},
	emitter: {},
	target: {},
	elements: [], //nonSprite elemenents, stuff like the emitter
	Mouse: {},
	Frames: 0,
	generate: .5, //this puts 120 pixels horizontally between peaks
	waveDict: {},
	degError: 3,
	matchedAt: null
}

var DopplerScreen = Screen.extend(function(id, zIndex){
	doppler.canvas = new Canvas('mainCanvas', 0, 0, 1280, 480);
	doppler.elements.push(doppler.canvas);
	doppler.emitter = new Emitter(doppler.canvas.width / 2, doppler.canvas.height / 2, 5, doppler.generate);
	var randX = Math.floor(Math.random() * (doppler.canvas.width - 200) + 100);
	var randY = Math.floor(Math.random() * (doppler.canvas.height - 200) + 100);
	doppler.reciever = new Reciever(randX, randY, 5);
	doppler.target = new Target([0, 120, 240, 360]);
	doppler.elements.push(doppler.emitter);
	doppler.elements.push(doppler.reciever);
	doppler.elements.push(doppler.target);
})
	.methods({
		update: function(){
			this.supr();
			for(i in doppler.elements){
				doppler.elements[i].update();
			}
		},
		draw: function(){
			var HTML = '';
			//only bother rendering if we can actually see this screen
			if (this.css['opacity'] > 0){
				HTML += '<div id =' + this.id + ' style="';
				for(x in this.css){
					HTML += x + ':' + this.css[x] + '; ';
				}
				if (this.classes.length > 0){
					HTML += '" class="';
					for(x in this.classes){
						HTML += this.classes[x] + ' ';
					}
				}
				HTML += '" >';
				for (x in this.spriteArray){
					HTML += this.spriteArray[x].draw();
				}
				for (x in doppler.elements){
					if(doppler.elements[x].draw){
						HTML += doppler.elements[x].draw();
					}
				}
				HTML += '</div>';
			}
			return(HTML);
		},
		canvasDraw: function(){
			doppler.canvas.clear();
			//doppler.canvas.context.clearRect(0, 0, this.doppler.width, this.doppler.height);

			for(x in doppler.elements){
				doppler.elements[x].canvasDraw();
			}
			doppler.canvas.canvasDraw();
		}
	});

/*
 * This is both wrapper for a canvas object as well as for generating the necessary
 * HTML to get outed to the DOM for the canvas to display on
 */
var Canvas = klass(function(id, left, top, width, height){
	this.id = id;
	this.top = top;
	this.left = left;
	this.width = width;
	this.height = height;
	this.css = {
		top: this.top + 'px',
		left: this.left + 'px',
		'z-index': 2 //this is the default canvas layer
	};
	this.canvas = document.createElement('canvas');
	this.canvas.width = this.width;
	this.canvas.height = this.height
	this.context = this.canvas.getContext('2d');
})
	.methods({
		update: function(){
		},
		//this just returns the html needed to create a canvas object to draw the canvas to
		draw: function(){
			var HTML = '<canvas id=' + this.id + ' width=' + this.width + ' height=' + this.height + ' style="';
			for(x in this.css){
				HTML += x + ':' + this.css[x] + '; ';
			}
			HTML += '" > </canvas>';
			return HTML;
		},
		//this function handles the actual canvas rendering
		canvasDraw: function(){
			var tempContext = document.getElementById(this.id).getContext('2d');
			tempContext.drawImage(this.canvas, 0, 0);
		},
		clear: function(){
			this.context.clearRect(0, 0, this.width, this.height);
		}
	});

var Emitter = klass(function(x, y, radius, pulsePerSecond){
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.move = .5;
	this.growth = 1;
	this.circles = [];
	this.pulsePerSecond = pulsePerSecond;
	this.waveForm = new WaveForm(g.fps / this.pulsePerSecond, 'emitterCanvas', 417, 634, 444, 84);
})
	.methods({
		update: function() {
			this.waveForm.update();
			var distance = helper.getDistance(this.x, this.y, doppler.reciever.x, doppler.reciever.y);
			var frames = Math.ceil(distance / this.growth);
			doppler.waveDict[frames + doppler.Frames] = this.waveForm.currentY;
			
			if (this.waveForm.currentY == 1){
				doppler.elements.push(new Pulse (this.x, this.y, this.radius, this.growth));
			}
			
			var moveX = 0, moveY = 0;
			
			if(g.input.mouse.down){
				//if the mouse is less than a move away in both dimensions don't update position
				if (Math.abs(g.input.mouse.X - this.x) >= this.move || Math.abs(g.input.mouse.Y - this.y) >= this.move){
					if((g.input.mouse.Y >= 0) && (g.input.mouse.Y < doppler.canvas.height) && (g.input.mouse.X >= 0) && (g.input.mouse.X < doppler.canvas.width)){
						function findMove(y, x){
							var temp = Math.atan2(y, x);
							temp = temp * 180 / Math.PI;
							temp = 90 - Math.abs(temp);
							return temp / 90;
						}
						moveX = this.move * findMove(g.input.mouse.Y - this.y, g.input.mouse.X - this.x);
						moveY = this.move * findMove(g.input.mouse.X - this.x, g.input.mouse.Y - this.y);
					}
				}
			}
			
			this.x += moveX;
			this.y += moveY;
			
			//ensure that the emitter cannot leave the bounds of the play area
			if (this.x + this.radius > doppler.canvas.width) this.x = doppler.canvas.width;
			else if (this.x - this.radius < 0) this.x = 0;
			if (this.y + this.radius > doppler.canvas.height) this.y = doppler.canvas.height;
			else if (this.y - this.radius < 0) this.y = 0;
		},
		draw: function(){
			return this.waveForm.draw();
		},
		canvasDraw: function() {
			doppler.canvas.context.beginPath();
			doppler.canvas.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
			doppler.canvas.context.closePath();
			doppler.canvas.context.fill();
			
			if (this.waveForm){
				this.waveForm.canvasDraw();
			}
		}
	});

var Reciever = klass(function(x, y, radius){
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.click = new audioElement('click', 'Audio/click');
	this.waveFormArray = null;
	this.canvas = new Canvas('recieverCanvas', 417, 561, 444, 77);
	this.matched = false;
})
	.methods({
		update: function() {
			
			if(!this.waveFormArray){
				if(doppler.waveDict[doppler.Frames]){
					this.waveFormArray = [];
					var tempY = (this.canvas.height / 2 ) - doppler.waveDict[doppler.Frames] * (this.canvas.height / 2);
					this.waveFormArray.push({X: this.canvas.width, Y: tempY});
					delete doppler.waveDict[doppler.Frames];
				}
			} else {
				if (doppler.waveDict[doppler.Frames]){
					var tempY = (this.canvas.height / 2 ) - doppler.waveDict[doppler.Frames] * (this.canvas.height / 2);
					this.waveFormArray.push({X: this.canvas.width, Y: tempY});
					if (doppler.waveDict[doppler.Frames] == 1){
						// this.click.play();
					}
					delete doppler.waveDict[doppler.Frames];
				}
				//Now check against the target to see if we've completed the array
				var matchedPoints = 0;
				for (x in this.waveFormArray){
					if (this.waveFormArray[x].Y == 0){
						if ((this.waveFormArray[x].X >= doppler.target.targetPoints[matchedPoints] - doppler.degError) &&
							(this.waveFormArray[x].X <= doppler.target.targetPoints[matchedPoints] + doppler.degError)){
						
							matchedPoints++;
							if (matchedPoints == doppler.target.targetPoints.length){
								this.matched = true;
								doppler.matchedAt = doppler.Frames;
							}
						} else {
							//if the first point doesn't match up with the targetPoints
							//then there is no need to continue testing for a match
							break;
						}
					}
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
		draw: function(){
			return this.canvas.draw();
		},
		canvasDraw: function() {
			if (this.waveFormArray){
				this.canvas.clear();
				//this.canvas.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
				
				if (this.matched){
					this.canvas.context.beginPath();
					this.canvas.context.rect(0, 0, this.canvas.width, this.canvas.height);
					this.canvas.context.fillStyle = '#00FF00';
					this.canvas.context.fill();
				}
				
				else {
					var prev = null
					
					for (var i = 0; i < this.waveFormArray.length; i++){
						var next = this.waveFormArray[i];
						if(prev){
							this.canvas.context.beginPath();
							this.canvas.context.moveTo(prev.X, prev.Y);
							this.canvas.context.lineTo(next.X, next.Y);
							this.canvas.ontext.stroke();
						}
						prev = {X: next.X, Y: next.Y};
						next.X--;
					}
				}
				this.canvas.canvasDraw();
			}
			
			doppler.canvas.context.beginPath();
			doppler.canvas.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
			doppler.canvas.context.closePath();
			doppler.canvas.context.fill();
		}
		
	});

/*
 * Array of the x-coordinate for which the y-coordinate is at peak
 */
var Target = klass(function(highPoints){
	this.canvas = new Canvas('targetCanvas', 417, 487, 444, 77);
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
		draw: function(){
			return this.canvas.draw();
		},
		canvasDraw: function(){
			if (this.updated){
				this.canvas.clear();
				//this.canvas.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
				var prev = null;
				
				for(var i=0; i < this.waveFormArray.length; i++){
					var next = this.waveFormArray[i];
					if(prev){
						this.canvas.context.beginPath();
						this.canvas.context.moveTo(prev.X, prev.Y);
						this.canvas.context.lineTo(next.X, next.Y);
						this.canvas.context.stroke();
					}
					prev = next;
				}
				this.canvas.canvasDraw();
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
	var distances = [[doppler.canvas.left, doppler.canvas.top],
					[doppler.canvas.left+doppler.canvas.width, doppler.canvas.top],
					[doppler.canvas.left+doppler.canvas.width, doppler.canvas.top+doppler.canvas.height],
					[doppler.canvas.left, doppler.canvas.top+doppler.canvas.height]];
	for(i in distances){
		distances[i] = helper.getDistance(this.x, this.y, distances[i][0], distances[i][1]);
	}
	this.maxRadius = helper.getMax(distances);
	
})
	.methods({
		update: function(){
			if (this.radius < this.maxRadius){
				this.radius += this.growth;
			} else {
				var index = doppler.elements.indexOf(this);
				doppler.elements.splice(index, 1);
			}
		},
		canvasDraw: function() {
			if (this.radius < this.maxRadius){
				doppler.canvas.context.beginPath();
				doppler.canvas.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
				doppler.canvas.context.closePath();
				doppler.canvas.context.stroke();
			}
		}
		
	});

var WaveForm = klass(function(frames, canvas, left, top, width, height){
	this.canvas = new Canvas(canvas, left, top, width, height);
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
			var HTML = this.canvas.draw();
			return HTML;
		},
		canvasDraw: function(){
			this.canvas.clear();
			var prev = null;
			for(var i = 0; i < this.points.length - 1; i++){
				var next = this.points[i];
				if (prev){
					this.canvas.context.beginPath();
					this.canvas.context.moveTo(prev.X, prev.Y);
					this.canvas.context.lineTo(next.X, next.Y);
					this.canvas.context.strokeStyle = 'blue';
					this.canvas.context.stroke();
				}
				prev = {X: next.X, Y: next.Y};
				next.X--;
			}
			this.canvas.canvasDraw();
		},
		adjustFrames: function(newFrames){
			var spaceToFill = Math.PI * 2 - this.currentX;
			var distancePerFrame = spaceToFill / newFrames;
			helper.debugPrint(this.Xadjust, distancePerFrame);
			this.Xadjust = distancePerFrame;
		}
	});
