var mainScreen;
var otherScreen;
var fps = 60;

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
	mainScreen = new Screen('mainScreen', 9, 1.0);
	otherScreen = new Screen('otherScreen', 8, 0.0);
	//mainScreen.fadingOut(1);
	mainScreen.addSprite(new screenChangeSprite(0, 0, 'blackcircle.png', 'blackcircle', otherScreen));
	otherScreen.addSprite(new screenChangeSprite(0, 0, 'purplecircle.png', 'purplecircle', mainScreen));
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