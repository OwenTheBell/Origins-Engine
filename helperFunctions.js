/*
 * This is a collection of functions that are used various places to helper
 * accomplish tasks. They are contained within the helper object just to make
 * locating them easier during code maintenance
 */

var helper = {
	addCSSRule: function(rule, styles){
		var mysheet = document.getElementById('extCSS');
		var mysheet = mysheet.sheet ? mysheet.sheet : mysheet.styleSheet;
		var myrules = mysheet.cssRules ? mysheet.cssRules : mysheet.rules; //all supported browsers should use cssRules
		var length = myrules.length;
		var ruleStr = rule + '{';
		if (styles){
			for(i in styles){
				ruleStr += i + ': ' + styles[i] + '; ';
			}
		}
		ruleStr += '}';
		mysheet.insertRule(ruleStr, length);
		return myrules[length];
	},
	
	//add new parts to an existing cssRule
	//there is no limit on how much can be added provided it is formatted correctly
	addToCSSRule: function(rule, toAdd){
		var myrule = this.findCSSRule(rule);
		for(j in toAdd){
			myrule.style[j] = toAdd[j];
		}
	},

	ajaxGet: function(dialogueScreen){
		$.ajax({
			async: false,
			type: "GET",
			url: dialogueScreen.file,
			dataType: "xml",
			success: function(data){
				dialogueScreen.loadXML(data, dialogueScreen.file);
			}
		});
	},

	countElements: function(object){
		var count = 0;
		for(i in object){
			if(object.hasOwnProperty(i)){
				count++;
			}
		}
		return count;
	},
	
	evalScreen: function(id, json){
		switch(json.screenType){
			case 'Screen':
				CreateScreen(id, json);
				break;
			case 'dialogueScreen':
				CreateDialogueScreen(id, json);
				break;
			case 'interactiveDialogue':
				CreateInteractiveDialogueScreens(json);
				break;
			case 'dopplerScreen':
				CreateDopplerScreen(id, json);
				break;
			case 'switchScreen':
				CreateSwitchScreen(id, json);
				break;
			case 'standardCandlesScreen':
				CreateStandardCandlesScreen(id, json);
				break;
			default:
				console.log('ERROR: ' + id + ' has the invalid screenType of: ' + json.screenType);
		}
	},
	
	groupItemAjaxGet: function(file){
		var extData;
		$.ajax({
			async: false,
			type: 'GET',
			url: file,
			dataType: 'xml',
			success: function(data){
				$(data).find('item').each(function(){
					var temp = new DialogueScreen($(this).attr('id'));
					temp.loadXML(this, file);
					g.screenCollection[temp.id] = temp;
				});
			}
		});
	},
	
	cloneObj: function(obj){
		var newObj = {};
		for (i in obj){
			if (i == 'clone') continue;
			if (obj[i] && typeof obj[i] == "object") {
				newObj[i] = this.cloneObj(obj[i]);
			} else {
				newObj[i] = obj[i];
			}
		}
		return newObj;
	},
	
	debugPrint: function(x, y){
		console.log('(' + x + ',' + y + ')');
	},

	findCSSRule: function(rule){
		var mysheet = document.getElementById('extCSS');
		var mysheet = mysheet.sheet ? mysheet.sheet : mysheet.styleSheet;
		var myrules = mysheet.cssRules ? mysheet.cssRules : mysheet.rules; //all supported browsers should use cssRules
		for (i in myrules){
			if (myrules[i].selectorText && myrules[i].selectorText === rule){
				return myrules[i];
			}
		}
		return false;
	},
	
	getDistance: function(x1, y1, x2, y2){
		var x = Math.pow((x2 - x1), 2);
		var y = Math.pow((y2 - y1), 2);
		return Math.sqrt(x + y);
	},
	
	getMax: function(array){
		var max = 0;
		$(array).each(function(){
			if (this > max){
				max = this;
			}
		});
		return max;
	},
	
	preloader: function(files, callback){
		//this function makes it easier to do recursion
		var escapevar = false;
		var internal = function(){
			var img = new Image();
			img.src = files[0];
			
			$(img).load(function(){
				if (files.length > 1){
					files.splice(0, 1);
					internal();
				} else {
					callback();
					escapevar = true;
				}
			});
		}
		internal();
		while(!escapevar){}
	}
}
