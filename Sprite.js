var Sprite = klass(function (id, left, top, image, zIndex) {
	this.parent;
	this.top = top; //y
	this.left = left; //x
	this.image = new Image();
	this.image.src = image;
	this.id = id;
	this.width = this.image.width;
	this.height = this.image.height;
	this.zIndex = zIndex;
	
	this.css = {
		top: this.top + 'px',
		left: this.left + 'px',
	}
	
	this.rule = null;
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
		update: function(){
			if (!this.rule){
				this.createCSSRule();
			}
		},
		draw: function(HTML){
			HTML.push('<div id="', this.id, '" style="');
			for(x in this.css){
				HTML.push(x, ': ', this.css[x], '; ');
			}
			HTML.push('"> </div>');
		},
		createCSSRule: function(){
			this.rule = helper.addCSSRule('#' + this.id, {
				'background-image': "url('" + this.image.src + "')",
				width: this.image.width + 'px',
				height: this.image.height + 'px',
				'z-index': this.zIndex
			});
		}
	});

var clickSprite = Sprite.extend(function(id, left, top, image, zIndex){
	this.mouseLoc = null;
	this.mouseClicked = false;
	this.mouseDown = false;
	this.mouseOver = false; //detect mouse position over sprite
	this.clickMap = null;
})
	.methods({
		update: function(){
			this.supr();
			if (!this.clickMap){
				this.createClickMap();
			}
			if (this.parent.id == g.activeScreen){
				if (this.mouseClicked){
					this.onClick();
					this.mouseClicked = false;
				} else if (this.mouseDown && !g.input.mouse.down){
					this.mouseDown = false;
					this.offClick();
				}
			}
		},
		checkMouse: function(){
			var mouse = g.input.mouse;
			//Translate the mouse position so that it is relative to the sprite
			var x = mouse.X - this.left - g.origins.left;
			var y = mouse.Y - this.top - g.origins.top;
			
			try {
				if (this.clickMap[x][y] == 1){
					if(mouse.click){
						this.mouseClicked = true;
						this.mouseDown = true;
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
		offClick: function(){
		},
		/*
		 * Click map requires a seperate create function as some sprites require that
		 * certain parameters be changed before the clickMap is created
		 */
		createClickMap: function(){
			this.clickMap = [];
			var canvas = document.createElement('canvas');
			canvas.width = this.width;
			canvas.height = this.height;
			var ctx = canvas.getContext('2d');
			ctx.drawImage(this.image, 0, 0);
			var pixels = [];
			try {
				pixels = ctx.getImageData(0, 0, this.width, this.height).data;
			} catch (e) {
				console.log('ERROR: ' + this.id + ' failed to load image');
			} 
			var col = 0, row = 0;
			
			for (var i = 0; i < pixels.length; i += 4){
				row = Math.floor((i / 4) / this.width);
				col = (i/4)	- (row * this.width);
				if(!this.clickMap[col]) this.clickMap[col] = [];
				this.clickMap[col][row] = pixels[i+3] == 0 ? 0 : 1;
			}
				
		}
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
			try {
				g.screenCollection[this.dialogue].activate();
			} catch(e){
				console.log('could not find the dialogue %s', this.dialogue);
			}
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

var moveSprite = triggerSprite.extend(function(id, left, top, image, zIndex, x2, y2, seconds){
	this.start = {X: left, Y: top}; //sprite starts at it's top and left coordinates
	this.moveTo = {X: x2, Y: y2}; //coordinates that the sprite will move to
	this.frames = seconds * g.fps;
	this.moveCount = 0;
	this.xMove;
	this.yMove;
	this.moving = false;
})
	.methods({
		trigger: function(){
			this.moving = true;
			this.moveCount = 0;
			this.yMove = (this.moveTo.Y - this.top) / this.frames;
			this.xMove = (this.moveTo.X - this.left) / this.frames;
		},
		update: function(){
			this.supr();
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
				}
			}
		}
	});

var toggleSprite = clickSprite.extend(function(id, left, top, image, zIndex, width){
	this.width = width;
	this.css['background-postion'] = '0px 0px';
})
	.methods({
		createCSSRule: function(){
			this.rule = helper.addCSSRule('#' + this.id, {
				'background-image': "url('" + this.image.src + "')",
				overflow: 'hidden',
				width: this.width + 'px',
				height: this.height + 'px',
				'z-index': this.zIndex
			});
		},
		onClick: function(){
			this.css['background-position'] = this.width + 'px 0px';
		},
		offClick: function(){
			this.css['background-position'] = '0px 0px';
		}
	});
