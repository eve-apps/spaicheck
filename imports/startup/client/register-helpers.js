/* global window: true */
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import moment from 'moment';
import { getUserCharacterId, getUserCharacterName, userIsAdmin } from '/imports/api/whitelist/helpers';

// Set new thresholds
moment.relativeTimeThreshold('s', 60);
moment.relativeTimeThreshold('m', 60);
moment.relativeTimeThreshold('h', 24);
moment.relativeTimeThreshold('d', 30);
moment.relativeTimeThreshold('M', 12);

// Jade shenanigans workaround
const settingsDate = new Date();

/**
 * Helpers
 **/

// Global helper - provide user's character name
Template.registerHelper('currentCharName', () => getUserCharacterName(Meteor.userId()));

// Global helper - provide user's character ID
Template.registerHelper('currentCharId', () => getUserCharacterId(Meteor.userId()));

Template.registerHelper('prettyDate', date => moment(date).format('M-D-YYYY h:mmA'));

Template.registerHelper('timeAgo', (date = settingsDate) => {
  Session.get('timer');
  if (Session.get('useEveDurations')) {
    const separator = ' ';
    const terminator = 'ago';
    const timeSinceError = moment().diff(date);
    const duration = moment.duration(timeSinceError);
    const durationArray = [];

    if (duration.years() > 0) durationArray.push(`${duration.years()}y`);
    if (duration.months() > 0) durationArray.push(`${duration.months()}m`);
    if (duration.days() > 7) durationArray.push(`${Math.floor(duration.days() / 7)}w`);
    if (duration.days() > 0) durationArray.push(`${duration.days() % 7}d`);
    if (duration.hours() > 0) durationArray.push(`${duration.hours()}h`);
    if (duration.minutes() > 0) durationArray.push(`${duration.minutes()}m`);
    if (duration.seconds() > 0) durationArray.push(`${duration.seconds()}s`);

    return durationArray.join(separator) + separator + terminator;
  }

  return moment(date).fromNow();
});

Template.registerHelper('logThis', function logThis () { console.log(this); });

Template.registerHelper('isAdmin', () => userIsAdmin(Meteor.userId()));

Meteor.startup(() => {
  const defaultOptions = {
    useEveDurations: false,
  };

  // Load session variables
  Session.setDefault('useEveDurations', defaultOptions.useEveDurations);
});
