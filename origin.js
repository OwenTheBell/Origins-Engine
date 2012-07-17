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
	playerInput: {}
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
	
	//Eventually everything will be read in via XML/JSON so this brute force coded approach won't be needed
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
				'Sprites/Main_View2/View2Background.png',
				'Sprites/Main_View2/Clothing_Cabinet.png',
				'Sprites/Main_View2/Shutter.png',
				'Sprites/Main_View2/Space_Exact.png',
				'Sprites/Main_View2/Window.png',
				'Sprites/ArrowObject.png',
				'Sprites/Cryo_Room/Training_Room_Background.png',
				'Sprites/Cryo_Room/Fog.png',
				'Sprites/Cryo_Room/Robot.png',
				'Sprites/Cryo_Room/Storage_Container.png',
				'Sprites/Cryo_Room/Solar_Panel.png',
				'Sprites/Cryo_Room/Cryo_Console.png',
				'Sprites/Cryo_Room/Ladder.png'
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
	
	var talkScreen = new DialogueScreen('talkScreen', g.bottomZIndex, 'XML/IntroDial.xml');
	helper.ajaxGet(talkScreen);
	mainScreen1.addDialogueScreen(talkScreen);
	g.screenCollection[talkScreen.id] = talkScreen;
	
	var mainScreen2 = new Screen('mainScreen2', g.bottomZIndex);
	g.screenCollection[mainScreen2.id] = mainScreen2;
	
	var cryoScreen = new Screen('cryoScreen', g.bottomZIndex);
	g.screenCollection[cryoScreen.id] = cryoScreen;
	
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
	// mainScreen1.addSprite(new dialogueSprite(699, 0, 'Sprites/Main_View1/Ladder.png', 'Ladder', dialogueScreens['ladder']));
	mainScreen1.addSprite(new screenChangeSprite(699, 0, 'Sprites/Main_View1/Ladder.png', 'Ladder', cryoScreen));
	mainScreen1.addSprite(new dialogueSprite(100, 99, 'Sprites/Main_View1/Food_Pellets.png', 'Food_Pellets', dialogueScreens['food']));
	mainScreen1.addSprite(new dialogueSprite(0, 349, 'Sprites/Main_View1/Drawer.png', 'Drawer', dialogueScreens['bookshelf']));
	mainScreen1.addSprite(new dialogueSprite(350, 250, 'Sprites/Main_View1/Table.png', 'Table', dialogueScreens['table']));
	mainScreen1.addSprite(new dialogueSprite(299, 300, 'Sprites/Main_View1/Chair.png', 'Chair', dialogueScreens['chair']));
	mainScreen1.addSprite(new dialogueSprite(0, 49, 'Sprites/Main_View1/Thermostat.png', 'Thermostat', dialogueScreens['smallmonitor']));
	mainScreen1.addSprite(new screenChangeSprite(0, 647, 'Sprites/ArrowObject.png', 'change', mainScreen2));
	
	dialogueScreens = new Array();
	helper.groupItemAjaxGet(dialogueScreens, 'XML/IntroObjMainRm2.xml');
	for(key in dialogueScreens){
		g.screenCollection[dialogueScreens[key].id] = dialogueScreens[key];
	}
	
	mainScreen2.addSprite(new Sprite(446, 317, 'Sprites/Main_View2/Space_Exact.png', 'space_exact'));
	mainScreen2.addSprite(new moveSprite(450, 100, 'Sprites/Main_View2/Shutter.png', 'shutter', 450, 300, 60));
	mainScreen2.addSprite(new Sprite(0, 0, 'Sprites/Main_View2/View2Background.png', 'background'));
	mainScreen2.addSprite(new dialogueSprite(400, 300, 'Sprites/Main_View2/Window.png', 'window', dialogueScreens['window']));
	mainScreen2.addSprite(new dialogueSprite(849, 199, 'Sprites/Main_View2/Clothing_Cabinet.png', 'clothes', dialogueScreens['clothes']));
	mainScreen2.addSprite(new screenChangeSprite(0, 647, 'Sprites/ArrowObject.png', 'change', mainScreen1));
	
	dialogueScreens = new Array();
	helper.groupItemAjaxGet(dialogueScreens, 'XML/Mod1ObjCryo.xml');
	for(key in dialogueScreens){
		g.screenCollection[dialogueScreens[key].id] = dialogueScreens[key];
	}
	cryoScreen.addSprite(new Sprite(0, 0, 'Sprites/Cryo_Room/Training_Room_Background.png', 'background'));
	cryoScreen.addSprite(new dialogueSprite(313, 513, 'Sprites/Cryo_Room/Robot.png', 'miceCatcher', dialogueScreens['miceCatcher']));
	cryoScreen.addSprite(new dialogueSprite(740, 20, 'Sprites/Cryo_Room/Storage_Container.png', 'storageContainer', dialogueScreens['storageContainer']));
	cryoScreen.addSprite(new dialogueSprite(799, 49, 'Sprites/Cryo_Room/Solar_Panel.png', 'solarPanel', dialogueScreens['solarPanel']));
	cryoScreen.addSprite(new dialogueSprite(180, 340, 'Sprites/Cryo_Room/Cryo_Console.png', 'consoleCryo', dialogueScreens['consoleCryo']));
	// cryoScreen.addSprite(new dialougeSprite(580, 0, 'Sprites/Cryo_Room/Ladder.png', 'ladderCryo', dialougeScreens['ladderCryo']));
	cryoScreen.addSprite(new screenChangeSprite(580, 0, 'Sprites/Cryo_Room/Ladder.png', 'ladderCryo', mainScreen1));
	cryoScreen.addSprite(new Sprite(0, 0, 'Sprites/Cryo_Room/Fog.png', 'fog'));
	
	delete dialogueScreens;
	
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
