var screenCollection = new Array();
var fps = 60;
var topZIndex = 10;
var bottomZIndex = 9;
var transZIndex = 11; //this zIndex is used to place emerging layers on top
var dialogueZIndex = 12;
var inputVariables = {};

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
	preloader('Sprites/Background.png',
				'Sprites/Bed.png',
				'Sprites/Water.png',
				'Sprites/Ladder.png',
				'Sprites/Bike.png',
				'Sprites/Food_Pellets.png',
				'Sprites/Drawer.png',
				'Sprites/Table.png'
			);
	
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
	
	var mainScreen = new Screen('mainScreen', topZIndex);
	// mainScreen.activeScreen = true;
	screenCollection[mainScreen.id] = mainScreen;
	
	var talkScreen = new DialogueScreen('talkScreen', bottomZIndex, 'IntroDial.xml');
	helper.ajaxGet(talkScreen);
	talkScreen.activate();
	screenCollection[talkScreen.id] = talkScreen;
	
	var dialogueScreens = new Array();
	
	helper.altAjaxGet(dialogueScreens, 'IntroObjMainRm.xml');
	// $(dialogueScreens).each(function(){
	// 	screenCollection[this.id] = this;
	// })
	for(key in dialogueScreens){
		screenCollection[dialogueScreens[key].id] = dialogueScreens[key];
	}
	
	mainScreen.addSprite(new Sprite(0, 0, 'Sprites/Background.png', 'background'));
	mainScreen.addSprite(new dialogueSprite(999, 0, 'Sprites/Bed.png', 'sleeps', dialogueScreens['sleeps']));
	mainScreen.addSprite(new dialogueSprite(199, 100, 'Sprites/Water.png', 'water', dialogueScreens['water']));
	mainScreen.addSprite(new dialogueSprite(799, 300, 'Sprites/Bike.png', 'bike', dialogueScreens['bike']));
	mainScreen.addSprite(new dialogueSprite(699, 0, 'Sprites/Ladder.png', 'ladder', dialogueScreens['ladder']));
	mainScreen.addSprite(new dialogueSprite(99, 99, 'Sprites/Food_Pellets.png', 'food', dialogueScreens['food']))
	mainScreen.addSprite(new dialogueSprite(0, 349, 'Sprites/Drawer.png', 'bookshelf', dialogueScreens['bookshelf']));
	mainScreen.addSprite(new dialogueSprite(350, 250, 'Sprites/Table.png', 'table', dialogueScreens['table']));
	mainScreen.addSprite(new dialogueSprite(299, 300, 'Sprites/Chair.png', 'chair', dialogueScreens['chair']));
	mainScreen.addSprite(new dialogueSprite(0, 49, 'Sprites/Thermostat.png', 'smallmonitor', dialogueScreens['smallmonitor']));
	
	console.log(screenCollection);
	
	startGame();
});

startGame = function() {
	setInterval(RunGame, 1000 / fps);
}

RunGame = function(){
	for(x in screenCollection) {
		screenCollection[x].update();
	}
	/*
	 * An array of strings returned by the draw functions of different
	 * objects. After all functions return their draw string the string will be
	 * set as the innerHtml of the origins div
	 */
	var HTML = '';
	for(x in screenCollection) {
		HTML += screenCollection[x].draw();
	}
	$('#origins').html(HTML);
}

//This function should, in theory, be preloading all images by ensuring that
//they are cached in the browser before they are actually used
preloader = function(){
	for (var i = 0; i < arguments.length; i++){
		var img = new Image();
		img.src = arguments[i];
		$(img).load(function(){
			return;
		});
	}
}
