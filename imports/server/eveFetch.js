import denodeifyModule from 'es6-denodeify';
const denodeify = denodeifyModule(Promise);

import eveonlinejs from 'eveonlinejs';
//const eveonlinejs = Npm.require('eveonlinejs');

// MemoryCache because FileCache was having trouble creating files/dirs(using Node) from within Meteor
eveonlinejs.setCache(new eveonlinejs.cache.MemoryCache());
export const eveFetch = denodeify(eveonlinejs.fetch);
export { eveonlinejs };
