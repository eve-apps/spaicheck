// Set new thresholds
  moment.relativeTimeThreshold('s', 60);
  moment.relativeTimeThreshold('m', 60);
  moment.relativeTimeThreshold('h', 24);
  moment.relativeTimeThreshold('d', 30);
  moment.relativeTimeThreshold('M', 12);

// Use lodash instead of underscore
var _ = lodash;

// Set BlazeLayout root to body instead of custom div
BlazeLayout.setRoot('body');

// Jade shenanigans workaround
settingsDate = new Date();

/**
 * Auth
 **/

// Redirect to home route on login
Accounts.onLogin(function() {
  if (!Session.get("loginRedirected")) {
    FlowRouter.go(FlowRouter.path("home"));
    Session.setAuth("loginRedirected", true);
  }
});

// Redirect to landing page if not authenticated
var requireAuth = function(context, redirect) {
  if (!Meteor.userId() && !Meteor.loggingIn()) {
    redirect(FlowRouter.path("landing"));
  }
};

/**
 * Routes
 **/

// Group for routes that don't require authentication
var exposed = FlowRouter.group({});

// Group for routes that require authentication
var app = FlowRouter.group({
  prefix: "/app",
  triggersEnter: [requireAuth]
});

// Landing page route
exposed.route("/", {
  name: "landing",
  action: function() {
    return BlazeLayout.render("landing");
  }
});

// App home route
app.route("/home", {
  name: "home",
  action: function() {
    return BlazeLayout.render("dashboard", {
      head: "header",
      main: "home",
    });
  }
});

/**
 * onCreated
 **/

Template.home.onCreated(function () {
  Session.set('timer', true);
  eachSecond = Meteor.setInterval(function() {
    Session.set('timer', !Session.get('timer'));
  }, 1000);
});

/**
 * onDestroyed
 **/

Template.home.onDestroyed(function () {
  Meteor.clearInterval(eachSecond);
});

/**
 * onRendered
 **/

// Landing - clean up after Semantic UI's .sidebar()
Template.landing.onRendered(function () {
  $('body').removeClass('pushable');
});

// Dashboard header - initialize dropdown
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

Template.home.onRendered(function () {
  $('#active-errors .ui.accordion').accordion();
  $('#key-display .ui.accordion').accordion();
});

/**
 * Helpers
 **/

// Global helper - provide user's character name
Template.registerHelper('currentCharName', function() {
  var ref;
  return (ref = Meteor.user()) != null ? ref.profile.eveOnlineCharacterName : void 0;
});

// Global helper - provide user's character ID
Template.registerHelper('currentCharId', function() {
  var ref;
  return (ref = Meteor.user()) != null ? ref.profile.eveOnlineCharacterId : void 0;
});

Template.registerHelper('prettyDate', function (date) {
  return moment(date).format("M-D-YYYY h:mmA");
});

Template.registerHelper('timeAgo', function (date) {
  date = date || settingsDate;
  Session.get('timer');
  if (Session.get('useEveDurations')) {
    let separator = ' ';
    let terminator = 'ago';
    let timeSinceError = moment().diff(date);
    let duration = moment.duration(timeSinceError);
    let durationArray = [];

    if (duration.years() > 0)   durationArray.push(duration.years() + 'y');
    if (duration.months() > 0)  durationArray.push(duration.months() + 'm');
    if (duration.days() > 7)    durationArray.push(Math.floor(duration.days() / 7) + 'w');
    if (duration.days() > 0)    durationArray.push((duration.days() % 7) + 'd');
    if (duration.hours() > 0)   durationArray.push(duration.hours() + 'h');
    if (duration.minutes() > 0) durationArray.push(duration.minutes() + 'm');
    if (duration.seconds() > 0) durationArray.push(duration.seconds() + 's');

    return durationArray.join(separator) + separator + terminator;
  }
  else return moment(date).fromNow();
});

Template.errorDisplay.helpers({
  errors: function () {
    return Errors.find({});
  },
  keyErrorCount: function (log) {
    return log.length > 1 ? log.length + " Errors" : log.length + " Error";
  }
});

Template.keyDisplay.helpers({
  keys: function () {
    return Keys.find({});
  },
  keyChanges: function (keyID) {
    return Changes.find({keyID: keyID});
  },
  addBottomClass: function (log) {
    Meteor.setTimeout(function () {
      $( ".changeDetail:last-child" ).removeClass("attached").
      addClass("bottom attached");
      console.log("jQuery Ran!");
    }, 1);
  }
});

/**
 * Events
 **/

Template.dashboard.events({
  "click .logout-button": function() {
    // Log the user out and redirect them to the landing page
    Meteor.logout(function() {
      FlowRouter.go(FlowRouter.path("landing"));
    });
  },
  "click .validate-button": function() {
    // Fetch all keys from the database and validate them
    // TODO: Use "Async" library to process these in parallel
    Meteor.call('runChecks');
  },
  "click .rm-err": function() {
    Errors.remove(this._id);
  }
});
