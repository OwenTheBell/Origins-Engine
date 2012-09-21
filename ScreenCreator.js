/*
 * These are a series of functions that are used for creating screens and then
 * adding them to g.screenCollection. These functions are designed to parse
 * json input and use them to create the screens.
 * There is one of these functions for every screen class
 */

var CreateScreen = function(id, json){
  var screen = {};
  screen = new Screen(id);
  if (json.active == "true"){
    g.activeScreen = id;
  }
  for(i in json.sprites){
    //search the spriteCache for the previously created sprite object
    screen.addSprite(g.spriteCache[i]);
  }
  if (json.dialogue){
  screen.addDialogue(json.dialogue);
  }
  if(json.name){
    g.availableScreens.push({id: id, name: json.name});
  }
  g.screenCollection[id] = screen;
}

var CreateDopplerScreen = function(id, json){
  var screen = {};
  screen = new DopplerScreen(id, json.targets);
  if (json.active == 'true'){
    g.activeScreen = id;
  }
  for (i in json.sprites){
    screen.addSprite(CreateSprite(i, json.sprites[i]));
  }
  if (json.dialogue){
    screen.addDialogue(json.dialogue);
  }
  g.screenCollection[id] = screen;
}

var CreateSwitchScreen = function(id, json){
  var screen = new SwitchScreen(id);
  g.screenCollection[id] = screen;
}

var CreateStandardCandlesScreen = function(id, json){
  var screen = new StandardCandlesScreen(id);
  if (json.active === 'true'){
    g.activeScreen = id;
  }
  for (i in json.sprites){
    screen.addSprite(CreateSprite(i, json.sprites[i]));
  }
  if (json.dialogue){
    screen.addDialogue(json.dialogue);
  }
  g.screenCollection[id] = screen;
}

var CreateMod1Exp1Screen = function(id, json){
  var screen = new Mod1Exp1Screen(id); 
  if (json.active === 'true') {
    g.activeScreen = id;
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
  if (!json.x){
    json.x = 0;
  }
  if (!json.y) {
    json.y = 0;
  }
  switch(json.type){
    case 'Sprite':
      sprite = new Sprite(id, json.x, json.y, json.sprite, json.zIndex);
      break;
      /*
    case 'clickSprite':
      sprite = new clickSprite(id, json.x, json.y, json.sprite, json.zIndex);
      break;
      */
    case 'dialogueSprite':
      sprite = new dialogueSprite(id, json.x, json.y, json.sprite, json.zIndex, json.dialogue);
      break;
    case 'screenChangeSprite':
      sprite = new screenChangeSprite(id, json.x, json.y, json.sprite, json.zIndex, json.screen);
      break;
    case 'moveSprite':
      sprite = new moveSprite(id, json.x, json.y, json.sprite, json.zIndex, json.targetX, json.targetY, parseFloat(json.seconds));
      break;
    case 'toggleSprite':
      sprite = new toggleSprite(id, json.x, json.y, json.sprite, json.zIndex, json.width, json.height);
      break;
    case 'moveableSprite':
      if (!json.x && !json.y){
        sprite = new moveableSprite(id, null, null, json.sprite, json.zIndex);
      } else {
        sprite = new moveableSprite(id, json.x, json.y, json.sprite, json.zIndex);
      }
      break;
    case 'clickMoveableSprite':
      if (!json.x && !json.y){
        sprite = new clickMoveableSprite(id, null, null, json.sprite, json.zIndex);
      } else {
        sprite = new clickMoveableSprite(id, json.x, json.y, json.sprite, json.zIndex);
      }
      break;
    default:
      console.log("ERROR: " + id + ' is set to an invalid sprite type');
  }
  return sprite;
}
