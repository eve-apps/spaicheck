var serializeError = Meteor.npmRequire('serialize-error');
var eveonlinejs = Meteor.npmRequire('eveonlinejs');
eveonlinejs.setCache(new eveonlinejs.cache.FileCache({path: './cache'}));

Meteor.methods({
  'validateKey': function validateKey (keyID, vCode) {


    validationResult = Async.runSync(function(done) {
      eveonlinejs.fetch('account:APIKeyInfo', {keyID: keyID, vCode: vCode}, function (err, result) {

        if (err) {
          if (err.response && err.response.statusCode !== 200) {
            switch (err.response.statusCode) {
              case 403:
                return done(null, {'ok': false, 'reason': 'Key is expired or invalid.'});
              default:
                return done(err, {'ok': false, 'reason': 'Connection error.', 'error': serializeError(err)});
            }
          } else {
            return done(err, {'ok': false, 'reason': 'Internal error.', 'error': serializeError(err)});
          }
        }

        if (result.type !== 'Account') return done(null, {'ok': false, 'reason': 'Key does not include all characters.'});
        if (result.accessMask !== '1073741823') return done(null, {'ok': false, 'reason': 'Access mask ' + result.accessMask + ' does not provide full access.'});
        if (result.expires !== '') return done(null, {'ok': false, 'reason': 'Key will expire ' + result.expires});
        done(null, {'ok': true, 'reason': 'Key has passed all validation checks.'});
      });
    });

    return validationResult;
  }
});
