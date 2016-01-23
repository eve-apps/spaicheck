Meteor.methods({
  adminID: function () {
    console.log(Meteor.settings.exposed.adminID);
    return Meteor.settings.exposed.adminID;
  },
  allianceID: function () {
    console.log(Meteor.settings.exposed.allianceID);
    return Meteor.settings.exposed.allianceID;
  },
  corporationID: function () {
    console.log(Meteor.settings.exposed.corporationID);
    return Meteor.settings.exposed.corporationID;
  }
});
