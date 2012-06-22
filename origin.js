var screenCollection = [];
var fps = 60;
var topZIndex = 10;
var bottomZIndex = 9;
var transZIndex = 11; //this zIndex is used to place emerging layers on top
var dialogueZIndex = 12;

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
	var rule = helper.findCSSRule('.dialogue');
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
	mainScreen.activeScreen = true;
	
	var talkScreen = new DialogueScreen('talkScreen', bottomZIndex, 'IntroDial.xml');
	helper.ajaxGet(talkScreen);
	
	//var otherScreen = new Screen('otherScreen', bottomZIndex);
	mainScreen.addSprite(new Sprite(0, 0, 'Sprites/Background.png', 'background', talkScreen));
	mainScreen.addSprite(new dialogueSprite(999, 0, 'Sprites/Bed.png', 'sleeps', talkScreen));
	mainScreen.addSprite(new dialogueSprite(199, 100, 'Sprites/Water.png', 'water', talkScreen));
	mainScreen.addSprite(new dialogueSprite(799, 300, 'Sprites/Bike.png', 'bike', talkScreen));
	mainScreen.addSprite(new dialogueSprite(699, 0, 'Sprites/Ladder.png', 'ladder', talkScreen));
	mainScreen.addSprite(new dialogueSprite(99, 99, 'Sprites/Food_Pellets.png', 'food', talkScreen))
	mainScreen.addSprite(new dialogueSprite(0, 349, 'Sprites/Drawer.png', 'bookshelf', talkScreen));
	mainScreen.addSprite(new dialogueSprite(350, 250, 'Sprites/Table.png', 'table', talkScreen));
	
	
	//screenCollection.push(mainScreen, otherScreen, talkScreen);
	screenCollection.push(mainScreen, talkScreen);
	startGame(60);
});

startGame = function() {
	setInterval(RunGame, 1000 / fps);
}

RunGame = function(){
	$(screenCollection).each(function(){
		this.update();
	});
	$(screenCollection).each(function(){
		this.draw();
	});
}

//This function should, in theory, be preloading all images by ensuring that
//they are cached in the browser
preloader = function(){
	for (var i = 0; i < arguments.length; i++){
		var img = new Image();
		img.src = arguments[i];
		$(img).load(function(){
			return;
		});
	}
}
