import { Meteor } from 'meteor/meteor';

import _ from 'lodash';

// FIXME: Boolean(Meteor.settings.public) will always return true.
const settingsDefined = () =>
  Boolean(Meteor.settings) &&
  Boolean(Meteor.settings.private) &&
  Boolean(Meteor.settings.public);

// TODO: Check if settings are correctly defined
// const settingsCorrect = () =>

if (settingsDefined()) {
  process.env.ROOT_URL = Meteor.settings.private.rootUrl;

  if (_.every(['mailUser', 'mailPass', 'mailServer', 'mailPort'], mailSetting => Meteor.settings.private[mailSetting] != null)) {
    console.log('Email configured.');
    process.env.MAIL_URL = `smtp://${Meteor.settings.private.mailUser}:${Meteor.settings.private.mailPass}@${Meteor.settings.private.mailServer}:${Meteor.settings.private.mailPort}`;
  } else {
    console.log('Emails will not be sent until you provide the required information in the settings.json file');
  }
} else {
  console.error('No settings defined.');
  process.exit(1);
}
