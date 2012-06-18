var mainScreen;
var otherScreen;
var fps = 60;
var topZIndex = 10;
var bottomZIndex = 9;
var transZIndex = 11; //this zIndex is used to place emerging layers on top

/*
 * This is the importer that actually lets me see what I am writing
 */

onLoad = function(){
	
	/*
	//This covers all the javascript files that need to be added
	var importer = ["<script type='text/javascript' src='klass.min.js'></script>",
					"<script type='text/javascript' src='Screen.js'></script>",
					"<script type='text/javascript' src='Sprite.js'></script>",
					"<script type='text/javascript' src='input.js'></script>"].join();
	
	$('head').append(importer);
	*/
	mainScreen = new Screen('mainScreen', topZIndex);
	otherScreen = new Screen('otherScreen', bottomZIndex);
	//mainScreen.fadingOut(1);
	mainScreen.addSprite(new Sprite(0, 0, 'blackcircle.png', 'blackcircle'));
	otherScreen.addSprite(new Sprite(0, 0, 'purplecircle.png', 'purplecircle'));
	mainScreen.addSprite(new screenChangeSprite(0, 184, 'crate.png', 'goLeft', otherScreen));
	otherScreen.addSprite(new screenChangeSprite(368, 184, 'crate.png', 'goRight', mainScreen));
	mainScreen.draw();
	//mainScreen.fadingIn(1);
	startGame(60);
}

startGame = function() {
	setInterval(RunGame, 1000 / fps);
}

RunGame = function(){
	mainScreen.update();
	otherScreen.update();
	mainScreen.draw();
	otherScreen.draw();
}

debugPrint = function(x, y){
	console.log('(' + x + ',' + y + ')');
}