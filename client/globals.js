// Set new thresholds
  moment.relativeTimeThreshold('s', 60);
  moment.relativeTimeThreshold('m', 60);
  moment.relativeTimeThreshold('h', 24);
  moment.relativeTimeThreshold('d', 30);
  moment.relativeTimeThreshold('M', 12);

// Jade shenanigans workaround
settingsDate = new Date();

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

Template.registerHelper('logThis', function () {
  console.log(this);
})

Meteor.subscribe('authorizedPub');
