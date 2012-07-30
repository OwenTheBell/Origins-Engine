/*
 * These are a series of functions that are used for creating screens and then
 * adding them to g.screenCollection. These functions are designed to parse
 * json input and use them to create the screens.
 * There is one of these functions for every screen class
 */

var CreateDopplerScreen = function(id, active, zIndex){
	helper.preloader([
		'Sprites/Doppler_Screen/Objective_Screen.png',
		'Sprites/Doppler_Screen/Detected_Screen.png',
		'Sprites/Doppler_Screen/Emitted_Screen.png',
		'Sprites/Doppler_Screen/Objective_Screen.png',
		'Sprites/Doppler_Screen/Mouse_Counter.png',
		'Sprites/Doppler_Screen/HelpButton_Static.png',
		'Sprites/Doppler_Screen/UIFill.png',
		'Sprites/Doppler_Screen/Start_Button.png',
		'Sprites/Doppler_Screen/Pause_Button.png',
		'Sprites/Doppler_Screen/Arrow_Up.png',
		'Sprites/Doppler_Screen/Arrow_Down.png',
		'Sprites/Doppler_Screen/Game_Background.png'
	], function(){
		var dopplerScreen = new DopplerScreen(id, zIndex);
		dopplerScreen.activeScreen = active;
		g.screenCollection[dopplerScreen.id] = dopplerScreen;
		
		dopplerScreen.addSprite(new UISprite(0, 0, 'Sprites/Doppler_Screen/Game_Background.png', 'background', 1));
		dopplerScreen.addSprite(new UISprite(416, 487, 'Sprites/Doppler_Screen/Objective_Screen.png', 'objective', 4));
		dopplerScreen.addSprite(new UISprite(417, 561, 'Sprites/Doppler_Screen/Detected_Screen.png', 'detected', 4));
		dopplerScreen.addSprite(new UISprite(417, 634, 'Sprites/Doppler_Screen/Emitted_Screen.png', 'emitted', 4));
		dopplerScreen.addSprite(new UISprite(0, 480, 'Sprites/Doppler_Screen/Mouse_Counter.png', 'mouse_counter', 4));
		dopplerScreen.addSprite(new UISprite(254, 594, 'Sprites/Doppler_Screen/HelpButton_Static.png', 'help_button', 4));
		dopplerScreen.addSprite(new UISprite(0, 0, 'Sprites/Doppler_Screen/UIFill.png', 'UIFill', 6));
		dopplerScreen.addSprite(new UISprite(870, 589, 'Sprites/Doppler_Screen/Start_Button.png', 'start_button', 7));
		dopplerScreen.addSprite(new UISprite(870, 520, 'Sprites/Doppler_Screen/Pause_Button.png', 'pause_button', 7));
		dopplerScreen.addSprite(new UISprite(1175, 524, 'Sprites/Doppler_Screen/Arrow_Up.png', 'arrow_up', 7));
		dopplerScreen.addSprite(new UISprite(1070, 520, 'Sprites/Doppler_Screen/Arrow_Down.png', 'arrow_down', 7));
	});
}

var CreateScreen = function(id, json){
	var screen = new Screen(id, json.zIndex);
	console.log('creating Screen ' + id);
	for(i in json.sprites){
		screen.addSprite(CreateSprite(i, json.sprites[i]));
	}
	if (json.active === 'true'){
		g.activeScreen = id;
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
			sprite = new screenChangeSprite(json.x, json.y, json.sprite, id, json.zIndex);
			break;
		case 'moveSprite':
			sprite = new moveSprite(json.x, json.y, json.sprite, id, json.targetX, json.targetY, json.frames);
			break;
		default:
			console.log("ERROR: " + id + ' is set to an invalid sprite type');
	}
	return sprite;
}
