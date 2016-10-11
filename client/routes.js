'use strict';

import Whitelist from '/imports/api/whitelist/Whitelist';

/**
 * Auth
 **/

export var whitelistWatch;

// Redirect to home route on login
Accounts.onLogin(function() {
  if (!Session.get("loginRedirected")) {
    FlowRouter.go(FlowRouter.path("home"));
    // Redirect to home page if user gets removed from whitelist
    whitelistWatch = Whitelist.find({characterID: String(Meteor.user().profile.eveOnlineCharacterId)}).observe({
      removed: function () {
        FlowRouter.go('landing');
      }
    });
    Session.setAuth("loginRedirected", true);
  }
});

// TODO: Move auth checks out of this file

// Redirect to landing page if not authenticated
var requireAuth = function(context, redirect) {
  if (!Meteor.userId() && !Meteor.loggingIn()) {
    redirect(FlowRouter.path("landing"));
  }
};

// Redirect to home page if user is not admin and not on whitelist
var requireWhitelist = function (context, redirect) {
  if (Meteor.user()) {
    if (Meteor.user().profile.eveOnlineCharacterId !== Meteor.settings.public.adminID &&
      !Whitelist.findOne({characterID: String(Meteor.user().profile.eveOnlineCharacterId)})) {
        redirect(FlowRouter.path('landing'));
    }
  } else {
    Meteor.setTimeout(function () {
      requireWhitelist(context, redirect);
    }, 50);
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
  triggersEnter: [requireAuth, requireWhitelist]
});

// Landing page route
exposed.route("/", {
  name: "landing",
  action: function() {
    return BlazeLayout.render("landing");
  }
});

app.route("/whitelist", {
  name: "whitelist",
  action: function() {
    return BlazeLayout.render("dashboard", {
      head: "header",
      main: "whitelist"
    });
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
