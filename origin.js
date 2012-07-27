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
	jsonObj: {},
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

$(document).ready(function(){
	
	//read in the json file and send all images to the preloader
	$.getJSON('JSON/Intro.json', function(data){
		$('#JSONstorage').html(data);
		$('head').append('<script id="JSONstorage" type="application/json" >' + JSON.stringify(data) + '</script>');
		var preloaderArray = [];
		for(i in data){
			for(j in data[i].sprites){
				preloaderArray.push(data[i].sprites[j].sprite);
			}
		}
		preloader(preloaderArray);
	});
});

continueReady = function(){
	g.jsonObj = $.parseJSON($('#JSONstorage').html());
	
	for(i in g.jsonObj){
		var id = i;
		var json = g.jsonObj[i];
		helper.evalScreen(id, json);
	}
	
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
preloader = function(arguments){
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
