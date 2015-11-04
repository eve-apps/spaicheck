'use strict';

const serializeError = require('serialize-error');
const eveonlinejs = require('eveonlinejs');
eveonlinejs.setCache(new eveonlinejs.cache.FileCache({path: './cache'}));

function validateKey (keyID, vCode, callback) {
  eveonlinejs.fetch('account:APIKeyInfo', {keyID: keyID, vCode: vCode}, function (err, result) {
    if (err) {
      if (err.response && err.response.statusCode !== 200) {
        switch (err.response.statusCode) {
          case 403:
            return callback(null, {'ok': false, 'reason': 'Key is expired or invalid.'});
          default:
            return callback(err, {'ok': false, 'reason': 'Connection error.', 'error': serializeError(err)});
        }
      } else {
        return callback(err, {'ok': false, 'reason': 'Internal error.', 'error': serializeError(err)});
      }
    }

    if (result.type !== 'Account') return callback(null, {'ok': false, 'reason': 'Key does not include all characters.'});
    if (result.accessMask !== '1073741823') return callback(null, {'ok': false, 'reason': 'Access mask ' + result.accessMask + ' does not provide full access.'});
    if (result.expires !== '') return callback(null, {'ok': false, 'reason': 'Key will expire ' + result.expires});
    callback(null, {'ok': true, 'reason': 'Key has passed all validation checks.'});
  });
}

// Export validation function for use in app
module.exports = validateKey;

// CRON mode
if (process.argv) {
  // Connect to database
  let db = require('mongoose');
  db.connect('mongodb://127.0.0.1:3001/meteor');
  let keysModel = db.model('key', new db.Schema({vCode: String, keyID: String}, {strict: false}));

  // Create async queue
  let async = require('async');
  let q = async.queue(function (key, callback) {
    validateKey(key.keyID, key.vCode, function (err, status) {
      console.log('keyID:', key.keyID);
      console.log('vCode:', key.vCode);
      console.log('status:', status);
      callback(err);
    });
  }, 3);
  q.drain = function () {
    db.connection.close();
    console.log('Keys validated.');
  };

  // Validate keys
  keysModel.find({}, function (err, keys) {
    if (err) throw err;
    // Push keys into validation queue
    q.push(keys);
  });
}
