import Changes from '/imports/api/changes/Changes';

const getUnreviewedChanges = (keyID) => {
  let { log, ...c } = Changes.findOne({ keyID });
  // Return only unreviewed logs
  log = log.filter(l => !l.reviewed);
  return [{ log, ...c }];
};

export default getUnreviewedChanges;
