import { Meteor } from 'meteor/meteor';

import runChecks from './runChecks';

Meteor.methods({
  async runChecks () { await runChecks(); },
});
