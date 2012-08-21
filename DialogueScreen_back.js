/*
 * While DialogueScreens do have a parent screen they are still contained within
	 * the screen collection and their update is handled from their. This is true of
 * all screens, hence why DialogueScreen update is not handled by its parent
 */

var DialogueScreen = Screen.extend(function(id, file){
	//Contains the first statement in a dialogue, this will start off the conversation
	this.activeStatement = null;
	this.nextActiveStatement = null;
	this.previousActiveStatement = null;
	this.originalActive = null; //Track the original active so it can be reset on exit
	this.file = file; //url of the xml file with relevant dialogue
	this.set_check = []; //object to contain the set & check conversation values
	this.keyValue = false;
	//These strings contain the HTML values to reuse when the active Statement isn't relevant
	this.overseerHTML = '';
	this.playerHTML = '';
	this.popupHTML = '';
	this.statements = []; //array of all statements
	this.classes = ['dialogueWrapper']; //override the standard screen css class and add a different one
	this.activateBlock = false;

	if (!helper.findCSSRule('#OverseerDIV')){
		this.overseerRule = helper.addCSSRule('#OverseerDIV', {
			top: '5px', left: '5px'
		});

		//if overseerDialogue wasn't there it is reasonable to assume that the other
		//cssRules aren't there either and should be created
		this.playerRule = helper.addCSSRule('#PlayerDIV', {
				top: g.origins.height - parseInt(helper.findCSSRule('.speech').style.height) - 15 + 'px',
				left: 5 + 'px', 
		});

		this.popupRule = helper.addCSSRule('#PopupDIV', {
			width: g.origins.width / 5 + 'px',
			height: g.origins.height / 4 + 'px',
			top: (g.origins.height - (g.origins.width / 5)) / 2 + 'px',
			left: (g.origins.width - (g.origins.height / 4)) / 2 + 'px'
		});

		this.responseRule = helper.addCSSRule('.responseDialogue', {
			width: helper.findCSSRule('.speech').style.width,
			height: Math.floor(parseInt(helper.findCSSRule('.speech').style.height) / 4) + 'px'
		});
	} else {
		this.overseerRule = helper.findCSSRule('#OverseerDIV');
		this.playerRule = helper.findCSSRule('#PlayerDIV');
		this.popupRule = helper.findCSSRule('#PopupDIV');
		this.responseRule = helper.findCSSRule('.responseDialogue');
	}

	this.responseHolders = [];
	for(var i = 0; i < 4; i++){
		this.responseHolders[i] = {};
		this.responseHolders[i].top = parseInt(this.responseRule.style.height) * i + 'px';
	}
})

	.methods({
		
		//Pass the file name so it can be outputted on error for easy debugging
		loadXML: function(xml, fileName){
			var count = 0;
			/*
			 * Object literals for storing dialogue statements
			 * These are just for setting up structures 
			 */
			var statements = {};
			var that = this;
			
			$(xml).find("overseer").each(function(){
				var id = $(this).attr('id');
				
				if(!statements[id]){
					var overseer = new OverseerStatement(that, this);
					statements[id] = overseer;
					if(!that.activeStatement){
						that.activeStatement = overseer;
					}
				} else {
					statements[id].addTextBlock(this);
				}
			});
			
			$(xml).find("player").each(function(){
				var player = new PlayerOptions(that, this);
				statements[player.id] = player;
			});
			
			$(xml).find('popup').each(function(){
				var popup = new PopupStatement(that, this);
				statements[popup.id] = popup
			});
			
			for(i in statements){
				var statement = statements[i];
				if (statement instanceof PlayerOptions){
					for (j in statement.statementArray){
						linkNext(statement.statementArray[j]);
					}
				} else {
					linkNext(statement);
				}
			}
			
			this.statements = statements;
			//Function for setting a statement's nextStatement
			function linkNext(statement){
				var next = statement.nextType;
				if (next === 'exit' || next === 'endMod'){
					statement.setNext('exit');
				} else if (next === 'overseer' || next === 'player' || next === 'popup'){
					var tester = statements[statement.nextId];
					if (!tester) {
						console.log("ERROR: " + statement.id + " tried to access the invalid " + next + " id " + statement.nextId + " in the file " + fileName);
					} else {
						statement.setNext(tester);
					}
				} else {
					console.log("ERROR: " + statement.id + " has an invalid nextType of " + statement.nextType + " in the file " + fileName);
				}
			};
		},
		
		activate: function(){
			this.activateBlock = true;
			g.activeDialogue = this.id;
			this.css['opacity'] = 1.0;
			this.drawState = 'updated';
			this.originalActive = this.activeStatement;
		},
		
		deActivate: function(){
			g.activeDialogue = null;
			this.css['opacity'] = 0.0;
			this.activeStatement = this.originalActive;
		},
		
		update: function(){
			
			if (g.activeDialogue == this.id && !this.activateBlock) {
				if (g.input.key.press){
					this.keyValue = g.input.key.value;
				} else {
					this.keyValue = false;
				}
				
				if (this.nextActiveStatement){
					this.previousActiceStatement = this.activeStatement;
					this.activeStatement = this.nextActiveStatement;
					this.nextActiveStatement = null;
				}
				
				var mouse = g.input.mouse;
				mouse.X -= g.origins.left + parseInt(this.playerRule.style.left);
				mouse.Y -= g.origins.top + parseInt(this.playerRule.style.top);
				if((mouse.X > 0) && (mouse.X <= parseInt(helper.findCSSRule('.speech').style.width))
					&& (mouse.Y > 0) && (mouse.Y <= parseInt(helper.findCSSRule('.speech').style.height))){
					
					var target = Math.floor(mouse.Y / parseInt(this.responseRule.style.height));
					
					if (mouse.click) {
						this.activeStatement.clicked = target;
					} else {
						for(var i = 0; i < this.responseHolders.length; i++){
							if(target == i){
								this.responseHolders[i]['background-color'] = '#FFFF88';
							} else {
								this.responseHolders[i]['background-color'] = '#FFFFFF';
							}
						}
					}
				}
				
				this.activeStatement.update();
			}
			this.activateBlock = false;
		},
		
		draw: function(HTML){
			if(this.id == g.activeDialogue){
				this.popupHTML = ''; //Value must be reset as popup should only appear when active
				
				//Function to handle creating the PlayerDiv
				var that = this;
				function addToPlayer(inputString) {
					returnString = ['<div id="PlayerDIV" style="'];
					for(x in that.playerCSS){
						returnString.push(x, ':', that.playerCSS[x], '; ');
					}	
					returnString.push('" class="dialogue speech" >');
					if (inputString instanceof Array){
						var iter = 0; //This should never go greater than 3
						if (iter > 3) console.log('Too many input options');
						$(inputString).each(function(){
							returnString.push('<div style="');
							for (x in that.responseHolders[iter]) {
								returnString.push(x, ':', that.responseHolders[iter][x], '; ');
							};
							returnString.push('" >');
							this.draw(returnString);
							returnString.push('</div>');
							iter++;
						});
						returnString.push('</div>');
					} else {
						returnString.push('<div style="');
						for (x in that.responseHolders[0]) {
							returnString.push(x, ':', that.responseHolders[0][x], '; ');
						};
						returnString.push('" >', inputString, '</div></div>');
					}
					return returnString.join('');
				};
				
				//When the overseerDiv needs to be updated
				if (this.activeStatement instanceof OverseerStatement){
					var newOverseerHTML = ['<div id="OverseerDIV" style="'];
					for(x in this.overseerCSS){
						newOverseerHTML.push(x,':', this.overseerCSS[x], '; ');
					}
					newOverseerHTML.push('" class="dialogue speech" >');
					this.activeStatement.draw(newOverseerHTML)
					newOverseerHTML.push('</div>');
					this.overseerHTML = newOverseerHTML.join('');
					if (this.activeStatement.nextType === 'overseer'){
						this.playerHTML = addToPlayer('Click to continue');
					}
					if (this.activeStatement.nextType === 'exit'){
						this.playerHTML = addToPlayer('Click to Exit');
					} else if (this.activeStatement.nextType === 'popup'){
						this.playerHTML = addToPlayer('Click to continue');
					}
				} else if (this.activeStatement instanceof PlayerOptions){
					this.playerHTML = addToPlayer(this.activeStatement.availableStatements);
				} else if (this.activeStatement instanceof PopupStatement){
					var newPopupHTML = ['<div id="PopupDIV" style="'];
					for (x in this.popupCSS){
						newPopupHTML.push(x, ':', this.popupCSS[x], '; ');
					}
					newPopupHTML.push('" class="dialogue" ><table><tr><td>');
					this.activeStatement.draw(newPopupHTML);
					newPopupHTML.push('</td></tr><tr><td><center>', this.activeStatement.collectedInput);
					newPopupHTML.push('</center></td></tr><tr><td>Press Enter when Done</td></tr></div>');
					this.popupHTML = newPopupHTML.join('');
				}
				HTML.push('<div id =', this.id, 'Dialouge', ' style="');
				for(x in this.css){
					HTML.push(x, ':', this.css[x], '; ');
				}
				HTML.push('" class="');
				for(x in this.classes){
					HTML.push(this.classes[x], ' ');
				}
				HTML.push('">', this.overseerHTML, this.playerHTML, this.popupHTML, '</div>');
			}
		}
	});

/*
 * General parent object that all statements inherit from
 * ARGS:
 *	nextType: the type of the next statements (overseer/player/popup/arachne/exit)
 *	nextVariable: info on where to go. The data type changes based on the value of nextType
 *			overseer: id of an overseerStatement
 *			player: id of a playerOptions
 *			popup: id of a popupStatement
 *			arachne: id of an arachneStatement
 *			exit: id of a Screen that the chat will exit to
 */
var Statement = klass(function(parent, xmlData){
	this.parent = parent;
	this.nextType = $(xmlData).attr('nextType');
	this.nextId = $(xmlData).attr('nextId');
	this.textBlocks = []; //Holder for the different options that can be displayed by this statement
	this.block = 0; //Index for which textBlock to display
	this.drawState = 'new';
	this.clicked = -1;
	
	var that = this;
	var texts = [];
	$(xmlData).find('text').each(function(){
		texts.push(this);
	});
	this.textBlocks.push(texts);
})
	.methods({
		setNext: function(nextStatement){
			this.nextStatement = nextStatement;
		},
		//add text to specified text block, if no block specified then default to the current one
		addText: function(text, block){
			if (!block){
				block = this.block;
			}
			this.textBlocks[block].push(text);
		},
		//add a new textBlock to textBlocks
		addTextBlock: function(xml){
			var texts = [];
			$(xml).find('text').each(function(){
				texts.push(this);
			});
			this.textBlocks.push(texts);
		},
		update: function(){
			if(this.futureBlock){
				this.block = this.futureBlock;
				delete this.futureBlock;
			}
			if (this.block >= this.textBlocks.length){
				if (this.loop){
					this.block = 0;
				} else {
					this.block = this.textBlocks.length - 1;
				}
			}
		},
		//Returns all of this.texts as an html string
		draw: function(HTML){
			function drawHTML(xml){
				$(xml).each(function(){
					var color = $(this).attr('color');
					if (color){
						if(color === 'hex color value') {
							color = '#FFOOFF';
						}
						HTML.push('<font color="', color, '">');
					}
					//Check to see if there is a declared variable instead of plain text
					var variable = $(this).find('variable').text();
					if (variable){
						//Confirm variable exists
						if (g.playerInput[variable]) {
							HTML.push(g.playerInput[variable]);
						} else {
							HTML.push('Variable undeclared');
						}
					} else {
						//otherwise just grab the xml text
						HTML.push($(this).text());
					}
					if(color){
						HTML.push('</font>');
					}
				});
			}
			drawHTML(this.textBlocks[this.block]);
		},
	});

var OverseerStatement = Statement.extend(function(parent, xmlData){
	this.id = $(xmlData).attr('id');
	if ($(xmlData).attr('highlight')){
		this.highlight = $(xmlData).attr('highlight');
	}
	if ($(xmlData).attr('loop')){
		this.loop = true;
	}
})
	.methods({
		update: function(){
			this.supr();
			
			if (this.nextType === 'overseer' || this.nextType === 'popup'){
				if (this.clicked >= 0){
					this.parent.nextActiveStatement = this.nextStatement;
					this.block++;
				}
				this.clicked = -1;
			} else if (this.nextType === 'player'){
				this.parent.nextActiveStatement = this.nextStatement;
			} else if (this.nextType === 'exit'){
				if (this.clicked >= 0){
					this.parent.deActivate();
					//if the screen to exit to is not the current active screen then switch it
					if (this.nextId != g.activeScreen){
						if(g.screenCollection[this.nextId]){
							g.screenCollection[g.activeScreen].fadingOut(1);
							g.screenCollection[this.nextId].fadingIn(1);
						} else {
							console.log(this.nextId + ' is not a screen in the screen collection');
						}
					}
					this.block++;
				}
				this.clicked = -1;
			} else if (this.nextType === 'endMod'){
				this.parent.deActivate();
				g.screenCollection[g.activeScreen].fadingOut(1);
				g.endMod = true;
			} else {
				this.parent.playerDiv.html("ERROR: " + this.id + " has an invalid nextType");
			}
		}
	});

/*
 * This class wraps sets of player statements. Nonplayer statements
 * point to this rather than specific player statements
 */
var PlayerOptions = klass(function(parent, xmlData){
	this.parent = parent;
	this.id = $(xmlData).attr('id');
	this.statementArray = [];
	this.availableStatements = null;
	this.drawState = 'new';
	
	var that = this;
	$(xmlData).find('option').each(function(){
		var statement = new PlayerStatement(that.parent, this, that.id + "Statement" + that.statementArray.length);
		that.statementArray.push(statement);
	});
})
	.methods({
		update: function(){
			//make array of available answers
			if (!this.availableStatements){
				this.availableStatements = [];
				for(x in this.statementArray){
					var statement = this.statementArray[x];
					var check = statement.check();
					if (!check || this.parent.set_check[check]){
						this.availableStatements.push(statement);
					}
				}
			}
			
			if((this.clicked >= 0) && (this.clicked < this.availableStatements.length)){
				
				var selected = this.availableStatements[this.clicked];
				
				if (selected.target){
					//If a target option has been picked then search through all screens for 
					//the sprite with the id of the target and call its trigger method
					for(i in g.screenCollection){
						var sprite = g.screenCollection[i].getSprite(selected.target);
						if(sprite){
							sprite.trigger();
							break;
						}
					}
				}
				if (selected.nextTime){
					this.parent.originalActive = this.parent.statements[selected.nextTime];
				}
				
				if (selected.nextType === 'exit'){
					this.parent.deActivate();
					//if the screen to exit to is not the current active screen then switch it
					if (selected.nextId != g.activeScreen){
						if(g.screenCollection[selected.nextId]){
							g.screenCollection[g.activeScreen].fadingOut(1);
							g.screenCollection[selected.nextId].fadingIn(1);
						} else {
							console.log(selected.nextId + ' is not a screen in the screen collection');
						}
					}
				} else if (selected.nextType === 'popup'){
					this.parent.nextActiveStatement = selected.nextStatement;
				} else if (selected.nextType === 'endMod'){
					this.parent.deActivate();
					g.screenCollection[g.activeScreen].fadingOut(1);
					g.endMod = true;
				} else {
					this.parent.nextActiveStatement = selected.nextStatement;
					var set = selected.set();
					//if the selected statement has a set variable, set it for later
					if (set){
						this.parent.set_check[set] = true;
					}
				}
				
				this.clicked = -1;
			}
		}
	});

/*
 * NOTE: parent is a DialogueScreen not a PlayerOptions object
 */
var PlayerStatement = Statement.extend(function(parent, xmlData, id){
	this.id = id; //id is included as a seperate parameter since there is not id definition in the xml
	this.set_check = {}; //optional, object containing id and whether or not this statement uses set or check
	this.target = null;
	var that = this;
	if ($(xmlData).attr('set')){
		that.set_check.set = $(xmlData).attr('set');
	}
	if ($(xmlData).attr('check')){
		that.set_check.check = $(xmlData).attr('check');
	}
	if ($(xmlData).attr('target')){
		that.target = $(xmlData).attr('target');
	}
	if ($(xmlData).attr('nextTime')){
		that.nextTime = $(xmlData).attr('nextTime');
	}
})
	.methods({
		set: function(){
			return this.set_check.set;
		},
		check: function(){
			return this.set_check.check;
		}
	});

var PopupStatement = Statement.extend(function(parent, xmlData){
	this.id = $(xmlData).attr('id');
	this.target = $(xmlData).attr('target');
	this.collectedInput = '';
})
	.methods({
		update: function(){
			if (this.parent.keyValue){
				var keyValue = this.parent.keyValue;
				if (keyValue == 13){
					g.playerInput[this.target] = this.collectedInput;
					this.parent.nextActiveStatement = this.nextStatement;
				}//Only accept lower or uppercase letters
				else if (((keyValue >= 65) && (keyValue <= 90)) || ((keyValue >= 97) && (keyValue <= 122))){
					this.collectedInput += String.fromCharCode(keyValue);
				} else if (keyValue == 8){
					this.collectedInput = this.collectedInput.slice(0, this.collectedInput.length - 1);
				}
			}
		}
	});