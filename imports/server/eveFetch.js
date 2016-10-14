import denodeify from '/imports/shared/denodeify';
import eveonlinejs from 'eveonlinejs';

// MemoryCache because FileCache was having trouble creating files/dirs(using Node) from within Meteor
eveonlinejs.setCache(new eveonlinejs.cache.MemoryCache());
export const eveFetch = denodeify(eveonlinejs.fetch.bind(eveonlinejs));
export { eveonlinejs };
