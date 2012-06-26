var DialogueScreen = Screen.extend(function(id, zIndex, file){
	//Contains the first statement in a dialogue, this will start off the conversation
	this.activeStatement = null;
	this.nextActiveStatement = null;
	this.originalActive = null; //Track the original active so it can be reset on exit
	this.file = file; //url of the xml file with relevant dialogue
	this.set_check = []; //object to contain the set & check conversation values
	this.keyValue = false;
	//These strings contain the HTML values to reuse when the active Statement isn't relevant
	this.overseerHTML = '';
	this.playerHTML = '';
	this.popupHTML = '';
	
	this.overseerCSS = {
		position: 'inherit',
		top: '5px',
		left: '5px'
	}
	
	this.playerCSS = {
		position: 'inherit',
		top: (parseInt($('#origins').css('height')) - parseInt(helper.findCSSRule('.dialogue').style.height) - 15) + 'px',
		left: '5px'
	}

	this.responseHolders = [];
	for (var i=0; i < this.responseHolders.length; i++) {
		this.responseHolders.push({
			position: 'inherit',
			height: Math.floor(parseInt(helper.findCSSRule('.dialoge').style.height) / 4) + 'px',
			top: parseInt(this.height) * i + 'px',
		});
	};
})

	.methods({
		//XML has to be loaded after initialization so that's what this method is for
		loadXML: function(xml){
			var count = 0;
			/*
			 * Object literals for storing dialogue statements
			 * These are just for setting up structures 
			 */
			var overseerContainer = {};
			var playerContainer = {};
			var popupContainer = {};
			
			// need to capture 'this' so that it can be accessed within subfunctions
			var that = this;
			
			$(xml).find("overseer").each(function(){
				//only the raw xml is needed to make a new Overseer object
				var overseer = new OverseerStatement(that, this);
				//add overseers to overseerContainer sorted by id for easy lookup later
				overseerContainer[overseer.id] = overseer;
				
				//if there is not a first element of the conversation then set it
				if (!that.activeStatement){
					that.activeStatement = overseer;
				}
			});
			
			$(xml).find('player').each(function(){
				var player = new PlayerOptions(that, this);				
				playerContainer[player.id] = player;
			});
			
			$(xml).find('popup').each(function(){
				var popup = new PopupStatement(that, this);
				popupContainer[popup.id] = popup;
			});
			
			/*
			 * Now that all the statements have been parsed from the XML they need to 
			 * be attached together using the linkNext function
			 */
			for (x in overseerContainer){
				var overseer = overseerContainer[x];
				linkNext(overseer, overseer.id);
			}
			
			for (x in playerContainer){
				var player = playerContainer[x];
				for (y in player.statementArray){
					linkNext(player.statementArray[y], player.id + "statement" + y);
				}
			}
			
			for (x in popupContainer){
				var popup = popupContainer[x];
				linkNext(popup, popup.id);
			}
			
			/*
			 * Function for setting a statement's nextStatement
			 * ARGS:
			 *	statement: the statement itself
			 *	id: identify what the statement is in case of error. This is needed 
			 *		as playerStatements do not have ids so a string needs to be passed
			 *		to be used instead
			 */
			function linkNext(statement){
				if (statement.nextType === 'overseer'){
					checkContainer(overseerContainer, 'overseer');
				} else if (statement.nextType === 'player'){
					checkContainer(playerContainer, 'player');
				} else if (statement.nextType === 'popup'){
					checkContainer(popupContainer, 'popup');
				} else if (statement.nextType === 'exit'){
					statement.setNext('exit'); //this is VERY temporary
				} else {
					console.log("ERROR: " + statement.id + " has an invalid nextType of " + statement.nextType);
				}
				
				function checkContainer(container, type){
					var tester = container[statement.nextId];
					if(!tester){
						console.log("ERROR: " + statement.nextId + " is not a valid " + type + " id " + statement.id);
					} else {
						statement.setNext(tester);
					}
				}
			};
		},
		
		activate: function(){
			this.activeScreen = true;
			this.zIndex = dialogueZIndex;
			this.opacity = 1.0;
			this.drawState = 'updated';
			this.originalActive = this.activeStatement;
		},
		
		deActivate: function(){
			this.activeScreen = false;
			this.zIndex = bottomZIndex;
			this.opacity = 0.0;
			this.parent.deActivated();
			this.activeStatement = this.originalActive;
		},
		
		update: function(){
			//this.supr();
			
			if (this.activeScreen && inputState.keypressed){
				this.keyValue = inputState.getKeyPressValue();
			} else {
				this.keyValue = false;
			}
			
			if (this.nextActiveStatement){
				this.activeStatement = this.nextActiveStatement;
				this.nextActiveStatement = null;
			}
			/*
			var mousePos = inputState.mousePos;
			mousePos.X -= parseInt($('#origins').css('left')) + parseInt(this.playerDiv.css('left'));
			mousePos.Y -= parseInt($('#origins').css('top')) + parseInt(this.playerDiv.css('top'));
			if((mousePos.X > 0) && (mousePos.X <= parseInt(this.playerDiv.css('width')))
				&& (mousePos.Y > 0) && (mousePos.Y <= parseInt(this.playerDiv.css('height')))){
				
				for(var i = 0; i < this.playerStatements.length; i++){
					var tempY = mousePos.Y - parseInt(this.playerStatements[i].css('top'));
					if(!this.playerStatements[i]){
						console.log(i);
					}
					if((tempY > 0) && (tempY <= Math.floor(parseInt(this.playerDiv.css('height')) / 4))){
						this.playerStatements[i].css('background-color', '#FF00FF');
					} else {
						this.playerStatements[i].css('background-color', '#FFFFFF');
					}
				}
			}
			*/
			if (this.activeScreen){
				this.activeStatement.update();
			}
		},
		
		draw: function(){
			//So the new drawing approach is just going to be to create the individual
			//divs for overseer and player and then just directly insert the return text
			
			if(this.activeScreen){
				var newOverseerHTML = [];
				var newPlayerHTML = [];
				var newPopupHTML = [];
				
				//Function to handle creating the PlayerDiv
				var that = this;
				function addToPlayer(inputString) {
					var returnString = [];
					returnString.push('<div id:"PlayerDiv" style="');
					for(x in that.playerCSS){
						returnString.push(x + ':' + that.playerCSS[x] + '; ');
					}	
					returnString.push('" class="dialogue" >');
					if (inputString instanceof Array){
						$(inputString).each(function(){
							returnString.push('<div style="');
							for (x in that.responseHolders[0]) {
								returnString.push(x + ':' + that.responseHolders[0][x] + '; ');
							};
							returnString.push('" >' + this.returnText() + '</div>');
						});
						returnString.push('</div>');
					} else {
						returnString.push('<div style="');
						for (x in that.responseHolders[0]) {
							returnString.push(x + ':' + that.responseHolders[0][x] + '; ');
						};
						returnString.push('" >' + inputString + '</div></div>');
					}
					return returnString.join('');
				};
				
				//When the overseerDiv needs to be updated
				if (this.activeStatement instanceof OverseerStatement){ 
					newOverseerHTML.push('<div id="OverseerDIV" style="');
					for(x in this.overseerCSS){
						newOverseerHTML.push(x + ':' + this.overseerCSS[x] + '; ');
					}
					newOverseerHTML.push('" class="dialogue" >');
					newOverseerHTML.push(this.activeStatement.returnText());
					newOverseerHTML.push('</div>');
					this.overseerHTML = newOverseerHTML.join('');
					
					if (this.activeStatement.nextStatement === 'exit'){
						this.playerHTML = addToPlayer('Press Enter to Exit');
					} else if (this.activeStatement.nextStatement === 'popup'){
						this.playerHTML = addToPlayer('There will be a popup here');
					}
				} else if (this.activeStatement instanceof PlayerOptions){
					this.playerHTML = addToPlayer(this.activeStatement.availableStatements);
				}
				
				return (this.overseerHTML + this.playerHTML + this.popupHTML);	
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
	this.texts = []; //array of text xml elements, not raw strings
	this.drawState = 'new';
	
	var that = this;
	$(xmlData).find('text').each(function(){
		that.texts.push(this);
	});
})
	.methods({
		setNext: function(nextStatement){
			this.nextStatement = nextStatement;
			if(nextStatement != 'exit'){
				//console.log(this.nextStatement.id + " attached to " + this.id);
			};
		},
		addText: function(text){
			this.texts.push(text);
		},
		//Returns all of this.texts as a formatted strg
		//This will probably change so that text is instead drawn individually by the object
		returnText: function(){
			var textArray = [];
			for (x in this.texts){
				var color = $(this.texts[x]).attr('color');
				if(!color){
					textArray.push($(this.texts[x]).text());
				} else {
					if (color === 'hex color value'){
						color = '#FF00FF';
					}
					textArray.push("<font color='" + color + "'>" + $(this.texts[x]).text() + "</font>");
				}
			}
			return textArray.join("");
		},
		update: function(){
		}
	});

var OverseerStatement = Statement.extend(function(parent, xmlData){
	this.id = $(xmlData).attr('id');
	if (!$(xmlData).attr('highlight')){
		this.highlight = $(xmlData).attr('highlight');
	}
})
	.methods({
		update: function(){
			if (this.nextType === 'overseer'){
				if (this.parent.keyValue == 13){
					this.parent.nextActiveStatement = this.nextStatement;
				}
			} else if (this.nextType === 'player'){
				this.parent.nextActiveStatement = this.nextStatement;
			} else if (this.nextType === 'popup'){
				console.log('Popup not implemented');
			} else if (this.nextType === 'exit'){
				if (this.parent.keyValue == 13){
					this.parent.deActivate();
				}
			} else {
				this.parent.playerDiv.html("ERROR: " + this.id + " has an invalid nextType");
			}
		}
	});

/*
 * Not a statement but still important. Since all player statements
 * are choice driven we need a class that contains each set of player
 * statements that are available as a reply to anything said to the player.
 * Nonplayer statements will point to a playerOptions that contains
 * reply statements
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
			
			if(this.parent.keyValue){
				var keyValue = this.parent.keyValue;
				//now that we have an array we can actually check which answers to select
				if (((keyValue - 49) < this.availableStatements.length) && ((keyValue - 49) >= 0)){
					var selected = this.availableStatements[keyValue - 49];
					if (selected.nextType === 'exit'){
					} else if (selected.nextType === 'popup'){
					} else {
						this.parent.nextActiveStatement = selected.nextStatement;
						console.log(this.parent.nextActiveStatement.id + " is now active");
						var set = selected.set();
						//if the selected statement has a set variable, set it for later
						if (set){
							this.parent.set_check[set] = true;
							// console.log('setting');
						}
					}
				}
			}
		}
	});

/*
 * A player statement can have both a set and a check value, this just needs
 * to be reflected in the input object
 * NOTE: parent in this case is the DialogueScreen not a PlayerOptions
 */
var PlayerStatement = Statement.extend(function(parent, xmlData, id){
	this.id = id; //id is included as a seperate parameter since there is not id definition in the xml
	this.set_check = {}; //optional, object containing id and whether or not this statement uses set or check
	var that = this;
	if ($(xmlData).attr('set')){
		that.set_check.set = $(xmlData).attr('set');
	}
	if ($(xmlData).attr('check')){
		that.set_check.check = $(xmlData).attr('check');
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
})
	.methods({
		
	});
