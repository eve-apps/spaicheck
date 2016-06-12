/* global Meteor Async */
'use strict';
const eveonlinejs = Meteor.npmRequire('eveonlinejs');

// MemoryCache because FileCache was having trouble creating files/dirs(using Node) from within Meteor
eveonlinejs.setCache(new eveonlinejs.cache.MemoryCache());

Meteor.startup(function () {
  // Run initial startup check on all Keys
  Meteor.call('runChecks');
  // Run validation checks on all keys every 6 minutes
  Meteor.setInterval(function () {
    Meteor.call('runChecks');
  }, 360000);
});

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
          if (!(result.accessMask == '1073741823' || result.accessMask == '4294967295')) statusFlags.push('BADMASK');
          if (result.expires !== '') statusFlags.push('EXPIRES');

          // If no checks have failed at this point, the key is sufficient to join the corporation
          // Prepare the key info for insertion in the db
          if (statusFlags[0] == undefined) done(null, result);
          // According to Meteor docs, the 'error' property of a Meteor.Error object should be a string
          else done({error: statusFlags.join(', ')}, null);
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

    // Remove the 'factionID' and 'factionName' properties from the characters in the API result
    let characters = {};
    _.forOwn(runSyncResult.result.characters, function (character, characterID) {
      characters[characterID] = _.omit(character, ['factionID', 'factionName']);
    });
    runSyncResult.result.characters = characters;

    // If no error was produced, return the "result" property because the API key exists
    return runSyncResult.result;
  },

  'insertKey': function (doc) {
    Meteor.call('validateKey', doc.keyID, doc.vCode, function (err, validationResult) {
      if (err) Meteor.call('logKeyError', doc.keyID, doc.vCode, err);
      else {
        for (let charID in validationResult.characters) {
          if (Characters.findOne({characterID: Number(charID)})) {
            Meteor.call('logKeyError', doc.keyID, doc.vCode, {error: 'EXISTINGKEY'})
            return false;
          }
        }
        doc.resultBody = validationResult;
        Keys.insert(doc, {removeEmptyStrings: false});
        Meteor.call('addKeyCharacters', doc.keyID);
      }
    });
  },

  'insertKeysBulk': function (csvData) {
    const lines = csvData.split('\n');
    lines.shift(); // Discard the column headers, we make our own

    const keyObjs = lines.map((line) => {
      const keyPair = line.split(',');

      return {
        keyID: keyPair[0],
        vCode: keyPair[1]
      }
    });

    let curTimeout = 0;

    keyObjs.forEach((keyObj) => {
      // Limit calls to 30 per second by staggering them by 1 30th of a second
      Meteor.setTimeout(function () {
        Meteor.call('insertKey', keyObj);
      // }, curTimeout += Math.ceil(1000/30));
    }, curTimeout += Math.ceil(1000/5));
    });
  },

  'removeKey': function (keyID) {
    Changes.remove({keyID: keyID});
    Characters.remove({keyID: keyID});
    Keys.remove({keyID: keyID});
  },
  'acceptChanges': function (keyID) {
    console.log('acceptChanges for ' + keyID);
    Changes.remove({keyID: keyID});
  }
});
