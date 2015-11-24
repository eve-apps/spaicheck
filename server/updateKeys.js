Meteor.startup(function () {
  // Run initial startup check on all Keys
  Meteor.call('runChecks', function (err, result) {
    console.log("Cached Until: " + result);
  });
  // Run validation checks on all keys every 6 minutes
  Meteor.setInterval(function () {
    Meteor.call('runChecks');
  }, 360000);
});

Meteor.methods({
  runChecks: function () {
    // Fetch all keys from the database and validate them
    let curKeys = Keys.find().fetch();
    let curTimeout = 0;
    var cachedUntil = null;
    for (let i=0; i < curKeys.length; i++) {
      // Limit calls to 30 per second by staggering them by 1 30th of a second
      Meteor.setTimeout(function () {
        let fnStart = new Date();

        Meteor.call('validateKey', curKeys[i].keyID, curKeys[i].vCode, function (err, result) {
          if (err) {
            //console.log(err);
            // TODO: Handle changes since last check of key
          }
          else {
            //console.log(result);
            // TODO: Handle changes since last check of key
            cachedUntil = result.cachedUntil;
          }

          let fnEnd = new Date();
          let fnDelta = fnEnd - fnStart;
          console.log("Call #" + i + " has returned in " + fnDelta + " milliseconds. ");
          if (i == curKeys.length -1) console.log("Cached Until: " + cachedUntil);
        });
      }, curTimeout += Math.ceil(1000/30));

      console.log("Key #" + i + " set to run in " + curTimeout + " milliseconds.");
    }

    return cachedUntil;
  }
});