

import Whitelist from '/imports/api/whitelist/Whitelist';

Template.whitelist.onRendered(() => {
  $('#whitelist-table .ui.checkbox').checkbox({});
});

Template.whitelist.helpers({
  whitelist() {
    return Whitelist.find({});
  },
  email() {
    const email = this.emailAddress ? this.emailAddress : 'NO EMAIL FOUND';
    return email;
  },
  setCheckboxState(id, emailAddress, notify) {
    Tracker.afterFlush(() => {
      const cb = $(`.email-notify:has(input[id="${id}"])`);

      if (!emailAddress) cb.checkbox('set disabled');
      else if (notify) cb.checkbox('set checked');
      else cb.checkbox('set unchecked');
    });
  },
});

Template.whitelist.events({
  'click .rm-member': function () {
    Whitelist.remove(this._id);
  },
  'click .email-notify': function () {
    if (this.notify != undefined) {
      Whitelist.update(this._id, { $set: { notify: !this.notify } });
    }
  },
});
