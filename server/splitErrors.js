Meteor.methods({
  'splitErrors': function (keyID, vCode, error) {
    for (singleError of error.error.split(', ')) {
      Meteor.call('logKeyError', keyID, vCode, {error: singleError});
    }
  }
})
