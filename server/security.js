BrowserPolicy.framing.disallow();
//BrowserPolicy.content.disallowInlineScripts()
BrowserPolicy.content.disallowEval();
BrowserPolicy.content.allowInlineStyles();
BrowserPolicy.content.allowFontDataUrl();

let trustedOrigins = [
  "*.google-analytics.com",
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "*.eveonline.com"
];

_.each(trustedOrigins, function (to) {
  BrowserPolicy.content.allowOriginForAll("https://" + to);
});

Security.defineMethod("ifOnWhitelist", {
  fetch: [],
  transform: null,
  deny: function (type, arg, userID, doc, fields, modifier) {
    let res =  Meteor.user() ? !Whitelist.findOne({characterID: String(Meteor.user().profile.eveOnlineCharacterId)}) : true;
    console.log("SECURITY - WHITELIST:", (res ? "DENY" : "ALLOW"), userID, type, doc, fields, modifier);
    return res;
  }
});

Security.defineMethod("ifAdmin", {
  fetch: [],
  transform: null,
  deny: function (type, arg, userID, doc, fields, modifier) {
    let res =  Meteor.user() ? Meteor.user().profile.eveOnlineCharacterId !== Meteor.call('adminID') : true;
    console.log("SECURITY - ADMIN:", (res ? "DENY" : "ALLOW"), userID, type, doc, fields, modifier);
    return res;
  }
});

Security.permit(["insert", "update", "remove"]).collections([Changes, Characters, Errors, Keys, Whitelist]).ifOnWhitelist().apply();
Security.permit(["insert", "update", "remove"]).collections([Changes, Characters, Errors, Keys, Whitelist]).ifAdmin().apply();
