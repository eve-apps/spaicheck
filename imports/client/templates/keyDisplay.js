/* global window: true */

import { Meteor } from 'meteor/meteor';
import { $ } from 'meteor/jquery';
import { Template } from 'meteor/templating';

import _ from 'lodash';

import insertColorMarker from '/imports/shared/colorMarker';
import parseChange from '/imports/shared/parseChange';

import getUnreviewedChanges from '/imports/api/changes/getUnreviewedChanges';
import Characters from '/imports/api/characters/Characters';
import Keys from '/imports/api/keys/Keys';

window.Keys = Keys;

/**
 * Shared functions
 **/

const handleDetailsClick = (evType, ev) => {
  if (typeof handleDetailsClick.detailsType === 'undefined') {
    handleDetailsClick.detailsType = 'INITVALUE';
  }
  handleDetailsClick.swapKeyContent = (index) => {
    const ch = $(`.changes:eq(${index})`);
    const dt = $(`.details:eq(${index})`);

    if (handleDetailsClick.detailsType === 'CHANGES') {
      dt.hide();
      ch.show();
    } else if (handleDetailsClick.detailsType === 'KEYINFO') {
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
  } else if (evType === handleDetailsClick.detailsType) {
    // The same type of button as before was clicked

    if (clickIndex === handleDetailsClick.activeIndex) {
      // Same button as before
      acc.accordion('toggle', clickIndex);
    } else {
      // Corresponding button on another row
      handleDetailsClick.swapKeyContent(clickIndex);
      acc.accordion('open', clickIndex);
      handleDetailsClick.activeIndex = clickIndex;
    }
  } else {
    // The other type of button was clicked
    handleDetailsClick.detailsType = evType;

    // Other button on same row
    if (clickIndex === handleDetailsClick.activeIndex) {
      // Pane already open
      if ($(`.details:eq(${clickIndex})`).parent().hasClass('active')) {
        acc.accordion('close', clickIndex);
        Meteor.setTimeout(() => { handleDetailsClick.swapKeyContent(clickIndex); }, 500);
        Meteor.setTimeout(() => { acc.accordion('open', clickIndex); }, 500);
      } else {
        // Pane closed
        handleDetailsClick.swapKeyContent(clickIndex);
        acc.accordion('open', clickIndex);
      }
    } else {
      // Other button on different row
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

const getChangeCount = (keyID) => {
  let changeCount = 0;
  const c = getUnreviewedChanges(keyID);
  // TODO: Fix summing
  if (c.length) {
    changeCount = _.sum(c[0].log.map(logObj => logObj.changes.length));
  }
  return changeCount;
};

Template.keyDisplay.helpers({
  keys () {
    return Keys.find({});
  },
  keyInfo () {
    return Keys.findOne({ keyID: this.keyID });
  },
  hasChanges () {
    return getChangeCount(this.keyID) ? 'toggle' : 'disabled';
  },
  numChanges () {
    const changeCount = getChangeCount(this.keyID);
    switch (changeCount) {
      case 0:
        return 'No Changes';
      case 1:
        return `${changeCount} Change`;
      default:
        return `${changeCount} Changes`;
    }
  },
  insertColorMarkerHlp: sev => insertColorMarker(sev, true),
});

Template.keyDetails.helpers({
  characters () {
    return Characters.find({ keyID: this.keyID });
  },
  isPrimary () {
    return Keys.findOne({ keyID: this.keyID }).primaryChar === this.characterName;
  },
});

Template.changeDetails.helpers({
  keyChanges () {
    return getUnreviewedChanges(this.keyID);
  },
  addBottomClass () {
    Meteor.setTimeout(() => {
      $('.changeDetail:last-child').removeClass('attached')
      .addClass('bottom attached');
    }, 1);
  },
  parseChangeHlp (changeType, sev, oldValStr, newValStr, oldValObj, newValObj, ctx, email) {
    return parseChange(changeType, sev, oldValStr, newValStr, oldValObj, newValObj, ctx, email);
  },
});

/**
 * Event Handlers
 **/

Template.keyDisplay.events({
  'click .validate-button': () => {
    // Fetch all keys from the database and validate them
    // TODO: Process these in parallel
    Meteor.call('runChecks');
  },
  'click .toggle.changesBtn': (event) => {
    handleDetailsClick('CHANGES', event);
  },
  'click .toggle.detailsBtn': (event) => {
    handleDetailsClick('KEYINFO', event);
  },
  'click .rm-key': function removeKey () {
    Meteor.call('removeKey', this.keyID);
  },
  'click .set-primary': function setPrimaryCharacter () {
    Meteor.call('setPrimaryCharacter', this.keyID, this.characterName);
  },
  'click .button.reviewed': (event) => {
    const keyID = parseInt($(event.currentTarget).attr('keyid'), 10);
    Meteor.call('acceptChanges', keyID);
  },
});
