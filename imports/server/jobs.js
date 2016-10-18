import { Email } from 'meteor/email';
import { JobCollection } from 'meteor/vsivsi:job-collection';

export const emailJobs = new JobCollection('emailJobs');
emailJobs.startJobServer();

export const emailQueue = emailJobs.processJobs('sendEmail', { workTimeout: 60 * 60 * 1000 }, (job, cb) => {
  const email = job.data;
  try {
    Email.send({
      to: email.to,
      from: '"Spaicheck" <changes@spaicheck.com>',
      subject: email.subject,
      html: email.body,
    });
  } catch (error) {
    // Failure
    job.log(`sendEmail job failed!\n${error.stack}`, { level: 'warning', data: email, echo: true });
    job.fail(`${error}`);
    return cb();
  }
  // Success
  job.log('sendEmail job done!', { level: 'success', data: email, echo: true });
  job.done();
  return cb();
});
