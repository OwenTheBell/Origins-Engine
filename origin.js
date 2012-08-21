/*
 * g holds all global variables. There is no particular need for this object
 * outside of pure legibility in the code.
 */
var g = {
  screenCollection: new Array(),
  fps: 60,
  origins: {}, //contains a DOM node of the overall container div
  input: {}, //this copies input contained in inputState for global access
  frameCounter: 0,
  drawDiv: {},
  audioDiv: {},
  playerInput: {},
  id_differ: 0,
  lastFrame: null,
  lastFrameTime: 0,
  evaluationFrame: false,
  jsonObj: {},
  activeScreen: null,
  prevActive: 'cryoScreen',
  activeDialogue: null,
  availableScreens: [], //list of screens that can be accessed via ladder
  spriteCache: [],
  interval: {},
  endMod: false, //set to true to signal game to load next module
  getTime: function(){
    var d = new Date();
    return d.getTime();
  }
}

//If there is not a console then make console.log an empty function
try{
  console;
} catch(e) {
  console = {};
  console.log = function(){};
}

$(document).ready(function(){
  g.origins = document.getElementById('origins');
  //create the div in which to put the output HTML as well as the audio files
  g.origins.innerHTML = '<div id="draw"> </div> <div id="audio"> </div>';
  g.drawDiv = document.getElementById("draw");
  g.audioDiv = document.getElementById("audio");
  
  //add these values to g.origins to simplify retrieving them later
  g.origins.width = $('#origins').width();
  g.origins.height = $('#origins').height();
  g.origins.top = parseInt($('#origins').css('top'));
  g.origins.left = parseInt($('#origins').css('left'));
  
  //setup some of the external css for the dialogueScreens
  var rule = helper.addCSSRule('.speech', {
    width: g.origins.width - 220 + 'px',
    height: g.origins.height / 4 + 'px'
  });

  loadJSON('JSON/Mod1.json');
});

loadJSON = function(json){
  //loop over the JSON file and find all sprites so that they can be preloaded
  $.getJSON(json, function(data){
    $('head').append('<script id="JSONstorage" type="application/json" >' + JSON.stringify(data) + '</script>');
    var preloaderArray = [];
    for(i in data){
      for(j in data[i].sprites){
        preloaderArray.push({id: j, json: data[i].sprites[j]});
      }
    }
    preloader(preloaderArray);
  });
}

continueReady = function(){
  g.jsonObj = JSON.parse(document.getElementById('JSONstorage').innerHTML);
  
  //make sure that the screen array is emptied while the the 
  g.screenCollection = [];
  g.availableScreens = [];
  for(i in g.jsonObj){
    var id = i;
    var json = g.jsonObj[i];
    helper.evalScreen(id, json);
  }
  //remove the JSON after it has been processed so that it does not use up cache
  var storage = document.getElementById('JSONstorage');
  storage.parentNode.removeChild(storage);
  
  //now that all screens have been created there is no more need for this object
  g.spriteCache = [];
  g.endMod = false;
  
  startGame();
}

startGame = function() {
  RunGame();
  g.interval = setInterval(RunGame, 1000 / g.fps);
}

RunGame = function(){
  g.input.key = inputState.getKey();
  g.input.mouse = inputState.getMouse();
  
  for(x in g.screenCollection) {
    g.screenCollection[x].update();
  }


  var HTML = [];
  for(x in g.screenCollection) {
    g.screenCollection[x].draw(HTML);
  }
  //Empty the drawDiv before adding in the updated HTML
  while(g.drawDiv.firstChild){
    g.drawDiv.removeChild(g.drawDiv.firstChild);
  }
  g.drawDiv.innerHTML = HTML.join('');
  for (x in g.screenCollection) {
    if(g.screenCollection[x].canvasDraw){
      g.screenCollection[x].canvasDraw();
    }
  }
  
  if(g.drawDiv.innerHTML === '' && g.endMod){
    clearInterval(g.interval);
    loadJSON('JSON/Mod1.json');
  }
  
  //calculate and display the current framerate
  if (g.frameCounter >= g.lastFrame + g.fps){
    g.evaluationFrame = true;
    var newTime = g.getTime();
    $('#framerate').html(newTime - g.lastFrameTime);
    g.lastFrameTime = newTime;
    g.lastFrame = g.frameCounter;
  } else if (g.evaluationFrame){
    g.evaluationFrame = false;
  }
  g.frameCounter++;
}

/*
 * Creates all the sprite objects ahead of screen creation
 * This ensures that sprites are only created after their image data has been loaded
 */
preloader = function(sprites){
  g.drawDiv.innerHTML = 'LOADING';
  var img = new Image();
  img.src = sprites[0].json.sprite;
  
  var that = this;
  img.onload = function(){
    var sprite = CreateSprite(sprites[0].id, sprites[0].json);
    g.spriteCache[sprite.id] = sprite;
    if (sprites.length > 1){
      sprites.splice(0, 1);
      preloader(sprites);
    } else {
      continueReady();
    }
  };
}
