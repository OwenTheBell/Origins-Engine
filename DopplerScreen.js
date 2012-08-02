//global variable container for this game
var doppler = {
	canvas: {},
	reciever: {},
	emitter: {},
	target: {},
	mouseCount: {}, //textbox object that stores and prints the number of caught mice
	elements: [], //nonSprite elemenents, stuff like the emitter or canvases
	Mouse: {},
	generate: .5, //this puts 120 pixels horizontally between peaks
	waveDict: {}, //stores all the waves that the emitter will draw
	degError: 3,
	matchedAt: null,
	matchedDelay: 30, //num of frames to delay until reseting after a successful match
	recieverH: 250,
	recieverW: 200,
}

var DopplerScreen = Screen.extend(function(id){
	doppler.canvas = new Canvas('mainCanvas', 0, 0, 1280, 600, 3);
	doppler.elements.push(doppler.canvas);
	doppler.emitter = new Emitter(20, 20, 5, doppler.generate, 1.5);
	var randX = Math.floor(Math.random() * (doppler.canvas.width - 200) + 100);
	var randY = Math.floor(Math.random() * (doppler.canvas.height - 300) + 100);
	doppler.reciever = new Reciever(randX, randY, 5);
	doppler.target = new Target([0, 60, 120, 180, 240]);
	doppler.elements.push(doppler.emitter, doppler.reciever, doppler.target);
	doppler.mouseCount = new textBox('mouseCount', '0', 160, 660, '#00ff00', 6, '20px');
	this.addSprite(doppler.mouseCount);
})
	.methods({
		update: function(){
			this.supr();
			if (this.css['opacity'] > 0){
				for(i in doppler.elements){
					doppler.elements[i].update();
				}
				for(i in doppler.waveDict){
					if (doppler.waveDict[i].X < 0){
						delete doppler.waveDict[i];
					}
				}
				if(doppler.matchedAt && g.frameCounter >= doppler.matchedAt + 30){
					doppler.canvas = new Canvas('mainCanvas', 0, 0, 1280, 600, 3);
					doppler.elements = [];
					doppler.waveDict = {};
					doppler.elements.push(doppler.canvas);
					doppler.elements.push(doppler.emitter);
					var randX = Math.floor(Math.random() * (doppler.canvas.width - 200) + 100);
					var randY = Math.floor(Math.random() * (doppler.canvas.height - 200) + 100);
					doppler.reciever = new Reciever(randX, randY, 5);
					doppler.target = new Target([0, 120, 240, 360]);
					doppler.elements.push(doppler.reciever, doppler.target);
					doppler.mouseCount = parseInt(doppler.mouseCount.text) + 1;
					doppler.matchedAt = null;
				}
			}
		},
		draw: function(HTML){
			//only bother rendering if we can actually see this screen
			if (this.css['opacity'] > 0){
				HTML.push('<div id=', this.id, ' style="');
				for(x in this.css){
					HTML.push(x, ': ', this.css[x], '; ');
				}
				if (this.classes.length > 0){
					HTML.push('" class="');
					for(x in this.classes){
						HTML.push(this.classes[x], ' ');
					}
				}
				HTML.push('" >');
				for (x in this.spriteArray){
					this.spriteArray[x].draw(HTML);
				}
				for (x in doppler.elements){
					if(doppler.elements[x].draw){
						doppler.elements[x].draw(HTML);
					}
				}
				HTML.push('</div>');
			}
		},
		canvasDraw: function(){
			if (this.css['opacity'] > 0){
				var fragment = document.createDocumentFragment();
				var div = document.getElementById(this.id);
				
				doppler.canvas.clear();
				for(x in doppler.elements){
					if (!(doppler.elements[x] instanceof Canvas)){
						var temp = doppler.elements[x].canvasDraw();
						if(temp){
							fragment.appendChild(temp);
						}
					}
				}
				fragment.appendChild(doppler.canvas.canvasDraw());
				div.appendChild(fragment);
			}
		}
	});

var Emitter = klass(function(x, y, radius, pulsePerSecond, speed){
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.move = speed;
	this.growth = 2;
	this.circles = [];
	this.pulsePerSecond = pulsePerSecond;
	this.waveForm = new WaveForm(g.fps / this.pulsePerSecond, 'emitterCanvas', 421, 639, 434, 73, 'blue');
	this.image = new Image();
	this.image.src = 'Sprites/Doppler_Screen/Robot_Blue_light.png';
	this.centerX = this.x + this.image.width / 2;
	this.centerY = this.y + this.image.height / 2;
	this.transAngle = 0;
})
	.methods({
		update: function() {
			this.waveForm.update();
			var distance = helper.getDistance(this.centerX, this.centerY, doppler.reciever.centerX, doppler.reciever.centerY);
			var frames = Math.ceil(distance / this.growth);
			//only add to the waveDict if the point has not been created or a peak will not be overwritten
			if(!doppler.waveDict[frames + g.frameCounter] || doppler.waveDict[frames + g.frameCounter] != 1){
				doppler.waveDict[frames + g.frameCounter] = this.waveForm.currentY;
			}
			
			if (this.waveForm.currentY == 1){
				doppler.elements.push(new Pulse(this.centerX, this.centerY, this.radius, this.growth));
			}
			
			var moveX = 0, moveY = 0;
			
			if(g.input.mouse.down){
				//if the mouse is less than a move away in both dimensions don't update position
				if (Math.abs(g.input.mouse.X - this.centerX) >= this.move || Math.abs(g.input.mouse.Y - this.centerY) >= this.move){
					if((g.input.mouse.Y >= 0) && (g.input.mouse.Y < doppler.canvas.height) && (g.input.mouse.X >= 0) && (g.input.mouse.X < doppler.canvas.width)){
						function findMove(y, x){
							var temp = Math.atan2(y, x);
							temp = temp * 180 / Math.PI;
							temp = 90 - Math.abs(temp);
							return temp / 90;
						}
						var Xadjust = findMove(g.input.mouse.Y - this.centerY, g.input.mouse.X - this.centerX);
						var Yadjust = findMove(g.input.mouse.X - this.centerX, g.input.mouse.Y - this.centerY);
						moveX = this.move * Xadjust;
						moveY = this.move * Yadjust;
						var tempX = g.input.mouse.X - this.centerX;
						var tempY = g.input.mouse.Y - this.centerY;
						this.transAngle = Math.atan2(tempX, -tempY);
					}
				}
			}
			
			this.x += moveX;
			this.y += moveY;
			this.centerY = this.y + this.image.height / 2;
			this.centerX = this.x + this.image.width / 2;
			
			//ensure that the emitter cannot leave the bounds of the play area
			//TODO: bounds are currently hardcoded which should perhaps change at somepoint in the future
			if ((this.centerX + this.radius) > (doppler.canvas.width - 20)) this.centerX = doppler.canvas.width - this.radius - 20;
			else if ((this.centerX - this.radius) < 20) this.centerX = this.radius + 20;
			if ((this.centerY + this.radius) > (doppler.canvas.height - 120)) this.centerY = doppler.canvas.height - this.radius - 120;
			else if ((this.centerY - this.radius) < 20) this.centerY = this.radius + 20;
		},
		draw: function(HTML){
			return this.waveForm.draw(HTML);
		},
		canvasDraw: function() {
			var context = doppler.canvas.context;
			context.save();
				context.translate(this.x, this.y);
				context.translate(this.image.width / 2, this.image.height / 2);
				context.rotate(this.transAngle);
				context.drawImage(this.image, -(this.image.width / 2), -(this.image.height / 2));
			context.restore();
			
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
	this.canvas = new Canvas('recieverCanvas', 421, 566, 434, 68, 5);
	this.canvas.context.strokeStyle = 'yellow';
	this.matched = false;
	this.image = new Image();
	this.image.src = 'Sprites/Doppler_Screen/Grey_Maus_sprite_sheet.png';
	this.spriteH = doppler.recieverH;
	this.spriteW = doppler.recieverW;
	this.centerX = this.x + doppler.recieverW / 2;
	this.centerY = this.y + doppler.recieverH / 2;
})
	.methods({
		update: function() {
			if (!this.matched){
				if (doppler.waveDict[g.frameCounter]){
					if(!this.waveFormArray){
						this.waveFormArray = [];
					}
					var tempY = (this.canvas.height / 2 ) - doppler.waveDict[g.frameCounter] * (this.canvas.height / 2);
					this.waveFormArray.push({X: this.canvas.width, Y: tempY});
					if (doppler.waveDict[g.frameCounter] == 1){
						// this.click.play();
					}
					delete doppler.waveDict[g.frameCounter];
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
								doppler.matchedAt = g.frameCounter;
								doppler.mouseCount.text = '' + (parseInt(doppler.mouseCount.text) + 1);
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
		draw: function(HTML){
			this.canvas.draw(HTML);
		},
		canvasDraw: function() {
			if (this.waveFormArray){
				this.canvas.clear();
				
				if (this.matched){
					this.canvas.context.beginPath();
					this.canvas.context.rect(0, 0, this.canvas.width, this.canvas.height);
					this.canvas.context.fillStyle = '#00FF00';
					this.canvas.context.fill();
				} else {
					this.canvas.context.beginPath();
					var prev = null
					
					for (var i = 0; i < this.waveFormArray.length; i++){
						var next = this.waveFormArray[i];
						if(prev){
							this.canvas.context.moveTo(prev.X, prev.Y);
							this.canvas.context.lineTo(next.X, next.Y);
						}
						prev = {X: next.X, Y: next.Y};
						next.X--;
					}
					this.canvas.context.stroke();
				}
			}
			
			doppler.canvas.context.drawImage(this.image, 0, 0, this.spriteW, this.spriteH, this.x, this.y, this.spriteW, this.spriteH);
			return this.canvas.canvasDraw();
		}
	});

/*
 * Array of the x-coordinate for which the y-coordinate is at peak
 */
var Target = klass(function(highPoints){
	this.canvas = new Canvas('targetCanvas', 421, 492, 434, 68, 5);
	this.canvas.context.strokeStyle = 'green';
	this.rendered = true;
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
		draw: function(HTML){
			this.canvas.draw(HTML);
		},
		canvasDraw: function(){
			if (this.rendered){
				this.canvas.clear();
				this.canvas.context.beginPath();
				var prev = null;
				
				for(var i=0; i < this.waveFormArray.length; i++){
					var next = this.waveFormArray[i];
					if(prev){
						this.canvas.context.moveTo(prev.X, prev.Y);
						this.canvas.context.lineTo(next.X, next.Y);
					}
					prev = next;
				}
				this.canvas.context.stroke();
				this.rendered = false;
			}
			//call canvasDraw to ensure that the canvas is always added through
			//DOM changes
			return this.canvas.canvasDraw();
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
			var context = doppler.canvas.context;
			if (this.radius < this.maxRadius){
				context.beginPath();
				context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
				context.closePath();
				context.stroke();
			}
		}
		
	});

var WaveForm = klass(function(frames, canvas, left, top, width, height, color){
	this.canvas = new Canvas(canvas, left, top, width, height, 5);
	this.canvas.context.strokeStyle = color;
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
		draw: function(HTML){
			this.canvas.draw(HTML);
		},
		canvasDraw: function(){
			this.canvas.clear();
			this.canvas.context.beginPath();
			var prev = null;
			for(var i = 0; i < this.points.length - 1; i++){
				var next = this.points[i];
				if (prev){
					this.canvas.context.moveTo(prev.X, prev.Y);
					this.canvas.context.lineTo(next.X, next.Y);
				}
				prev = {X: next.X, Y: next.Y};
				next.X--;
			}
			this.canvas.context.stroke();
			return this.canvas.canvasDraw();
		},
		adjustFrames: function(newFrames){
			var spaceToFill = Math.PI * 2 - this.currentX;
			var distancePerFrame = spaceToFill / newFrames;
			helper.debugPrint(this.Xadjust, distancePerFrame);
			this.Xadjust = distancePerFrame;
		}
	});
