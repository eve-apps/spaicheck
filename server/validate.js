/* global Meteor Async */
'use strict';
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
                err.errorType = 'MALFORMEDKEY'
                break;
              case '222':
                err.reason = 'Key has expired or been deleted.';
                err.errorType = 'INVALIDKEY'
                break;
              default:
                err.reason = 'Unhandled API error code: ' + err.code;
            }
          } else if (err.response) {
            err.reason = 'Connection error.';
            err.errorType = 'GENERIC'
          } else {
            err.reason = 'Internal error.';
            err.errorType = 'GENERIC'
          }
          // Return error object and null result object
          return done(err, null);
        }
        // Save info returned for key as object for later diffing
        // Omit Date type fields as they'd trigger constant changes
        // keyData = _.omit(result, ['currentTime', 'cachedUntil']);

        // Anything not considered an error should have a statusFlags property
        let statusFlags = [];

        // Handle specific corporation requirements here
        if (result.type !== 'Account') statusFlags.push('SINGLECHAR');
        if (result.accessMask !== '1073741823') statusFlags.push('BADMASK');
        if (result.expires !== '') statusFlags.push('EXPIRES');

        // If no checks have failed at this point, the key is sufficient to join the corporation
        if (statusFlags[0] == undefined) {
          statusFlags = ['GOOD'];
        }

        done(null, statusFlags);
      });
    });

    // If Async.runSync() returned an error, throw a Meteor.Error containing the reason
    if (result.error) throw new Meteor.Error(result.error.errorType, result.error.reason);
    // If no error was produced, return the "result" property because the API key exists
    return result.result;
  }
});
