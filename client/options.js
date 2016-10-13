

// TODO: Import Session

Meteor.startup(() => {
  const defaultOptions = {
    useEveDurations: false,
  };

  // Load session variables
  Session.setDefault('useEveDurations', defaultOptions.useEveDurations);
});
