/* global Meteor Async */
'use strict';
const serializeError = Meteor.npmRequire('serialize-error');
const eveonlinejs = Meteor.npmRequire('eveonlinejs');
eveonlinejs.setCache(new eveonlinejs.cache.MemoryCache());

Meteor.methods({
  'validateKey': function (keyID, vCode) {
    let result = Async.runSync(function (done) {
      eveonlinejs.fetch('account:APIKeyInfo', {keyID: keyID, vCode: vCode}, function (err, result) {

        if (err) {
          if (err.code) {
            switch (err.code) {
              case '203':
                err.reason = 'KeyID and/or vCode is invalid.';
                break;
              case '222':
                err.reason = 'Key has expired.';
                break;
              default:
                err.reason = 'Unhandled API error code: ' + err.code;
            }
          } else if (err.response) {
            err.reason = 'Connection error.';
          } else {
            err.reason = 'Internal error.';
          }
          return done(err, null);
        }

        let status = {'ok': true, 'reasons': [], lastChecked: null, error: null};
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
          status.reasons = ['Key has passed all validation checks.'];
        }

        status.lastChecked = new Date(result.currentTime);
        done(null, status);
      });
    });
    if (result.error) throw new Meteor.Error("eve-api", result.error.reason);
    return result;
  }
});
