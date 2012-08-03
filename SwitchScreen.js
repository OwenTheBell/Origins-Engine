/*
 * This screen, although not actually a dialogue sprite, gets
 * treated as one by the dialogue that activates it
 */
var SwitchScreen = Screen.extend(function(id){
	this.screenArray = g.availableScreens;
	this.classes = ['dialogue'];
	var centerX = parseInt($('#origins').width()) / 2;
	var centerY = parseInt($('#origins').height()) / 2;
	this.width = 300; //arbitrary size here
	this.height = this.screenArray.length * 50; //provide 50px per entry
	this.top = centerY - (this.height / 2);
	this.left = centerX - (this.width / 2);
	this.css = {
		top: this.top + 'px',
		left: this.left + 'px',
		opacity: 0.0,
		width: this.width + 'px',
		height: this.height + 'px'
	};
	this.selectedOption = -1;
	this.activateBlock = false;
})
	.methods({
		update: function(){
			//need to do mouse detection here
			if(g.activeDialogue == this.id && !this.activateBlock){
				var mouse = g.input.mouse;
				mouse.X -= $('#origins').position().left + this.left;
				mouse.Y -= $('#origins').position().top + this.top;
				if((mouse.X > 0) && (mouse.X <= this.width)
					&& (mouse.Y > 0) && (mouse.Y <= this.height)){
					
					this.selectedOption = Math.floor(mouse.Y / 50);
					
					if (mouse.click) {
						var target = this.screenArray[this.selectedOption];
						this.deActivate();
						//if the screen to exit to is not the current active screen then switch it
						if (target != g.activeScreen){
							if(g.screenCollection[target]){
								g.screenCollection[g.activeScreen].fadingOut(1);
								g.screenCollection[target].fadingIn(1);
							} else {
								console.log(target + ' is not a screen in the screen collection');
							}
						}
					}
				} else {
					this.selectedOption = -1;
				}
			}
			this.activateBlock = false;
		},
		
		activate: function(){
			this.activateBlock = true;
			g.activeDialogue = this.id;
			this.css['opacity'] = 1.0;
		},
		
		deActivate: function(){
			g.activeDialogue = null;
			this.css['opacity'] = 0.0;
		},
		
		draw: function(HTML){
			if(g.activeDialogue == this.id){
				HTML.push('<div id="', this.id, '" class="dialogueWrapper"> <div style="');
				for(i in this.css){
					HTML.push(i, ': ', this.css[i], '; ');
				}
				HTML.push('" class="');
				for(i in this.classes){
					HTML.push(this.classes[i], ' ');
				}
				HTML.push('" > ');
				for(i in this.screenArray){
					HTML.push('<div style="top:', i*50, 'px; left: 5px; ');
					if (i == this.selectedOption) {
						HTML.push('background-color: #FFFF88;');
					}
					HTML.push('"> ', this.screenArray[i], ' </div>');
				}
				HTML.push('</div> </div>');
			}
		}
	});
