

// TODO: Import moment

// Set new thresholds
moment.relativeTimeThreshold('s', 60);
moment.relativeTimeThreshold('m', 60);
moment.relativeTimeThreshold('h', 24);
moment.relativeTimeThreshold('d', 30);
moment.relativeTimeThreshold('M', 12);

// Jade shenanigans workaround
window.settingsDate = new Date();

/**
 * Helpers
 **/

// Global helper - provide user's character name
Template.registerHelper('currentCharName', () => {
  let ref;
  return (ref = Meteor.user()) != null ? ref.profile.eveOnlineCharacterName : void 0;
});

// Global helper - provide user's character ID
Template.registerHelper('currentCharId', () => {
  let ref;
  return (ref = Meteor.user()) != null ? ref.profile.eveOnlineCharacterId : void 0;
});

Template.registerHelper('prettyDate', (date) => {
  return moment(date).format('M-D-YYYY h:mmA');
});

Template.registerHelper('timeAgo', (date) => {
  date = date || settingsDate;
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
  else return moment(date).fromNow();
});

Template.registerHelper('logThis', function () {
  console.log(this);
});

Template.registerHelper('isAdmin', () => {
  const result = Meteor.user() && Meteor.user().profile.eveOnlineCharacterId === Meteor.settings.public.adminID;
  console.log(result);
  return result;
});

Meteor.subscribe('authorizedPub');
Meteor.subscribe('adminPub');
