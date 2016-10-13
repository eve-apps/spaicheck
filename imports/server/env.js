

import _ from 'lodash';

import process from 'process';

Meteor.startup(() => {
  // TODO: Don't assume settings are defined
  process.env.ROOT_URL = Meteor.settings.private.rootUrl;

  if (_.every(['mailUser', 'mailPass', 'mailServer', 'mailPort'], (mailSetting) => { return Meteor.settings.private[mailSetting] != null; })) {
    console.log('Email configured.');
    process.env.MAIL_URL = `smtp://${Meteor.settings.private.mailUser}:${Meteor.settings.private.mailPass}@${Meteor.settings.private.mailServer}:${Meteor.settings.private.mailPort}`;
  }
  else {
    console.log('Emails will not be sent until you provide the required information in the settings.json file');
  }
});
