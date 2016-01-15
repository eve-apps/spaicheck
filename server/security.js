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
