export const denodeify = Npm.require('es6-denodeify')(Promise);
export const eveonlinejs = Npm.require('eveonlinejs');
export const eveFetch = denodeify(eveonlinejs.fetch);
export const callPromise = denodeify(Meteor.call);
export const jsonPatch = Npm.require('fast-json-patch');
export const humanize = Npm.require('humanize-plus');
