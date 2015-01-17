// Search for jquery elements with a certain value for a certain attribute,
// using a regex for the value
jQuery.expr[':'].regex = function(elem, index, match) {
  var matchParams = match[3].split(','),
      validLabels = /^(data|css):/,
      attr = {
        method: matchParams[0].match(validLabels) ? 
                matchParams[0].split(':')[0] : 'attr',
                property: matchParams.shift().replace(validLabels,'')
      },
      regexFlags = 'ig',
      regex = new RegExp(matchParams.join('').replace(/^\s+|\s+$/g,''), regexFlags);

  return regex.test(jQuery(elem)[attr.method](attr.property));
}


var iframes = [];         // Store all iframes on page
var players = [];         // Store all soundcloud players as widgets
var currentPlayer = 0;    // Stores index of current widget that is playing

// Called when widgets are first loaded, plays first widget on page
function playFirst() {
  players[currentPlayer].play();
}

// Called when one widget finishes playing, plays next widget
function playNext() {
  currentPlayer++;
  players[currentPlayer].play();
}

// Called when a widget starts playing, used to detect when a user manually clicks play on a widget.
// In this case, stop the widget that was playing before, set the new widget to the current playing widget.
function songStartedPlaying() {
  for (var i=0; i<iframes.length; i++) {
    if (i == currentPlayer)
      continue;
    players[i].isPaused(function(paused) {
      if (paused == false) {
        var newIndex = $(this)[0]["index"];
        players[currentPlayer].pause();
        currentPlayer = newIndex;
        console.log(newIndex);
      }
    });
  }
}

// Search through the document to find all soundcloud players, load 
function findPlayers() {

  // If the correct elements have not loaded, try again in one second
  if ($(".blogItem").children("p").children("iframe") == null) {
    console.log("Trying again");
    setTimeout(test, 1000);
  }
  else {
    iframes = $(".blogItem").children("p").children("iframe:regex(src,.*?soundcloud.*)");
    for (var i=0; i<iframes.length; i++) {

      // Transform the iframe elements to soundcloud widgets and add them to the array
      players.push(SC.Widget(iframes[i]));
      players[i]["index"] = i;

      // Bind the widgets to FINISH and PLAY events
      players[i].bind(SC.Widget.Events.FINISH, playNext);
      players[i].bind(SC.Widget.Events.PLAY, songStartedPlaying);
    }
    // Start playing the first widget
    players[0].bind(SC.Widget.Events.READY, playFirst);
  }
}

// Insert the global UI player
function insertUIPlayer() {

  // Insert CSS file for player
  var a = chrome.extension.getURL("player.css");
  $('<link rel="stylesheet" type="text/css" href="' + a + '" >').appendTo("head");

  // Insert player
  $("body").prepend("<div class='mine'>HEYYYY</div>");
}
  
$(document).ready(function() { 
  findPlayers();
  insertUIPlayer();

});


// TODO: Stop player when press play on anotehr player
// TODO: Create UIPlayer
// TODO: Download shortcut key
