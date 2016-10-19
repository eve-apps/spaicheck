import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';
import { Accounts } from 'meteor/accounts-base';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import { enableWhitelistWatch } from '/imports/client/whitelistWatch';
import { getAuthLevel } from '/imports/api/whitelist/helpers';

/**
 * Auth
 **/

// Ensure the Meteor user and Whitelist collection is available before routing starts
const userSub = Meteor.subscribe('userPub');
FlowRouter.wait();
Tracker.autorun(() => {
  if (!Meteor.loggingIn() &&
    userSub.ready() &&
    !FlowRouter._initialized) { // eslint-disable-line no-underscore-dangle
    FlowRouter.initialize();
  }
});


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
  const authLevel = getAuthLevel(Meteor.user());
  if (authLevel !== 'admin' && authLevel !== 'whitelist') {
    redirect(FlowRouter.path('landing'));
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
