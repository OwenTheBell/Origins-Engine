var Sprite = klass(function (id, left, top, image, zIndex) {
	this.parent;
	this.top = top; //y
	this.left = left; //x
	this.image = new Image();
	this.image.src = image;
	this.id = id;
	this.drawState = 'new';
	// this.cssClasses = []; //store names of any applied css classes
	this.rule = helper.addCSSRule('#' + this.id, {
		'background-image': "url('" + this.image.src + "')",
		width: this.image.width + 'px',
 		height: this.image.height + 'px',
		'z-index': zIndex
	});
	
	this.css = {
		top: this.top + 'px',
		left: this.left + 'px'
	}
})
	.methods({
		changeTop: function(top){
			this.top = top;
			this.css.top = this.top + 'px';
		},
		changeLeft: function(left){
			this.left = left;
			this.css.left = this.left + 'px';
		},
		//these two functions just provide a little shorthand
		width: function(){
			return this.image.width;
		},
		height: function(){
			return this.image.height;
		},
		update: function(){
		},
		draw: function(){
			var HTML = '';
			HTML += '<div id="' + this.id +'" style="';
			for(x in this.css){
				HTML += x + ':' + this.css[x] + '; ';
			}
			HTML += '"></div>';
			return(HTML);
		}
	});

var clickSprite = Sprite.extend(function(id, left, top, image, zIndex){
	this.mouseLoc = null;
	this.clicked = false;
	this.mouseOver = false; //detect mouse position over sprite

	this.clickMap = [];
	//Build the clickMap
	var canvas = document.createElement('canvas');
	canvas.width = this.width();
	canvas.height = this.height();
	var ctx = canvas.getContext('2d');
	ctx.drawImage(this.image, 0, 0);
	var pixels = [];
	try {
		pixels = ctx.getImageData(0, 0, this.width(), this.height()).data;
	} catch (e) {
		console.log('ERROR: ' + this.id + ' failed to load image');
	}
	var col = 0, row = 0;
	
	for (var i = 0; i < pixels.length; i += 4){
		row = Math.floor((i / 4) / this.width());
		col = (i/4)	- (row * this.width());
		if(!this.clickMap[col]) this.clickMap[col] = [];
		this.clickMap[col][row] = pixels[i+3] == 0 ? 0 : 1;
	}
	delete canvas, ctx, pixels;
})
	.methods({
		update: function(){
			if (this.parent.id == g.activeScreen){
				if (this.clicked){
					this.onClick();
					this.clicked = false ;
				}
			}
		},
		checkMouse: function(){
			var mouse = g.input.mouse;
			//Translate the mouse position so that it is relative to the sprite
			var x = mouse.X - this.left - parseInt($('#origins').css('left'));
			var y = mouse.Y - this.top - parseInt($('#origins').css('top'));
			
			try {
				if (this.clickMap[x][y] == 1){
					if(mouse.click){
						this.clicked = true;
					}
					//Return true if the mouse is at least over clickable area
					return true;
				}
			} catch(e) {
				console.log('ERROR: ' + x + ' doesn\'t appear to be in clickMap');
			}
			return false;
		},
		onClick: function(){
		},
	});

var screenChangeSprite = clickSprite.extend(function(id, left, top, image, zIndex, targetScreen){
	this.targetScreen = targetScreen;
})
	.methods({
		onClick: function(){
			g.screenCollection[g.activeScreen].fadingOut(1);
			g.screenCollection[this.targetScreen].fadingIn(1);
		}
	});
	
var dialogueSprite = clickSprite.extend(function(id, left, top, image, zIndex, dialogue){
	this.dialogue = dialogue; //this is the id of a dialogue screen
})
	.methods({
		onClick: function(){
			g.screenCollection[this.dialogue].activate();
		},
	});
/*
 * Sprite with the trigger method which causes some kind of action when called
 */
var triggerSprite = Sprite.extend(function(id, left, top, image, zIndex){
})
	.methods({
		trigger: function(){
		}
	});

var moveSprite = triggerSprite.extend(function(id, left, top, image, zIndex, x2, y2, frames){
	this.start = {X: left, Y: top}; //sprite starts at it's top and left coordinates
	this.moveTo = {X: x2, Y: y2}; //coordinates that the sprite will move to
	this.frames = frames;
	this.moveCount = 0;
	this.xMove;
	this.yMove;
	this.moving = false;
})
	.methods({
		trigger: function(){
			console.log(this.id + ' has been triggered');
			this.moving = true;
			this.moveCount = 0;
			this.yMove = (this.moveTo.Y - this.top) / this.frames;
			this.xMove = (this.moveTo.X - this.left) / this.frames;
		},
		update: function(){
			if (this.moving){
				if (this.moveCount < this.frames){
					this.changeTop(this.top + this.yMove);
					this.changeLeft(this.left + this.xMove);
					this.moveCount++;
				} else {
					var temp = {X: this.moveTo.X, Y: this.moveTo.Y};
					this.moveTo = this.start;
					this.start = temp;
					this.moving = false;
					this.changeLeft(this.start.X);
					this.changeTop(this.start.Y);
					console.log(this.id + ' has stopped moving at ' + this.css.top);
				}
			}
		}
	});
