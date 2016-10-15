import { Meteor } from 'meteor/meteor';

import { FlowRouter } from 'meteor/kadira:flow-router';

import Whitelist from '/imports/api/whitelist/Whitelist';

import { getUserCharacterId } from '/imports/api/whitelist/helpers';

// Redirect to home page if user gets removed from whitelist
let whitelistWatch;

export const disableWhitelistWatch = () => {
  if (whitelistWatch) {
    // TODO: Check if this actually works
    whitelistWatch.stop();
  }

  whitelistWatch = null;
};

export const enableWhitelistWatch = () => {
  if (whitelistWatch) disableWhitelistWatch();

  whitelistWatch = Whitelist.find({
    characterID: String(getUserCharacterId(Meteor.userId())),
  }).observe({
    removed () {
      FlowRouter.go('landing');
    },
  });
};
