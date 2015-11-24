/* global Meteor Async */
'use strict';
const serializeError = Meteor.npmRequire('serialize-error'); //Do we really need this?
const eveonlinejs = Meteor.npmRequire('eveonlinejs');

// MemoryCache because FileCache was having trouble creating files/dirs(using Node) from within Meteor
eveonlinejs.setCache(new eveonlinejs.cache.MemoryCache());

Meteor.methods({
  // Wrapped to run synchronously using meteorhacks:npm's Async package
  'validateKey': function (keyID, vCode) {
    // "result" will be an object containing an "error" property and a "result" property
    // If there was an error, "result" will be undefined, otherwise "error" will be undefined
    let result = Async.runSync(function (done) {
      eveonlinejs.fetch('account:APIKeyInfo', {keyID: keyID, vCode: vCode}, function (err, result) {

        // Anything returned as an err object by the API call is returned as err to be thrown as a Meteor.Error
        if (err) {
          // Handle specific error codes here
          if (err.code) {
            switch (err.code) {
              case '203':
                err.reason = 'KeyID and/or vCode is invalid.';
                break;
              case '222':
                err.reason = 'Key has expired or been deleted.';
                break;
              default:
                err.reason = 'Unhandled API error code: ' + err.code;
            }
          } else if (err.response) {
            err.reason = 'Connection error.';
          } else {
            err.reason = 'Internal error.';
          }
          // Return error object and null result object
          return done(err, null);
        }

        // Anything not considered an error should have a status property
        let status = {'ok': true, 'reasons': [], lastChecked: null};

        // Handle specific corporation requirements here
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

        // If no checks have failed at this point, the key is sufficient to join the corporation
        if (status.ok) {
          status.reasons = ['Key has passed all validation checks.'];
        }

        // lastChecked may be unecessary since we plan on running checks automatically
        status.lastChecked = new Date(result.currentTime);
        //console.log("Cached Until: " + result.cachedUntil);
        status.cachedUntil = result.cachedUntil;
        done(null, status);
      });
    });

    // If Async.runSync() returned an error, throw a Meteor.Error containing the reason
    if (result.error) throw new Meteor.Error("eve-api", result.error.reason);
    // If no error was produced, return the "result" property because the API key exists
    return result.result;
  }
});
