import { Job } from 'meteor/vsivsi:job-collection';

import _ from 'lodash';

import Whitelist from '/imports/api/whitelist/Whitelist';

import { emailJobs } from '/imports/server/jobs';
import Notification from './Notification';

export default class EmailNotification extends Notification {
  constructor (subject, body) {
    super();

    this.subject = subject;
    this.body = body;
    this.retries = 3;
    this.retryWaitMs = 5 * 60 * 1000;
  }

  send (to, retries = this.retries, retryWaitMs = this.retryWaitMs) {
    let target = to;
    if (target == null) {
      target = _.map(Whitelist.find({ $and: [{ emailAddress: { $ne: null } }, { notify: true }] }, { fields: { emailAddress: true, _id: false } }).fetch(), 'emailAddress');
    } else if (!_.isArray(target)) {
      target = [target];
    }

    if (!target.length) {
      console.warn('No recipients for email notification.');
      return;
    }

    console.log(`Sending email notification to: ${target}`);

    _.forEach(target, (address) => {
      new Job(emailJobs, 'sendEmail', {
        to: address,
        subject: this.subject,
        body: this.body,
      }).retry({ retries, wait: retryWaitMs }).save();
    });
  }
}
