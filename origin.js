/*
 * g holds all global variables. There is no particular need for this object
 * outside of pure legibility in the code.
 */
var g = {
	screenCollection: new Array(),
	fps: 30,
	topZIndex: 10,
	bottomZIndex: 9,
	transZIndex: 11, //this zIndex is used to place emerging layers on top
	dialogueZIndex: 12,
	input: {}, //this copies input contained in inputState for global access
	frameCounter: 0,
	drawDiv: 'draw',
	audioDiv: 'audio',
	playerInput: {},
	id_differ: 0,
	lastFrame: null,
	lastFrameTime: 0,
	evaluationFrame: false,
	getTime: function(){
		var d = new Date();
		return d.getTime();
	}
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

//Create a browser independent requestAnimationFrame wrapper
window.requestAnimFrame = (function(){
		return 	window.requestAnimationFrame 		||
				window.webkitRequestAnimationFrame	||
				window.mozRequestAnimationFrame		||
				window.oRequestAnimationFrame		||
				window.msRequestAnimationFrame;
})();

$(document).ready(function(){
	
	//Eventually everything will be read in via XML/JSON so this brute force coded approach won't be needed
	// preloader(
		// 'Sprites/Main_View1/Background.png',
		// 'Sprites/Main_View1/Bed.png',
		// 'Sprites/Main_View1/Water.png',
		// 'Sprites/Main_View1/Ladder.png',
		// 'Sprites/Main_View1/Bike.png',
		// 'Sprites/Main_View1/Food_Pellets.png',
		// 'Sprites/Main_View1/Drawer.png',
		// 'Sprites/Main_View1/Table.png',
		// 'Sprites/Main_View1/Chair.png',
		// 'Sprites/Main_View1/Thermostat.png',
		// 'Sprites/Main_View2/View2Background.png',
		// 'Sprites/Main_View2/Clothing_Cabinet.png',
		// 'Sprites/Main_View2/Shutter.png',
		// 'Sprites/Main_View2/Space_Exact.png',
		// 'Sprites/Main_View2/Window.png',
		// 'Sprites/ArrowObject.png',
		// 'Sprites/Cryo_Room/Training_Room_Background.png',
		// 'Sprites/Cryo_Room/Fog.png',
		// 'Sprites/Cryo_Room/Robot.png',
		// 'Sprites/Cryo_Room/Storage_Container.png',
		// 'Sprites/Cryo_Room/Solar_Panel.png',
		// 'Sprites/Cryo_Room/Cryo_Console.png',
		// 'Sprites/Cryo_Room/Ladder.png',
		// 'Sprites/Doppler_Screen/Objective_Screen.png',
		// 'Sprites/Doppler_Screen/Detected_Screen.png',
		// 'Sprites/Doppler_Screen/Emitted_Screen.png',
		// 'Sprites/Doppler_Screen/Objective_Screen.png',
		// 'Sprites/Doppler_Screen/Mouse_Counter.png',
		// 'Sprites/Doppler_Screen/HelpButton_Static.png',
		// 'Sprites/Doppler_Screen/UIFill.png',
		// 'Sprites/Doppler_Screen/Start_Button.png',
		// 'Sprites/Doppler_Screen/Pause_Button.png',
		// 'Sprites/Doppler_Screen/Arrow_Up.png',
		// 'Sprites/Doppler_Screen/Arrow_Down.png',
		// 'Sprites/Doppler_Screen/Game_Background.png'
	// );
	continueReady();
});

continueReady = function(){

	//create the div in which to put the output HTML as well as the audio files
	$('#origins').html('<div id="' + g.drawDiv + '"> </div><div id="' + g.audioDiv + '"> </div>');
	
	//setup some of the external css for the dialogueScreens
	var rule = helper.addCSSRule('.speech', {
		width: parseInt($('#origins').css('width')) - 20 + 'px',
		height: parseInt($('#origins').css('height')) / 4 + 'px'
	});
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
	
	CreateMainScreen1('mainScreen1', true, g.topZIndex)
	CreateDialogueScreen('mainScreen1Intro', 'mainScreen1', 'XML/IntroDial.xml');
	CreateMainScreen2('mainScreen2', false, g.bottomZIndex);
	CreateCryoScreen('cryoScreen', false, g.bottomZIndex);
	//CreateDopplerScreen('dopplerScreen', true, g.topZIndex);
	
	startGame();
};

startGame = function() {
	RunGame();
	setInterval(RunGame, 1000 / g.fps);
}

RunGame = function(){
	g.input.key = inputState.getKey();
	g.input.mouse = inputState.getMouse();
	
	for(x in g.screenCollection) {
		g.screenCollection[x].update();
	}

	//Empty the drawDiv to remove all pointers to DOM elements, preventing memory leaks
	$('#' + g.drawDiv).empty();
	var HTML = '';
	for(x in g.screenCollection) {
		HTML += g.screenCollection[x].draw();
	}
	$('#' + g.drawDiv).html(HTML);
	for (x in g.screenCollection) {
		if(g.screenCollection[x].canvasDraw){
			g.screenCollection[x].canvasDraw();
		}
	}

	if (g.frameCounter >= g.lastFrame + g.fps){
		g.evaluationFrame = true;
		var newTime = g.getTime();
		$('#framerate').html(newTime - g.lastFrameTime);
		g.lastFrameTime = newTime;
		g.lastFrame = g.frameCounter;
	} else if (g.evaluationFrame){
		g.evaluationFrame = false;
	}
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
