import Changes from '/imports/api/changes/Changes';

const getUnreviewedChanges = (keyID) => {
  try {
    let { log, ...c } = Changes.findOne({ keyID });
    // Return only unreviewed logs
    log = log.filter(l => !l.reviewed);
    return [{ log, ...c }];
  } catch (error) {
    // Query returned null
    if (error instanceof TypeError) return [];
    console.error(error.stack);
    return [];
  }
};

export default getUnreviewedChanges;
