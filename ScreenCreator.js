/*
 * These are a series of functions that are used for creating screens and then
 * adding them to g.screenCollection. These functions are designed to parse
 * json input and use them to create the screens.
 * There is one of these functions for every screen class
 */

var CreateScreen = function(id, json){
	var screen = {};
	if (json.active == "true"){
		screen = new Screen(id, g.topZIndex);
		g.activeScreen = id;
	} else {
		screen = new Screen(id, g.bottomZIndex);
	}
	for(i in json.sprites){
		screen.addSprite(CreateSprite(i, json.sprites[i]));
	}
	if (json.dialogue){
		screen.addDialogue(json.dialogue);
	}
	g.screenCollection[id] = screen;
}

var CreateDopplerScreen = function(id, json){
	var screen = {};
	if (json.active == 'true'){
		screen = new DopplerScreen(id, g.topZIndex);
		g.activeScreen = id;
	} else {
		screen = new DopplerScreen(id, g.bottomZIndex);
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
	var talkScreen = new DialogueScreen(id, g.bottomZIndex, json.xml);
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
			sprite = new Sprite(json.x, json.y, json.sprite, id);
			break;
		case 'dialogueSprite':
			sprite = new dialogueSprite(json.x, json.y, json.sprite, id, json.dialogue);
			break;
		case 'screenChangeSprite':
			sprite = new screenChangeSprite(json.x, json.y, json.sprite, id, json.screen);
			break;
		case 'UISprite':
			sprite = new UISprite(json.x, json.y, json.sprite, id, json.zIndex);
			break;
		case 'moveSprite':
			sprite = new moveSprite(json.x, json.y, json.sprite, id, json.targetX, json.targetY, json.frames);
			break;
		default:
			console.log("ERROR: " + id + ' is set to an invalid sprite type');
	}
	return sprite;
}
