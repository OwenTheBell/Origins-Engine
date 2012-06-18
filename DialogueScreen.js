var DialogueScreen = Screen.extend(function(id, zIndex){
	this.dialogueContainer = {}; //not sure I actually need this since I have the firstStatement variable
	//Contain the first statement in a dialogue, this will start of the conversation
	this.firstStatement = null;
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
			
			//need to capture this so that it can be accessed within subfunctions
			var that = this;
			
			$(xml).find("overseer").each(function(){
				//only the raw xml is needed to make a new Overseer object
				var overseer = new Overseer(this);
				//add overseers to overseerContainer sorted by id for easy lookup later
				overseerContainer[overseer.id] = overseer;
				
				//if there is not a first element of the conversation then set it
				if (!that.firstStatement){
					that.firstStatement = overseer;
				}
			});
			
			$(xml).find('player').each(function(){
				var player = new PlayerOptions(this);				
				playerContainer[player.id] = player;
			});
			
			$(xml).find('popup').each(function(){
				var popup = new PopupStatement(this);
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
			 * 	statement: the statement itself
			 * 	id: identify what the statement is in case of error. This is needed 
			 * 		as playerStatements do not have ids so a string needs to be passed
			 * 		to be used instead
			 */
			function linkNext(statement, id){
				if (statement.nextType === 'overseer'){
					var tester = overseerContainer[statement.nextId];
					if (!tester){
						console.log('ERROR: ' + statement.nextId + ' is not a valid overseer id ' + id);
					} else {
						statement.setNext(tester);
					}
				} else if (statement.nextType === 'player'){
					var tester = playerContainer[statement.nextId];
					if (!tester){
						console.log('ERROR: ' + statement.nextId + ' is not a valid player id ' + id);
					} else {
						statement.setNext(tester);
					}
				} else if (statement.nextType === 'popup'){
					var tester = popupContainer[statement.nextId];
					if (!tester){
						console.log('ERROR: ' + statement.nextId + ' is not a valid popup id ' + id);
					} else {
						statement.setNext(tester);
					}
				} else if (statement.nextType === 'exit'){
					statement.setNext('exit'); //this is VERY temporary
				} else {
					console.log("ERROR: " + id + " has an invalid nextType of " + statement.nextType);
				}
			};
		}
	});




/*
 * General parent object that all statements inherit from
 * ARGS:
 * 	nextType: the type of the next statements (overseer/player/popup/arachne/exit)
 * 	nextVariable: info on where to go. The data type changes based on the value of nextType
 * 			overseer: id of an overseerStatement
 * 			player: id of a playerOptions
 * 			popup: id of a popupStatement
 * 			arachne: id of an arachneStatement
 * 			exit: id of a Screen that the chat will exit to
 */
var Statement = klass(function(xmlData){
	this.nextType = $(xmlData).attr('nextType');
	this.nextId = $(xmlData).attr('nextId');
	this.texts = []; //array of text xml elements, not raw strings
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
		//Returns all of this.texts as a formatted string
		//This will probably change so that text is instead drawn individually by the object
		returnText: function(){
			var textArray = [];
			for (x in this.texts){
				var color = $(this.texts[x]).attr('color');
				if(!color){
					textArray.push($(this.texts[x]).text());
				} else {
					textArray.push($(this.texts[x]).text().toUpperCase());
				}
			}
			return textArray.join("");
		},
		update: function(keyValue){
			if (this.nextType === 'overseer'){
				if (keyValue == 13){
					active = this.nextStatement;
					displayed = false;
				}
			} else if (this.nextType === 'player'){
				active = this.nextStatement;
				displayed = false;
			} else if (this.nextType === 'popup'){
				console.log("Next statement is a popup");
				keepGoing = false;
			} else if (this.nextType === 'exit'){
				console.log("THE END!!!!");
				keepGoing = false;
			} else {
				console.log("ERROR: " + this.id + " has an invalid nextType");
				keepGoing = false;
			}
		},
		draw: function(){
			console.log(this.returnText());
		}
	});

var OverseerStatement = Statement.extend(function(xmlData){
	this.id = $(xmlData).attr('id');
	if (!$(xmlData).attr('highlight')){
		this.highlight = $(xmlData).attr('highlight');
	}
	/*
	this.id = id;
	this.highlight = highlight; //this arugment is optional
	*/
});

/*
 * Not a statement but still important. Since all player statements
 * are choice driven we need a class that contains each set of player
 * statements that are available as a reply to anything said to the player.
 * Nonplayer statements will point to a playerOptions that contains
 * reply statements
 */
var PlayerOptions = klass(function(xmlData){
	this.id = $(xmlData).attr('id');
	this.statementArray = [];
	var that = this;
	$(xmlData).find('option').each(function(){
		var statement = new PlayerStatement(this, that.id + "statement");
		that.statementArray.push(statement);
	});
})
	.methods({
		addStatement: function(statement){
			statement.setId(this.id + "Statement");
			this.statementArray.push(statement);
		},
		/*
		 * Currently updated() and draw() are called in reverse order, this
		 * needs to be fixed
		 */
		update: function(keyValue){
			//make array of available answers
			var availableStatements = [];
			for(x in this.statementArray){
				var statement = this.statementArray[x];
				var check = statement.check();
				if (!check || set_check[check]){
					availableStatements.push(statement);
				}
			}
			
			//now that we have an array we can actually check which answers to select
			if (((keyValue - 49) < availableStatements.length) && ((keyValue - 49) >= 0)){
				var next = availableStatements[keyValue - 49];
				if (next.nextType === 'exit'){
					console.log('THE END!!!!');
					keepGoing = false;
				} else if (next.nextType === 'popup'){
					console.log("next up is a popup");
					keepGoing = false;
				} else {
					active = availableStatements[keyValue - 49].nextStatement;
					var set = availableStatements[keyValue - 49].set();
					//if the selected statement has a set variable, set it for later
					if (set){
						set_check[set] = "true";
					}
					displayed = false;
				}
			}
		},
		draw: function(){
			var iter = 1;
			for(x in this.statementArray){
				var statement = this.statementArray[x];
				var check = statement.check();
				//Only display an option if it does not have a check value, or
				//if it's check value is inside set_check
				if (!check || set_check[check]){
					console.log(iter + " " + this.statementArray[x].returnText());
					iter++;
				}
			}
		}
	});

/*
 * A player statement can have both a set and a check value, this just needs
 * to be reflected in the input object
 */
var PlayerStatement = Statement.extend(function(xmlData, id){
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

var PopupStatement = Statement.extend(function(xmlData){
	this.id = $(xmlData).attr('id');
	this.target = $(xmlData).attr('target');
})
	.methods({
		
	});
