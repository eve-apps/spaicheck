/**
 * Shared functions
 **/

handleDetailsClick = function (evType, ev) {
  if (typeof handleDetailsClick.detailsType == 'undefined') {
    handleDetailsClick.detailsType = 'INITVALUE';
  }
  handleDetailsClick.swapKeyContent = function (index) {
    let ch = $('.changes:eq(' + index + ')');
    let dt = $('.details:eq(' + index + ')');

    if (handleDetailsClick.detailsType == 'CHANGES') {
      dt.hide();
      ch.show();
    }
    else if (handleDetailsClick.detailsType == 'KEYINFO'){
      ch.hide();
      dt.show();
    }
  }

  ev.stopImmediatePropagation();
  let acc = $('#key-display .ui.accordion');
  let thisBtn = $(ev.currentTarget);
  let clickIndex;
  if (evType == 'CHANGES') clickIndex = $('.changesBtn').index(thisBtn);
  if (evType == 'KEYINFO') clickIndex = $('.detailsBtn').index(thisBtn);

  // This is the first click after page loads
  if (typeof handleDetailsClick.activeIndex == 'undefined') {
    handleDetailsClick.detailsType = evType;
    handleDetailsClick.swapKeyContent(clickIndex);
    acc.accordion('open', clickIndex);
    handleDetailsClick.activeIndex = clickIndex;
  }
  // The same type of button as before was clicked
  else if (evType == handleDetailsClick.detailsType) {
    // Same button as before
    console.log(clickIndex + ", " + handleDetailsClick.activeIndex);
    if (clickIndex == handleDetailsClick.activeIndex) {
      acc.accordion('toggle', clickIndex);
    }
    // Corresponding button on another row
    else {
      handleDetailsClick.swapKeyContent(clickIndex);
      acc.accordion('open', clickIndex);
      handleDetailsClick.activeIndex = clickIndex;
    }
  }
  // The other type of button was clicked
  else {
    handleDetailsClick.detailsType = evType;

    // Other button on same row
    if (clickIndex == handleDetailsClick.activeIndex) {
      // Pane already open
      if ($('.details:eq(' + clickIndex + ')').parent().hasClass('active')) {
        acc.accordion('close', clickIndex);
        Meteor.setTimeout(function() {handleDetailsClick.swapKeyContent(clickIndex);}, 500);
        Meteor.setTimeout(function() {acc.accordion('open', clickIndex);}, 500);
      }
      // Pane closed
      else {
        handleDetailsClick.swapKeyContent(clickIndex);
        acc.accordion('open', clickIndex);
      }
    }
    // Other button on different row
    else {
      handleDetailsClick.swapKeyContent(clickIndex);
      acc.accordion('open', clickIndex);
      handleDetailsClick.activeIndex = clickIndex;
    }
  }
}

/**
 * Page Events
 **/

 Template.keyDisplay.onRendered(function () {
   $('#key-display .ui.accordion').accordion({
     selector: {
       trigger: null
     },
     animateChildren: false
   });
 })

 /**
  * Helpers
  **/

 Template.keyDisplay.helpers({
   keys: function () {
     return Keys.find({});
   },
   keyInfo: function (keyID) {
     return Keys.findOne({keyID: keyID});
   },
   hasChanges: function (keyID) {
     return Changes.findOne({keyID: keyID}) ? 'toggle' : 'disabled';
   },
   numChanges: function (keyID) {
     let changeCount = 0;
     let allChanges = Changes.findOne({keyID: keyID});
     if (allChanges) {
       let changeLog = allChanges.log
       changeLog.forEach(function (changesObj) {
         changesObj.changes.forEach(function () {
           changeCount++;
         });
       });
     }
     return changeCount;
   },
   insertColorMarkerHlp: function (sev) {
     return insertColorMarker(sev, true);
   },
   logThis: function () {
     console.log(this);
   }
 });

 Template.keyDetails.helpers({
   parseCharacters: function () {
     let chars = this.characters;
     let charStr = '';
     for (let char in chars) {
       charStr += '<li>' + chars[char].characterName + '</li>\n';
     }
     return charStr;
   }
 });

 Template.changeDetails.helpers({
   keyChanges: function (keyID) {
     return Changes.find({keyID: keyID});
   },
   addBottomClass: function (log) {
     Meteor.setTimeout(function () {
       $( ".changeDetail:last-child" ).removeClass("attached").
       addClass("bottom attached");
     }, 1);
   },
   parseChangeHlp: function (changeType, sev, oldValStr, newValStr, oldValObj, newValObj, ctx) {
     return parseChange(changeType, sev, oldValStr, newValStr, oldValObj, newValObj, ctx);
   }
 });

 /**
  * Event Handlers
  **/

 Template.keyDisplay.events({
   "click .rm-key": function() {
     Keys.remove(Keys.findOne({keyID: this.keyID})._id)
   },
   "click .toggle.changesBtn": function(ev) {
     handleDetailsClick('CHANGES', ev);
   },
   "click .toggle.detailsBtn": function(ev) {
     handleDetailsClick('KEYINFO', ev);
   }
 });
