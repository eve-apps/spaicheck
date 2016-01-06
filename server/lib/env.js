Meteor.startup(function () {
  if (mailUser !== 'undefined' && mailPass !== 'undefined' && mailServer !== 'undefined' && mailPort !== 'undefined') {
    console.log("Vars Set");
    process.env.MAIL_URL = "smtp://" + mailUser + ":" + mailPass + "@" + mailServer + ":" + mailPort;
  }
  else {
    console.log("Emails will not be sent until you provide the required information in the server/private.tmpl.js file");
  }
});
