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

var CreateScreen = function(active, zIndex){
	
}

/*
 * parent: the id of the parent screen of the dialogueScreen
 */
var CreateDialogueScreen = function(id, parent, xmlFile){
	var talkScreen = new DialogueScreen(id, g.bottomZIndex, xmlFile);
	helper.ajaxGet(talkScreen);
	g.screenCollection[parent].addDialogueScreen(talkScreen);
	g.screenCollection[talkScreen.id] = talkScreen;
}

/*
 * Everything below here will not be in final code. These functions are just
 * for easy testing purposes and are hardcoded rather than reading in from a file
 */

var CreateMainScreen1 = function(id, active, zIndex){
	
	helper.preloader([
		'Sprites/ArrowObject.png',
		'Sprites/Main_View1/Background.png',
		'Sprites/Main_View1/Bed.png',
		'Sprites/Main_View1/Water.png',
		'Sprites/Main_View1/Ladder.png',
		'Sprites/Main_View1/Bike.png',
		'Sprites/Main_View1/Food_Pellets.png',
		'Sprites/Main_View1/Drawer.png',
		'Sprites/Main_View1/Table.png',
		'Sprites/Main_View1/Chair.png',	
	], function(){
		var mainScreen1 = new Screen(id, zIndex);
		console.log(id);
		mainScreen1.activeScreen = active;
		g.screenCollection[mainScreen1.id] = mainScreen1;
		
		var dialogueScreens = new Array();
		
		helper.groupItemAjaxGet(dialogueScreens, 'XML/IntroObjMainRm.xml');
		for(key in dialogueScreens){
			g.screenCollection[dialogueScreens[key].id] = dialogueScreens[key];
		}
		
		mainScreen1.addSprite(new Sprite(0, 0, 'Sprites/Main_View1/Background.png', 'background'));
		mainScreen1.addSprite(new dialogueSprite(999, 0, 'Sprites/Main_View1/Bed.png', 'Bed', dialogueScreens['sleeps']));
		mainScreen1.addSprite(new dialogueSprite(199, 100, 'Sprites/Main_View1/Water.png', 'Water', dialogueScreens['water']));
		mainScreen1.addSprite(new dialogueSprite(799, 300, 'Sprites/Main_View1/Bike.png', 'Bike', dialogueScreens['bike']));
		// mainScreen1.addSprite(new dialogueSprite(699, 0, 'Sprites/Main_View1/Ladder.png', 'Ladder', dialogueScreens['ladder']));
		mainScreen1.addSprite(new screenChangeSprite(699, 0, 'Sprites/Main_View1/Ladder.png', 'Ladder', 'cryoScreen'));
		mainScreen1.addSprite(new dialogueSprite(100, 99, 'Sprites/Main_View1/Food_Pellets.png', 'Food_Pellets', dialogueScreens['food']));
		mainScreen1.addSprite(new dialogueSprite(0, 349, 'Sprites/Main_View1/Drawer.png', 'Drawer', dialogueScreens['bookshelf']));
		mainScreen1.addSprite(new dialogueSprite(350, 250, 'Sprites/Main_View1/Table.png', 'Table', dialogueScreens['table']));
		mainScreen1.addSprite(new dialogueSprite(299, 300, 'Sprites/Main_View1/Chair.png', 'Chair', dialogueScreens['chair']));
		mainScreen1.addSprite(new dialogueSprite(0, 49, 'Sprites/Main_View1/Thermostat.png', 'Thermostat', dialogueScreens['smallmonitor']));
		mainScreen1.addSprite(new screenChangeSprite(0, 647, 'Sprites/ArrowObject.png', 'change', 'mainScreen2'));
	});
}

var CreateMainScreen2 = function(id, active, zIndex){
	
	helper.preloader([
		'Sprites/ArrowObject.png',
		'Sprites/Main_View2/View2Background.png',
		'Sprites/Main_View2/Clothing_Cabinet.png',
		'Sprites/Main_View2/Shutter.png',
		'Sprites/Main_View2/Space_Exact.png',
		'Sprites/Main_View2/Window.png',
	], function(){
		var mainScreen2 = new Screen(id, zIndex);
		mainScreen2.activeScreen = active;
		g.screenCollection[mainScreen2.id] = mainScreen2;
		dialogueScreens = new Array();
		helper.groupItemAjaxGet(dialogueScreens, 'XML/IntroObjMainRm2.xml');
		for(key in dialogueScreens){
			g.screenCollection[dialogueScreens[key].id] = dialogueScreens[key];
		}
		
		mainScreen2.addSprite(new Sprite(446, 317, 'Sprites/Main_View2/Space_Exact.png', 'space_exact'));
		mainScreen2.addSprite(new moveSprite(450, 100, 'Sprites/Main_View2/Shutter.png', 'shutter', 450, 300, 60));
		mainScreen2.addSprite(new Sprite(0, 0, 'Sprites/Main_View2/View2Background.png', 'background'));
		mainScreen2.addSprite(new dialogueSprite(400, 300, 'Sprites/Main_View2/Window.png', 'window', dialogueScreens['window']));
		mainScreen2.addSprite(new dialogueSprite(849, 199, 'Sprites/Main_View2/Clothing_Cabinet.png', 'clothes', dialogueScreens['clothes']));
		mainScreen2.addSprite(new screenChangeSprite(0, 647, 'Sprites/ArrowObject.png', 'change', 'mainScreen1'));
	});
}

var CreateCryoScreen = function(id, active, zIndex){
	
	helper.preloader([
		'Sprites/ArrowObject.png',
		'Sprites/Cryo_Room/Training_Room_Background.png',
		'Sprites/Cryo_Room/Fog.png',
		'Sprites/Cryo_Room/Robot.png',
		'Sprites/Cryo_Room/Storage_Container.png',
		'Sprites/Cryo_Room/Solar_Panel.png',
		'Sprites/Cryo_Room/Cryo_Console.png',
		'Sprites/Cryo_Room/Ladder.png',
	], function(){
		var cryoScreen = new Screen(id, zIndex);
		cryoScreen.activeScreen = active;
		g.screenCollection[cryoScreen.id] = cryoScreen;
		
		dialogueScreens = new Array();
		helper.groupItemAjaxGet(dialogueScreens, 'XML/Mod1ObjCryo.xml');
		for(key in dialogueScreens){
			g.screenCollection[dialogueScreens[key].id] = dialogueScreens[key];
		}
		cryoScreen.addSprite(new Sprite(0, 0, 'Sprites/Cryo_Room/Training_Room_Background.png', 'background'));
		cryoScreen.addSprite(new dialogueSprite(313, 513, 'Sprites/Cryo_Room/Robot.png', 'miceCatcher', dialogueScreens['miceCatcher']));
		cryoScreen.addSprite(new dialogueSprite(740, 20, 'Sprites/Cryo_Room/Storage_Container.png', 'storageContainer', dialogueScreens['storageContainer']));
		cryoScreen.addSprite(new dialogueSprite(799, 49, 'Sprites/Cryo_Room/Solar_Panel.png', 'solarPanel', dialogueScreens['solarPanel']));
		cryoScreen.addSprite(new dialogueSprite(180, 340, 'Sprites/Cryo_Room/Cryo_Console.png', 'consoleCryo', dialogueScreens['consoleCryo']));
		// cryoScreen.addSprite(new dialougeSprite(580, 0, 'Sprites/Cryo_Room/Ladder.png', 'ladderCryo', dialougeScreens['ladderCryo']));
		cryoScreen.addSprite(new screenChangeSprite(580, 0, 'Sprites/Cryo_Room/Ladder.png', 'ladderCryo', 'mainScreen1'));
		cryoScreen.addSprite(new Sprite(0, 0, 'Sprites/Cryo_Room/Fog.png', 'fog'));
	});
}
