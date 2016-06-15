emailJobs = new JobCollection('emailJobs');
Meteor.startup(function () {
  return emailJobs.startJobServer();
});

emailQueue = emailJobs.processJobs('sendEmail', function (job, cb) {
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
