import { BrowserPolicy } from 'meteor/browser-policy-common';

BrowserPolicy.framing.disallow();
BrowserPolicy.content.disallowEval();
BrowserPolicy.content.allowInlineStyles();
BrowserPolicy.content.allowFontDataUrl();

const trusted = [
  '*.google-analytics.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  '*.eveonline.com',
];

for (let origin of trusted) {
  origin = `https://${origin}`;
  BrowserPolicy.content.allowOriginForAll(origin);
}
