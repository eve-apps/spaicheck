##
# Auth
##

# Redirect to /home after logging in
Accounts.onLogin ->
  if not Session.get("loginRedirected")
    FlowRouter.go(FlowRouter.path("home"))
    Session.setAuth("loginRedirected", true)
  return

# Make sure user is logged in when accessing the app
requireAuth = (context, redirect) ->
  if not Meteor.userId() and not Meteor.loggingIn()
    redirect(FlowRouter.path("landing"))
  return

##
# Routes
##

exposed = FlowRouter.group {}
app = FlowRouter.group
  prefix: "/app"
  triggersEnter: [requireAuth]

exposed.route "/",
  name: "landing"
  action: ->
    BlazeLayout.render "landing"

app.route "/home",
  name: "home"
  action: ->
    BlazeLayout.render "dashboard",
      main: "home"
      side: "sidebar"

##
# Templates
##

Template.dashboard.onRendered ->
  $("#dashboard .ui.dropdown").dropdown( action: "nothing" )
  return

Template.dashboard.helpers
  currentCharName: ->
    return Meteor.user()?.profile.eveOnlineCharacterName
  currentCharId: ->
    return Meteor.user()?.profile.eveOnlineCharacterId

Template.dashboard.events
  "click .logout-button": ->
    Meteor.logout ->
      FlowRouter.go(FlowRouter.path("landing"))
      return
    return
  "click .validate-button": ->
    thisKey = Keys.find()
    console.log(thisKey)
    Meteor.call('validateKey', thisKey.keyID, thisKey.vCode, (err, result) ->
      Meteor._debug("Done")
      return)
