/*
 * These are a series of functions that are used for creating screens and then
 * adding them to g.screenCollection. These functions are designed to parse
 * json input and use them to create the screens.
 * There is one of these functions for every screen class
 */

var CreateScreen = function(id, json){
	var screen = {};
	if (json.active == "true"){
		screen = new Screen(id);
		g.activeScreen = id;
	} else {
		screen = new Screen(id);
	}
	for(i in json.sprites){
		screen.addSprite(g.spriteCache[i]);
		// screen.addSprite(CreateSprite(i, json.sprites[i]));
	}
	if (json.dialogue){
		screen.addDialogue(json.dialogue);
	}
	g.screenCollection[id] = screen;
}

var CreateDopplerScreen = function(id, json){
	var screen = {};
	if (json.active == 'true'){
		screen = new DopplerScreen(id);
		g.activeScreen = id;
	} else {
		screen = new DopplerScreen(id);
	}
	for (i in json.sprites){
		screen.addSprite(CreateSprite(i, json.sprites[i]));
	}
	if (json.dialogue){
		screen.addDialogue(json.dialogue);
	}
	g.screenCollection[id] = screen;
}

var CreateDialogueScreen = function(id, json){
	var talkScreen = new DialogueScreen(id, json.xml);
	helper.ajaxGet(talkScreen);
	g.screenCollection[talkScreen.id] = talkScreen;
}

var CreateInteractiveDialogueScreens = function(json){
	helper.groupItemAjaxGet(json.xml);
}

var CreateSprite= function(id, json){
	var sprite = {};
	switch(json.type){
		case 'Sprite':
			sprite = new Sprite(id, json.x, json.y, json.sprite, json.zIndex);
			break;
		case 'dialogueSprite':
			sprite = new dialogueSprite(id, json.x, json.y, json.sprite, json.zIndex, json.dialogue);
			break;
		case 'screenChangeSprite':
			sprite = new screenChangeSprite(id, json.x, json.y, json.sprite, json.zIndex, json.screen);
			break;
		case 'moveSprite':
			sprite = new moveSprite(id, json.x, json.y, json.sprite, json.zIndex, json.targetX, json.targetY, json.frames);
			break;
		default:
			console.log("ERROR: " + id + ' is set to an invalid sprite type');
	}
	return sprite;
}
