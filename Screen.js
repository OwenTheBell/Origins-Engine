var Screen = klass(function(id) {
	this.id = id;
	this.spriteArray = [];
	this.fadeOut = false;
	this.fadeIn = false;
	this.timeIn;
	this.classes = ['interactive'];
	this.dialogue = {
		screens: [],
		active: false,
		position: 0
	}
	
	this.css = {
		'opacity': 0.0
	}
	
	this.transitionFrames = 0;
	this.transitionFramesCount = 0;
})
	.methods({
		addSprite: function(newSprite){
			//if the sprite has the caching attribute then it is meant purely to
			//be cached into memory and not immediately added to the sprite array
			if(!newSprite.caching){
				newSprite.parent = this;
				this.spriteArray[newSprite.id] = newSprite;
			}
		},
		removeSprite: function(id){	
			this.spriteArray[id] = 'removed';
		},
		//returns the sprite with the associated id, if there is no such sprite return null
		getSprite: function(id){
			if (this.spriteArray[id]){
				return this.spriteArray[id];
			}
			return null;
		},
		addDialogue: function(dialogue){
			this.dialogue.screens = dialogue;
			this.dialogue.active = true;
		},
		fadingOut: function(seconds){
			this.fadeOut = true;
			this.transitionFrames = seconds*g.fps;
			//prevent any screen interaction during the transition
			g.activeScreen = null;
		},
		fadingIn: function(seconds){
			this.fadeIn = true;
			this.transitionFrames = seconds*g.fps;
		},
		update: function(){
			//update sprites if screen is visible.
			//Even if the screen is not active animation may be occuring in the background
			if (this.css['opacity'] > 0.0){
				for (x in this.spriteArray){
					this.spriteArray[x].update();
				}
			}
			
			if (this.fadeIn){
				if (this.css['opacity'] >= 1.0){
					this.css['opacity'] = 1.0;
					this.fadeIn = false;
					g.activeScreen = this.id;
				} else {
					this.css['opacity'] += (1 / this.transitionFrames);
				}
				this.drawState = 'updated';
			} else if (this.fadeOut){
				if (this.css['opacity'] <= 0.0){
					this.css['opacity'] = 0.0;
                                        g.prevActive = this.id;
					this.fadeOut = false;
				} else {
					this.css['opacity'] -= (1 / this.transitionFrames);
				}
				
			}
			var mouse = {};
			this.mouseCheck = {};
			this.confirmedSprite = {};
			//Only take input if the screen is not transitioning
			if (g.activeScreen == this.id){
				if (this.css['opacity'] != 1.0) this.css['opacity'] = 1.0;
				//only update if there is not currently a dialogue screen active
				if (!g.activeDialogue){
					if(this.dialogue.active){
						g.screenCollection[this.dialogue.screens[this.dialogue.position]].activate();
						//if there is more dialogue then leave dialogue active and update the position
						if (this.dialogue.screens[this.dialogue.postion+1]){
							this.dialogue.postion++;
						} else {
							this.dialogue.active = false;
						}
					}
					mouse = g.input.mouse;
				
					for (x in this.spriteArray){
						var testSprite = this.spriteArray[x];
						if (testSprite.checkMouse){
							if ((mouse.X > testSprite.left + g.origins.left) && 
								(mouse.X < testSprite.left + testSprite.width + g.origins.left) &&
								(mouse.Y > testSprite.top + g.origins.top) &&
								(mouse.Y < testSprite.top + testSprite.height + g.origins.top)){
								
								this.mouseCheck = testSprite.checkMouse();
								if(this.mouseCheck.click) this.confirmedSprite = testSprite;
							}
						}
					}
				}
			}
			
			if(this.mouseCheck.hover){
				this.css.cursor = 'pointer';
			} else {
				this.css.cursor = 'default';
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
				HTML.push('</div>');
			}
		}
	});
