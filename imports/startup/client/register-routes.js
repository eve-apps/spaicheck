import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Accounts } from 'meteor/accounts-base';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import Whitelist from '/imports/api/whitelist/Whitelist';

import { enableWhitelistWatch } from '/imports/client/whitelistWatch';

/**
 * Auth
 **/

// TODO: Rewrite this
// Redirect to home route on login
Accounts.onLogin(() => {
  if (!Session.get('loginRedirected')) {
    // Go to the app's home page
    FlowRouter.go(FlowRouter.path('home'));
    // Redirect to home page if user gets removed from whitelist
    enableWhitelistWatch();

    // Remember that we have redirected after logging in
    Session.setAuth('loginRedirected', true);
  }
});

// TODO: Move auth checks out of this file

// Redirect to landing page if not authenticated
const requireAuth = (context, redirect) => {
  if (!Meteor.userId() && !Meteor.loggingIn()) {
    redirect(FlowRouter.path('landing'));
  }
};

// Redirect to home page if user is not admin and not on whitelist
const requireWhitelist = (context, redirect) => {
  if (Meteor.user()) {
    if (Meteor.user().profile.eveOnlineCharacterId !== Meteor.settings.public.adminID &&
      !Whitelist.findOne({ characterID: String(Meteor.user().profile.eveOnlineCharacterId) })) {
      redirect(FlowRouter.path('landing'));
    }
  } else {
    // HACK: Wtf
    Meteor.setTimeout(() => {
      requireWhitelist(context, redirect);
    }, 50);
  }
};

/**
 * Routes
 **/

// Group for routes that don't require authentication
const exposed = FlowRouter.group({});

// Group for routes that require authentication
const app = FlowRouter.group({
  prefix: '/app',
  triggersEnter: [requireAuth, requireWhitelist],
});

// Landing page route
exposed.route('/', {
  name: 'landing',
  action () {
    return BlazeLayout.render('landing');
  },
});

app.route('/whitelist', {
  name: 'whitelist',
  action () {
    return BlazeLayout.render('dashboard', {
      head: 'header',
      main: 'whitelist',
    });
  },
});

// App home route
app.route('/home', {
  name: 'home',
  action () {
    return BlazeLayout.render('dashboard', {
      head: 'header',
      main: 'home',
    });
  },
});
