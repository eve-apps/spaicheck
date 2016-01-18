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
    let runSyncResult = Async.runSync(function (done) {
      eveonlinejs.fetch('account:APIKeyInfo', {keyID: keyID, vCode: vCode}, function (err, result) {
        if (result) {
          // Even though eojs considers key valid, we still need to implement our custom checks
          let statusFlags = [];

          // Handle specific corporation requirements here
          if (result.type == 'Character') statusFlags.push('SINGLECHAR');
          if (result.type == 'Corporation') statusFlags.push('CORPKEY');
          if (result.accessMask !== '1073741823') statusFlags.push('BADMASK');
          if (result.expires !== '') statusFlags.push('EXPIRES');

          // If no checks have failed at this point, the key is sufficient to join the corporation
          // Prepare the key info for insertion in the db
          if (statusFlags[0] == undefined) {
            let keyObject = {
              keyID: keyID,
              vCode: vCode,
              resultBody: result
            }
            done(null, keyObject);
          }
          else {
            // According to Meteor docs, the 'error' property of a Meteor.Error object should be a string
            done({error: statusFlags.join(', ')}, null);
          }
        }
        // Anything returned as an err object by the API call is returned as err to be thrown as a Meteor.Error
        if (err) {
          // Handle specific error codes here
          if (err.code) {
            switch (err.code) {
              case '203':
                err.error = 'MALFORMEDKEY';
                break;
              case '222':
                err.error = 'INVALIDKEY';
                break;
              default:
                err.error = 'UNHANDLED';
            }
          }
          else if (err.response) err.error = 'CONNERR';
          else err.error = 'INTERNAL';

          // Return error object and null result object
          done(err, null);
        }
      });
    });

    // If Async.runSync() returned an error, throw a Meteor.Error containing the reason
    if (runSyncResult.error) throw new Meteor.Error(runSyncResult.error.error);

    // If no error was produced, return the "result" property because the API key exists
    return runSyncResult.result;
  }
});
