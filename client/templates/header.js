/**
 * Page Events
 **/

Template.header.onRendered(function () {
  // Header dropdown
  let headerDropdown = $("header .ui.dropdown").dropdown({
    action: "nothing"
  });

  // Settings modal
  let settingsModal = $('#settings')
    .modal({transition: 'fade up'})
    .modal('attach events', '#settingsButton', 'show');
  $('#settingsButton').on('click', function (e) {
    headerDropdown.dropdown('hide');
  });

  // "All settings saved" label animation:
  // Fade in when settings change
  // Fade out after 2 seconds of settings not changing
  // If settings change while fading out, stop animation and fade in again
  let settingsSavedFadeOut = function () {
    if ($('#settingsSaved').transition('is visible')) {
      settingsSavedIsFadingOut = true;
      $('#settingsSaved').transition({
        animation: 'fade',
        duration: '1s',
        onComplete: function () {
          settingsSavedIsFadingOut = false;
        }
      });
    }
  };
  let settingsSavedTimeout = null;
  let settingsSavedIsFadingOut = false;
  let settingsSaved = function () {
    if ($('#settingsSaved').transition('is animating') && settingsSavedIsFadingOut) {
      $('#settingsSaved').transition('stop all');
      settingsSavedIsFadingOut = false;
      settingsSaved();
    } else if (!$('#settingsSaved').transition('is visible')) {
      $('#settingsSaved').transition({
        animation: 'fade',
        duration: '1s',
        onComplete: function () {
          Meteor.clearTimeout(settingsSavedTimeout);
          settingsSavedTimeout = Meteor.setTimeout(settingsSavedFadeOut, 2000);
        }
      });
    } else {
      Meteor.clearTimeout(settingsSavedTimeout);
      settingsSavedTimeout = Meteor.setTimeout(settingsSavedFadeOut, 2000);
    }
  };


  // Settings
  let eveTimeBtn = $('#eveTimeBtn');
  let friendlyTimeBtn = $('#friendlyTimeBtn');
  let handleTimeFormat = function () {
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

  eveTimeBtn.click(function() {
    Session.setPersistent('useEveDurations', true);
    handleTimeFormat();
  });
  friendlyTimeBtn.click(function() {
    Session.setPersistent('useEveDurations', false);
    handleTimeFormat();
  });
});

/**
 * Event Handlers
 **/

Template.header.events({
  "click .logout-button": function() {
    // Log the user out and redirect them to the landing page
    Meteor.logout(function() {
      // Stop watching for whitelist changes
      if (whitelistWatch) {
        whitelistWatch.stop();
      }
      // Redirect to landing route
      FlowRouter.go(FlowRouter.path("landing"));
    });
  }
});