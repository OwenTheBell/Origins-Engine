var Screen = klass(function(id, zIndex) {
	this.id = id;
	this.spriteArray = [];
	this.fadeOut = false;
	this.fadeIn = false;
	this.timeIn;
	this.drawState = 'new'; // new/updated/removed/unchanged
	this.activeScreen = false;
	this.classes = [];
	this.dialogue = {
		screens: [],
		active: false,
		position: 0
	}
	this.parent = null;
	
	this.css = {
		'opacity': 0.0,
		'z-index': zIndex,
	}
	
	//set opacity based on whether or not this screen is on the top zIndex
	if (this.css['z-index'] == g.topZIndex) {
		this.css['opacity'] = 1.0;
	}
	
	this.transitionFrames = 0;
	this.transitionFramesCount = 0;
})
	.methods({
		addSprite: function(newSprite){
			newSprite.parent = this;
			this.spriteArray[newSprite.id] = newSprite;
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
			console.log(this.dialogue.screens);
		},
		fadingOut: function(seconds){
			this.fadeOut = true;
			this.transitionFrames = seconds*g.fps;
			this.transitionFramesCount = 0;
			g.activeScreen = null;
		},
		//seconds: the number of seconds for the transition
		fadingIn: function(seconds){
			this.fadeIn = true;
			this.transitionFrames = seconds*g.fps;
			this.css['z-index'] = g.transZIndex;
			this.drawState = 'updated';
		},
		update: function(){
			//Check if any sprites have been clicked
			if (this.fadeIn){
				if (this.css['opacity'] >= 1.0){
					this.css['opacity'] = 1.0;
					this.fadeIn = false;
					this.css['z-index'] = g.topZIndex;
					g.activeScreen = this.id;
				} else {
					this.css['opacity'] += (1 / this.transitionFrames);
				}
				this.drawState = 'updated';
			} else if (this.fadeOut){
				if (this.css['opacity'] <= 0.0){
					this.css['opacity'] = 0.0;
					this.fadeOut = false;
					this.css['z-index'] = g.bottomZIndex;
				} else {
					this.css['opacity'] -= (1 / this.transitionFrames);
				}
				
				this.drawState = 'updated';
			}
			var mouse = {};
			var mouseOverCheck = false;
			//Only take input if the screen is not transitioning
			if (g.activeScreen == this.id){
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
						if (testSprite instanceof clickSprite){
							if ((mouse.X > testSprite.left + parseInt($('#origins').css('left'))) && 
								(mouse.X < testSprite.left + testSprite.width() + parseInt($('#origins').css('left'))) &&
								(mouse.Y > testSprite.top + parseInt($('#origins').css('top'))) &&
								(mouse.Y < testSprite.top + testSprite.height() + parseInt($('#origins').css('top')))){
								
								mouseOverCheck = testSprite.checkMouse();
							}
						}
					}
				}
			}
			
			if(mouseOverCheck){
				this.css.cursor = 'pointer';
			} else {
				this.css.cursor = 'default';
			}
			
			//update sprites if screen is visible.
			//Even if the screen is not active animation may be occuring in the background
			if (this.css['opacity'] > 0.0){
				for (x in this.spriteArray){
					this.spriteArray[x].update();
				}
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
				HTML += '</div>';
			}
			return(HTML);
		}
	});
