/*
 * g holds all global variables. There is no particular need for this object
 * outside of pure legibility in the code.
 */
var g = {
	screenCollection: new Array(),
	fps: 60,
	topZIndex: 10,
	bottomZIndex: 9,
	transZIndex: 11, //this zIndex is used to place emerging layers on top
	dialogueZIndex: 12,
	input: {}, //this copies input contained in inputState for global access
	frameCounter: 0,
	drawDiv: 'draw',
	audioDiv: 'audio',
}

//If there is not a console then make console.log an empty function
//Consider a boolean to force console.log to be an empty statement
//This would be useful to speed up production code runtimes
try{
	console;
} catch(e) {
	console = {};
	console.log = function(){};
}

$(document).ready(function(){
	//This entire thing needs to be improved, this is a really brute force way to do things
	preloader('Sprites/Main_View1/Background.png',
				'Sprites/Main_View1/Bed.png',
				'Sprites/Main_View1/Water.png',
				'Sprites/Main_View1/Ladder.png',
				'Sprites/Main_View1/Bike.png',
				'Sprites/Main_View1/Food_Pellets.png',
				'Sprites/Main_View1/Drawer.png',
				'Sprites/Main_View1/Table.png',
				'Sprites/Main_View1/Chair.png',
				'Sprites/Main_View1/Thermostat.png',
				'Sprites/Main_View2/View2BackestBackground.png',
				'Sprites/Main_View2/View2Background.png',
				'Sprites/Main_View2/Clothing_Cabinet.png',
				'Sprites/crate.png'
		);
});

continueReady = function(){
	
	//create the div in which to put the output HTML as well as the audio files
	$('#origins').html('<div id="' + g.drawDiv + '"> </div><div id="' + g.audioDiv + '"> </div>');
	
	//setup some of the external css for the dialogueScreen
	var rule = helper.findCSSRule('.speech');
	rule.style.width = parseInt($('#origins').css('width')) - 20 + 'px';
	rule.style.height = parseInt($('#origins').css('height'))  / 4 + 'px';
	
	/*
	 * Loading scripts this way is ok for production but not for developement
	 * as all files imported this way don't appear in the debugger
	 */
	/*
	var importer = ["<script type='text/javascript' src='klass.min.js'></script>",
					"<script type='text/javascript' src='Screen.js'></script>",
					"<script type='text/javascript' src='Sprite.js'></script>",
					"<script type='text/javascript' src='input.js'></script>",
					"<script type='text/javascript' src='DialogueScreen.js'></script>"].join("\n");
	
	$('head').append(importer);
	*/
	
	var mainScreen1 = new Screen('mainScreen1', g.topZIndex);
	mainScreen1.activeScreen = true;
	g.screenCollection[mainScreen1.id] = mainScreen1;
	9
	var mainScreen2 = new Screen('mainScreen2', g.bottomZIndex);
	g.screenCollection[mainScreen2.id] = mainScreen2;
	
	// var talkScreen = new DialogueScreen('talkScreen', g.bottomZIndex, 'XML/IntroDial.xml');
	// helper.ajaxGet(talkScreen);
	// talkScreen.activate();
	// g.screenCollection[talkScreen.id] = talkScreen;
	
	var dialogueScreens = new Array();
	
	helper.groupItemAjaxGet(dialogueScreens, 'XML/IntroObjMainRm.xml');
	for(key in dialogueScreens){
		g.screenCollection[dialogueScreens[key].id] = dialogueScreens[key];
	}
	
	mainScreen1.addSprite(new Sprite(0, 0, 'Sprites/Main_View1/Background.png', 'background'));
	mainScreen1.addSprite(new dialogueSprite(999, 0, 'Sprites/Main_View1/Bed.png', 'Bed', dialogueScreens['sleeps']));
	mainScreen1.addSprite(new dialogueSprite(199, 100, 'Sprites/Main_View1/Water.png', 'Water', dialogueScreens['water']));
	mainScreen1.addSprite(new dialogueSprite(799, 300, 'Sprites/Main_View1/Bike.png', 'Bike', dialogueScreens['bike']));
	mainScreen1.addSprite(new dialogueSprite(699, 0, 'Sprites/Main_View1/Ladder.png', 'Ladder', dialogueScreens['ladder']));
	mainScreen1.addSprite(new dialogueSprite(99, 99, 'Sprites/Main_View1/Food_Pellets.png', 'Food_Pellets', dialogueScreens['food']))
	mainScreen1.addSprite(new dialogueSprite(0, 349, 'Sprites/Main_View1/Drawer.png', 'Drawer', dialogueScreens['bookshelf']));
	mainScreen1.addSprite(new dialogueSprite(350, 250, 'Sprites/Main_View1/Table.png', 'Table', dialogueScreens['table']));
	mainScreen1.addSprite(new dialogueSprite(299, 300, 'Sprites/Main_View1/Chair.png', 'Chair', dialogueScreens['chair']));
	mainScreen1.addSprite(new dialogueSprite(0, 49, 'Sprites/Main_View1/Thermostat.png', 'Thermostat', dialogueScreens['smallmonitor']));
	mainScreen1.addSprite(new screenChangeSprite(0, 680, 'Sprites/crate.png', 'change', mainScreen2));
	
	dialogueScreens = new Array();
	helper.groupItemAjaxGet(dialogueScreens, 'XML/IntroObjMainRm2.xml');
	for(key in dialogueScreens){
		g.screenCollection[dialogueScreens[key].id] = dialogueScreens[key];
	}
	
	mainScreen2.addSprite(new Sprite(0, 0, 'Sprites/Main_View2/View2BackestBackground.png', 'window_background'));
	mainScreen2.addSprite(new Sprite(0, 0, 'Sprites/Main_View2/View2Background.png', 'background'));
	mainScreen2.addSprite(new dialogueSprite(849, 199, 'Sprites/Main_View2/Clothing_Cabinet.png', 'clothes', dialogueScreens['clothes']));
	mainScreen2.addSprite(new screenChangeSprite(0, 680, 'Sprites/crate.png', 'change', mainScreen1));
	//mainScreen2.addSprite(new dialougeSprite(400, 300, 'Sprites/Main_View2/'))
	
	// console.log(screenCollection);
	
	startGame();
};

startGame = function() {
	setInterval(RunGame, 1000 / g.fps);
}

RunGame = function(){
	g.input.key = inputState.getKey();
	g.input.mouse = inputState.getMouse();
	
	for(x in g.screenCollection) {
		g.screenCollection[x].update();
	}
	var HTML = '';
	for(x in g.screenCollection) {
		HTML += g.screenCollection[x].draw();
	}
	$('#' + g.drawDiv).html(HTML);
	g.frameCounter++;
}

/*
 * Caches all images in memory before moving on with the rest of setting up the game
 */
preloader = function(){
	$('#origins').html('LOADING');
	var img = new Image();
	img.src = arguments[0];
	
	$(img).load(function(){
		if (arguments.length > 1){
			arguments.splice(0, 1);
			preloader(arguments);
		} else {
			continueReady();
		}
	});
}
