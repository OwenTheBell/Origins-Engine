var mainScreen;
var otherScreen;
var fps = 60;
var topZIndex = 10;
var bottomZIndex = 9;
var transZIndex = 11; //this zIndex is used to place emerging layers on top

//If there is not a console then make console.log an empty function
try{
	console
} catch(e) {
	console = {};
	console.log = function(){};
}

onLoad = function(){
	
	/*
	 * Pull in the different javascript files
	 * This is done here so that the people developing the external website
	 * don't have to worry about importing all necessary javascript. All that
	 * needs to be present is "origin.js" and jquery
	 */
	var importer = ["<script type='text/javascript' src='klass.min.js'></script>",
					"<script type='text/javascript' src='Screen.js'></script>",
					"<script type='text/javascript' src='Sprite.js'></script>",
					"<script type='text/javascript' src='input.js'></script>",
					"<script type='text/javascript' src='DialogueScreen.js'></script>"].join("\n");
	
	$('head').append(importer);
	
	mainScreen = new Screen('mainScreen', topZIndex);
	otherScreen = new Screen('otherScreen', bottomZIndex);
	mainScreen.addSprite(new Sprite(0, 0, 'blackcircle.png', 'blackcircle'));
	otherScreen.addSprite(new Sprite(0, 0, 'purplecircle.png', 'purplecircle'));
	mainScreen.addSprite(new screenChangeSprite(0, 184, 'crate.png', 'goLeft', otherScreen));
	otherScreen.addSprite(new screenChangeSprite(368, 184, 'crate.png', 'goRight', mainScreen));
	
	talkScreen = new DialogueScreen('talkScreen', bottomZIndex, 'IntroDial.xml');
	ajaxCall(talkScreen);
	
	mainScreen.draw();
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

ajaxCall = function(dialogueScreen){
	$.ajax({
		async: false,
		type: "GET",
		url: dialogueScreen.file,
		dataType: "xml",
		success: function(data){
			dialogueScreen.loadXML(data);
			console.log('woot');
		}
	});
	
}

debugPrint = function(x, y){
	console.log('(' + x + ',' + y + ')');
}
