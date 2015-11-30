// Use lodash instead of underscore
var _ = lodash;

// Set BlazeLayout root to body instead of custom div
BlazeLayout.setRoot('body');

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

// Redirect to home page if user does not have proper permissions
var requirePermissions = function (context, redirect) {
  if (false) {
    redirect(FlowRouter.path('home'));
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
  triggersEnter: [requireAuth, requirePermissions]
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
      side: "sidebar"
    });
  }
});

app.route('/import', {
  name: 'import',
  action: function () {
    return BlazeLayout.render('dashboard', {
      head: 'header',
      main: 'import',
      side: 'sidebar'
    });
  }
});

/**
 * onRendered
 **/

// Landing - clean up after Semantic UI's .sidebar()
Template.landing.onRendered(function () {
  $('body').removeClass('pushable');
});

// Dashboard - initialize sidebar
Template.dashboard.onRendered(function() {
  $('#mobile-menu')
    .sidebar({
      transition: 'overlay',
      dimPage: true,
      closable: true,
      onShow: function () {
        $('#side-toggle').html('<<');
      },
      onHidden: function () {
        $('#side-toggle').html('>>');
      },
    });
});

// Dashboard header - initialize dropdown
Template.header.onRendered(function () {
  $("header .ui.dropdown").dropdown({ // TODO: make selector distinguish between multiple header tags
    action: "nothing"
  });
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

// Global helper - check if user has import permission (surely there is a better way to do this?)
Template.registerHelper('userHasImportPermission', function () {
  return true;
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
  "click #side-toggle": function () {
    // Toggle the sidebar
    $('#mobile-menu').sidebar('toggle');
    console.log($('.ui.fixed.top').visibility('get screen calculations'));
  },
  "click .validate-button": function() {
    // Fetch all keys from the database and validate them
    // TODO: Use "Async" library to process these in parallel
    var curKeys = Keys.find().fetch();
    for (i=0; i < curKeys.length; i++) {
      Meteor.call('validateKey', curKeys[i].keyID, curKeys[i].vCode, function(err, result) {
        console.log(result.result);
      });
    }
  }
});
