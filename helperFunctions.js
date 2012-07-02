/*
 * This file is just a collection of functions that didn't really have a place.
 * Instead they are all just being stored in the object in here.
 */

var helper = {

	ajaxGet: function(dialogueScreen){
		$.ajax({
			async: false,
			type: "GET",
			url: dialogueScreen.file,
			dataType: "xml",
			success: function(data){
				dialogueScreen.loadXML(data);
			}
		});
	},
	
	altAjaxGet: function(dialogueScreens, file){
		var extData;
		$.ajax({
			async: false,
			type: 'GET',
			url: file,
			dataType: 'xml',
			success: function(data){
				$(data).find('item').each(function(){
					var temp = new DialogueScreen($(this).attr('id'), bottomZIndex);
					temp.loadXML(this);
					dialogueScreens[temp.id] = temp;
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
		var mysheet = document.styleSheets[0];
		var myrules = mysheet.cssRules ? mysheet.cssRules : mysheet.rules;
		for (i in myrules){
			if (myrules[i].selectorText.toLowerCase() === rule) {
				return myrules[i];
			}
		}
		console.log(document.styleSheets[0].cssRules[0].cssText);
		return false;
	}
}
