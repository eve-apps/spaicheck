'use strict';

import {_} from '/imports/shared/globals';

export const emailJobs = new JobCollection('emailJobs');
Meteor.startup(function () {
  return emailJobs.startJobServer();
});

export const emailQueue = emailJobs.processJobs('sendEmail', {workTimeout: 60*60*1000}, function (job, cb) {
  let email = job.data;
  try {
    Email.send({
      to: email.to,
      from: "\"Spaicheck\" <changes@spaicheck.com>",
      subject: email.subject,
      html: email.body
    });
  } catch (err) {
    // Failure
    job.log('sendEmail job failed! ' + err, {level: 'warning', data: email, echo: true});
    job.fail("" + err);
    return cb();
  }
  // Success
  job.log('sendEmail job done!', {level: 'success', data: email, echo: true});
  job.done();
  return cb();
});
