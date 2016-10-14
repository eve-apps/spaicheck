

import { insertColorMarker } from '/imports/shared/colorMarker';
import { parseChange } from '/imports/shared/parseChange';

import Changes from '/imports/api/changes/Changes';
import Characters from '/imports/api/characters/Characters';
import Keys from '/imports/api/keys/Keys';

window.Keys = Keys;

/**
 * Shared functions
 **/

const handleDetailsClick = function (evType, ev) {
  if (typeof handleDetailsClick.detailsType === 'undefined') {
    handleDetailsClick.detailsType = 'INITVALUE';
  }
  handleDetailsClick.swapKeyContent = function (index) {
    const ch = $(`.changes:eq(${index})`);
    const dt = $(`.details:eq(${index})`);

    if (handleDetailsClick.detailsType === 'CHANGES') {
      dt.hide();
      ch.show();
    }
    else if (handleDetailsClick.detailsType === 'KEYINFO') {
      ch.hide();
      dt.show();
    }
  };

  ev.stopImmediatePropagation();
  const acc = $('#key-display .ui.accordion');
  const thisBtn = $(ev.currentTarget);
  let clickIndex;
  if (evType === 'CHANGES') clickIndex = $('.changesBtn').index(thisBtn);
  if (evType === 'KEYINFO') clickIndex = $('.detailsBtn').index(thisBtn);

  // This is the first click after page loads
  if (typeof handleDetailsClick.activeIndex === 'undefined') {
    handleDetailsClick.detailsType = evType;
    handleDetailsClick.swapKeyContent(clickIndex);
    acc.accordion('open', clickIndex);
    handleDetailsClick.activeIndex = clickIndex;
  }
  // The same type of button as before was clicked
  else if (evType === handleDetailsClick.detailsType) {
    // Same button as before
    if (clickIndex === handleDetailsClick.activeIndex) {
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
    if (clickIndex === handleDetailsClick.activeIndex) {
      // Pane already open
      if ($(`.details:eq(${clickIndex})`).parent().hasClass('active')) {
        acc.accordion('close', clickIndex);
        Meteor.setTimeout(() => { handleDetailsClick.swapKeyContent(clickIndex); }, 500);
        Meteor.setTimeout(() => { acc.accordion('open', clickIndex); }, 500);
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
};

/**
 * Page Events
 **/

Template.keyDisplay.onRendered(() => {
  $('#key-display .ui.accordion').accordion({
    selector: {
      trigger: null,
    },
    animateChildren: false,
  });
});

/**
 * Helpers
 **/

Template.keyDisplay.helpers({
  keys() {
    return Keys.find({});
  },
  keyInfo() {
    return Keys.findOne({ keyID: this.keyID });
  },
  hasChanges() {
    return Changes.findOne({ keyID: this.keyID }) ? 'toggle' : 'disabled';
  },
  numChanges() {
    let changeCount = 0;
    const allChanges = Changes.findOne({ keyID: this.keyID });
    if (allChanges) {
      const changeLog = allChanges.log;
      changeLog.forEach((changesObj) => {
        changesObj.changes.forEach(() => {
          changeCount++;
        });
      });
    }
    switch (changeCount) {
      case 0:
        return 'No Changes';
        break;
      case 1:
        return `${changeCount} Change`;
        break;
      default:
        return `${changeCount} Changes`;
    }
  },
  insertColorMarkerHlp(sev) {
    return insertColorMarker(sev, true);
  },
});

Template.keyDetails.helpers({
  characters() {
    return Characters.find({ keyID: this.keyID });
  },
  isPrimary() {
    return Keys.findOne({ keyID: this.keyID }).primaryChar === this.characterName;
  },
});

Template.changeDetails.helpers({
  keyChanges() {
    return Changes.find({ keyID: this.keyID });
  },
  addBottomClass(log) {
    Meteor.setTimeout(() => {
      $('.changeDetail:last-child').removeClass('attached')
      .addClass('bottom attached');
    }, 1);
  },
  parseChangeHlp(changeType, sev, oldValStr, newValStr, oldValObj, newValObj, ctx, email) {
    return parseChange(changeType, sev, oldValStr, newValStr, oldValObj, newValObj, ctx, email);
  },
});

/**
 * Event Handlers
 **/

Template.keyDisplay.events({
  'click .validate-button': function () {
    // Fetch all keys from the database and validate them
    // TODO: Process these in parallel
    Meteor.call('runChecks');
  },
  'click .toggle.changesBtn': function (ev) {
    handleDetailsClick('CHANGES', ev);
  },
  'click .toggle.detailsBtn': function (ev) {
    handleDetailsClick('KEYINFO', ev);
  },
  'click .rm-key': function () {
    Meteor.call('removeKey', this.keyID);
  },
  'click .set-primary': function () {
    Meteor.call('setPrimaryCharacter', this.keyID, this.characterName);
  },
  'click .button.reviewed': function (ev) {
    const keyID = parseInt($(ev.currentTarget).attr('keyid'), 10);
    Meteor.call('acceptChanges', keyID);
  },
});
