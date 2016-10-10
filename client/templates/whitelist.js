'use strict';

import {_} from '/imports/shared/globals';

Template.whitelist.onRendered(function () {
  $('#whitelist-table .ui.checkbox').checkbox({});
});

Template.whitelist.helpers({
  whitelist: function () {
    return Whitelist.find({});
  },
  email: function () {
    const email = this.emailAddress ? this.emailAddress : 'NO EMAIL FOUND';
    return email;
  },
  setCheckboxState: function (id, emailAddress, notify) {
    Tracker.afterFlush(function () {
      const cb = $(`.email-notify:has(input[id="${id}"])`);

      if (!emailAddress) cb.checkbox("set disabled");
      else if (notify) cb.checkbox("set checked");
      else cb.checkbox("set unchecked");
    });
  }
});

Template.whitelist.events({
  'click .rm-member': function () {
    Whitelist.remove(this._id);
  },
  'click .email-notify': function () {
    if (this.notify != undefined) {
      Whitelist.update(this._id, {$set: {notify: !this.notify}});
    }
  }
});
