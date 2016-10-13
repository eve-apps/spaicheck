

import { whitelistWatch } from '/client/routes';

/**
 * Page Events
 **/

Template.header.onRendered(() => {
  // Header dropdown
  const headerDropdown = $('header .ui.dropdown').dropdown({
    action: 'nothing',
  });

  // Settings modal
  const settingsModal = $('#settings')
    .modal(
    {
      transition: 'fade up',
      onShow() {
        $('#settingsSaved').transition('hide');
      },
      onHidden() {
        $('#settingsSaved').transition('hide');
      },
    })
    .modal('attach events', '#settingsButton', 'show');
  $('#settingsButton').on('click', (e) => {
    headerDropdown.dropdown('hide');
  });

  // "All settings saved" label animation:
  // Fade in when settings change
  // Fade out after 2 seconds of settings not changing
  // If settings change while fading out, stop animation and fade in again
  const settingsSavedFadeOut = function () {
    if ($('#settingsSaved').transition('is visible')) {
      settingsSavedIsFadingOut = true;
      $('#settingsSaved').transition({
        animation: 'fade',
        duration: '1s',
        onComplete() {
          settingsSavedIsFadingOut = false;
        },
      });
    }
  };
  let settingsSavedTimeout = null;
  let settingsSavedIsFadingOut = false;
  const settingsSaved = function () {
    if ($('#settingsSaved').transition('is animating') && settingsSavedIsFadingOut) {
      $('#settingsSaved').transition('stop all');
      settingsSavedIsFadingOut = false;
      settingsSaved();
    } else if (!$('#settingsSaved').transition('is visible')) {
      $('#settingsSaved').transition({
        animation: 'fade',
        duration: '1s',
        onComplete() {
          Meteor.clearTimeout(settingsSavedTimeout);
          settingsSavedTimeout = Meteor.setTimeout(settingsSavedFadeOut, 2000);
        },
      });
    } else {
      Meteor.clearTimeout(settingsSavedTimeout);
      settingsSavedTimeout = Meteor.setTimeout(settingsSavedFadeOut, 2000);
    }
  };


  // Settings
  const eveTimeBtn = $('#eveTimeBtn');
  const friendlyTimeBtn = $('#friendlyTimeBtn');
  const handleTimeFormat = function () {
    const eveAlreadyActive = Session.get('useEveDurations') && eveTimeBtn.hasClass('active');
    const friendlyAlreadyActive = !Session.get('useEveDurations') && friendlyTimeBtn.hasClass('active');
    if (eveAlreadyActive || friendlyAlreadyActive) return null;
    if (Session.get('useEveDurations')) {
      friendlyTimeBtn.removeClass('active blue');
      friendlyTimeBtn.focusout();
      eveTimeBtn.focus();
      eveTimeBtn.addClass('active blue');
    }
    else if (!Session.get('useEveDurations')) {
      eveTimeBtn.removeClass('active blue');
      eveTimeBtn.focusout();
      friendlyTimeBtn.focus();
      friendlyTimeBtn.addClass('active blue');
    }
    settingsSaved();
  };

  handleTimeFormat();

  eveTimeBtn.click(() => {
    Session.setPersistent('useEveDurations', true);
    handleTimeFormat();
  });
  friendlyTimeBtn.click(() => {
    Session.setPersistent('useEveDurations', false);
    handleTimeFormat();
  });
});

/**
 * Event Handlers
 **/

Template.header.events({
  'click .logout-button': function () {
    // Log the user out and redirect them to the landing page
    Meteor.logout(() => {
      // Stop watching for whitelist changes
      if (whitelistWatch) {
        // TODO: Check if this actually works
        whitelistWatch.stop();
      }
      // Redirect to landing route
      FlowRouter.go(FlowRouter.path('landing'));
    });
  },
});
