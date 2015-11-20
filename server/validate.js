/* global Meteor Async */
'use strict';
const serializeError = Meteor.npmRequire('serialize-error');
const eveonlinejs = Meteor.npmRequire('eveonlinejs');
eveonlinejs.setCache(new eveonlinejs.cache.MemoryCache());

Meteor.methods({
  'validateKey': function validateKey (keyID, vCode) {
    let result = Async.runSync(function (done) {
      eveonlinejs.fetch('account:APIKeyInfo', {keyID: keyID, vCode: vCode}, function (err, result) {
        let status = {'ok': true, 'reasons': [], lastChecked: null, error: null};

        if (err) {
          if (err.code) {
            switch (err.code) {
              case 203:
                status.reasons = ['KeyID and/or vCode is invalid.'];
                break;
              case 222:
                status.reasons = ['Key has expired.'];
                status.lastChecked = new Date(err.currentTime);
                status.ok = false;
                return done(null, status);
              default:
                status.reasons = ['Unhandled API error code: ' + err.code];
            }
            status.lastChecked = new Date(err.currentTime); // TODO: handle time zone
          } else if (err.response) {
            status.reasons = ['Connection error.'];
            status.error = serializeError(err);
            status.lastChecked = new Date();
          } else {
            status.reasons = ['Internal error.'];
            status.error = serializeError(err);
            status.lastChecked = new Date();
          }
          status.ok = false;
          return done(status);
        }

        if (result.type !== 'Account') {
          status.ok = false;
          status.reasons.push('Key does not include all characters.');
        }
        if (result.accessMask !== '1073741823') {
          status.ok = false;
          status.reasons.push('Access mask ' + result.accessMask + ' does not provide full access.');
        }
        if (result.expires !== '') {
          status.ok = false;
          status.reasons.push('Key will expire ' + result.expires);
        }
        if (status.ok) {
          status.reasons = 'Key has passed all validation checks.';
        }

        status.lastChecked = new Date(result.currentTime);
        done(null, status);
      });
    });

    return result;
  }
});
