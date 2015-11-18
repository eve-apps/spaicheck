var serializeError = Meteor.npmRequire('serialize-error');
var eveonlinejs = Meteor.npmRequire('eveonlinejs');
eveonlinejs.setCache(new eveonlinejs.cache.MemoryCache());

Meteor.methods({
  'validateKey': function validateKey (keyID, vCode) {
    validationResult = Async.runSync(function(done) {
      eveonlinejs.fetch('account:APIKeyInfo', {keyID: keyID, vCode: vCode}, function (err, result) {
        var validationStatus = {'ok': null, 'reasons': []};
        validationStatus.lastChecked = validationStatus.lastChecked || null;

        if (err) {
          if (err.response && err.response.statusCode !== 200) {
            switch (err.response.statusCode) {
              case 403:
                return done(null, {'ok': false, 'reasons': ['Key is expired or invalid.']});
              default:
                return done(err, {'ok': false, 'reasons': ['Connection error.'], 'error': serializeError(err)});
            }
          } else {
            return done(err, {'ok': false, 'reasons': ['Internal error.'], 'error': serializeError(err)});
          }
        }

        if (result.type !== 'Account') {
          validationStatus.ok = false;
          validationStatus.reasons.push('Key does not include all characters.');
        }
        if (result.accessMask !== '1073741823') {
          validationStatus.ok = false;
          validationStatus.reasons.push('Access mask ' + result.accessMask + ' does not provide full access.');
        }
        if (result.expires !== '')
          validationStatus.ok = false;
          validationStatus.reasons.push('Key will expire ' + result.expires);
        if (validationStatus.ok != false) {
          validationStatus.ok = true;
          validationStatus.reasons = ['Key has passed all validation checks.'];
          validationStatus.lastChecked = result.currentTime;
        }

        done(null, validationStatus);
      });
    });

    return validationResult;
  }
});
