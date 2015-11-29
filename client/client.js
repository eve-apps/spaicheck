var app, exposed, requireAuth;

Accounts.onLogin(function() {
  if (!Session.get("loginRedirected")) {
    FlowRouter.go(FlowRouter.path("home"));
    Session.setAuth("loginRedirected", true);
  }
});

requireAuth = function(context, redirect) {
  if (!Meteor.userId() && !Meteor.loggingIn()) {
    redirect(FlowRouter.path("landing"));
  }
};

exposed = FlowRouter.group({});

app = FlowRouter.group({
  prefix: "/app",
  triggersEnter: [requireAuth]
});

exposed.route("/", {
  name: "landing",
  action: function() {
    return BlazeLayout.render("landing");
  }
});

app.route("/home", {
  name: "home",
  action: function() {
    return BlazeLayout.render("dashboard", {
      main: "home",
      side: "sidebar"
    });
  }
});

Template.dashboard.onRendered(function() {
  $("#dashboard .ui.dropdown").dropdown({
    action: "nothing"
  });
});

Template.dashboard.helpers({
  currentCharName: function() {
    var ref;
    return (ref = Meteor.user()) != null ? ref.profile.eveOnlineCharacterName : void 0;
  },
  currentCharId: function() {
    var ref;
    return (ref = Meteor.user()) != null ? ref.profile.eveOnlineCharacterId : void 0;
  }
});

Template.dashboard.events({
  "click .logout-button": function() {
    Meteor.logout(function() {
      FlowRouter.go(FlowRouter.path("landing"));
    });
  },
  "click #side-toggle": function () {
    console.log("clicked");
    let toggleBtn = $('#side-toggle');
    $('.ui.sidebar').sidebar('toggle');
    toggleBtn.toggleClass('out');
    toggleBtn.html(toggleBtn.hasClass('out') ? '<<' : '>>');
  },
  "click .validate-button": function() {
    // Fetch all keys from the database and validate them
    // TODO: Use "Async" library to process these in parallel
    var curKeys = Keys.find().fetch();
    for (i=0; i < curKeys.length; i++) {
      Meteor.call('validateKey', curKeys[i].keyID, curKeys[i].vCode, function(err, result) {
        console.log(result.result);
      });
    }
  }
});
