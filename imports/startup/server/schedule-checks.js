import { Meteor } from 'meteor/meteor';
import runChecks from '/imports/api/changes/runChecks';

(async () => {
  // Run initial startup check on all Keys
  await runChecks();
  // Run validation checks on all keys every 6 minutes
  Meteor.setInterval(async () => {
    await runChecks();
    // TODO: Expose validation interval as a setting
  }, 360000);
})();
