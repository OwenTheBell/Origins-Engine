var Screen = klass(function(id, zIndex) {
	this.id = id
	this.spriteArray = [];
	this.fadeOut = false;
	this.fadeIn = false;
	this.timeIn;
	this.drawState = 'new'; // new/updated/removed/unchanged
	this.activeScreen = false;
	this.classes = [];
	this.dialogue = {
		screen: {},
		active: false
	}
	this.parent = null;
	
	this.css = {
		'opacity': 0.0,
		'z-index': zIndex,
	}
	
	this.classes.push('.viewScreen');

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
			
		/*
		 * This method runs into the issue that the sprite has to be removed from
		 * the DOM. This means that some tracker needs to be put in place that will
		 * know that the sprite needs to be removed at draw.
		 * One answer might be to allow the sprite to persist until draw(). At that
		 * point the sprite removes itself from the DOM and from the screen.
		 * Alternatively the sprite could handle removal from the DOM and then the
		 * screen could remove the sprite after completing the draw methods or at
		 * the beginning of the next update.
		 */
		removeSprite: function(id){	
			this.spriteArray[id] = 'removed';
		},
		getSprite: function(id){
			return this.spriteArray[id];
		},
		addDialogueScreen: function(dialogue){
			this.dialogue.screen = dialogue;
			this.dialogue.active = true;
			this.dialogue.screen.parent = this;
			// console.log(this.dialogue.screen.id + ' added to ' + this.id);
		},
		fadingOut: function(seconds){
			this.fadeOut = true;
			this.transitionFrames = seconds*g.fps;
			this.transitionFramesCount = 0;
			console.log(this.id + ' moving to background');
			this.activeScreen = false;
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
					this.fadeOut = false;
					this.css['z-index'] = g.topZIndex;
					this.activeScreen = true;
				} else {
					this.css['opacity'] += (1 / this.transitionFrames);
				}
				this.drawState = 'updated';
			} else if (this.fadeOut){
				if (this.css['opacity'] <= 0.0){
					this.css['opacity'] = 0.0;
					this.fadeOut = false;
					this.fadeIn = false;
					this.css['z-index'] = g.bottomZIndex;
					this.activeScreen = false;
				} else {
					this.css['opacity'] -= (1 / this.transitionFrames);
				}
				
				this.drawState = 'updated';
			}
			
			var mouse = {};
			var mouseOverCheck = false;
			//Only take input if the screen is not transitioning
			if (this.activeScreen){
				if (this.dialogue.active){
					this.activeScreen = false;
					this.dialogue.active = false;
					this.dialogue.screen.activate();
				} else {
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
