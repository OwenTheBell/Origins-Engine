/*
 * g holds all global variables. There is no particular need for this object
 * outside of pure legibility in the code.
 */
var g = {
	screenCollection: new Array(),
	fps: 60,
	input: {}, //this copies input contained in inputState for global access
	frameCounter: 0,
	drawDiv: {},
	audioDiv: {},
	playerInput: {},
	id_differ: 0,
	lastFrame: null,
	lastFrameTime: 0,
	evaluationFrame: false,
	jsonObj: {},
	activeScreen: null,
	activeDialogue: null,
	availableScreens: [], //list of screens that can be accessed via ladder
	spriteCache: [],
	getTime: function(){
		var d = new Date();
		return d.getTime();
	}
}

//If there is not a console then make console.log an empty function
try{
	console;
} catch(e) {
	console = {};
	console.log = function(){};
}

$(document).ready(function(){
	//create the div in which to put the output HTML as well as the audio files
	document.getElementById('origins').innerHTML = '<div id="draw"> </div> <div id="audio"> </div>';
	g.drawDiv = document.getElementById("draw");
	g.audioDiv = document.getElementById("audio");
	
	//setup some of the external css for the dialogueScreens
	var rule = helper.addCSSRule('.speech', {
		width: parseInt($('#origins').css('width')) - 20 + 'px',
		height: parseInt($('#origins').css('height')) / 4 + 'px'
	});

	//loop over the JSON file and find all sprites so that they can be preloaded
	$.getJSON('JSON/Mod1.json', function(data){
		$('head').append('<script id="JSONstorage" type="application/json" >' + JSON.stringify(data) + '</script>');
		var preloaderArray = [];
		for(i in data){
			for(j in data[i].sprites){
				preloaderArray.push({id: j, json: data[i].sprites[j]});
			}
		}
		preloader(preloaderArray);
	});
});

continueReady = function(){
	g.jsonObj = $.parseJSON(document.getElementById('JSONstorage').innerHTML);
	
	for(i in g.jsonObj){
		var id = i;
		var json = g.jsonObj[i];
		helper.evalScreen(id, json);
	}
	//remove the JSON after it has been processed so that it does not use up cache
	var storage = document.getElementById('JSONstorage');
	storage.parentNode.removeChild(storage);
	
	//now that all screens have been created there is no more need for this object
	delete g.spriteCache;
	
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
	while(g.drawDiv.firstChild){
		g.drawDiv.removeChild(g.drawDiv.firstChild);
	}
	var HTML = [];
	for(x in g.screenCollection) {
		g.screenCollection[x].draw(HTML);
	}
	g.drawDiv.innerHTML = HTML.join('');
	for (x in g.screenCollection) {
		if(g.screenCollection[x].canvasDraw){
			g.screenCollection[x].canvasDraw();
		}
	}
	
	//calculate and display the current framerate
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
 * Creates all the sprite objects ahead of screen creation
 * This ensures that sprites are only created after their image data has been loaded
 */
preloader = function(sprites){
	g.drawDiv.innerHTML = 'LOADING';
	var img = new Image();
	img.src = sprites[0].json.sprite;
	
	var that = this;
	img.onload = function(){
		var sprite = CreateSprite(sprites[0].id, sprites[0].json);
		g.spriteCache[sprite.id] = sprite;
		if (sprites.length > 1){
			sprites.splice(0, 1);
			preloader(sprites);
		} else {
			continueReady();
		}
	};
}
