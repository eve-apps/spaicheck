const describeKey = (key) => {
  if (key.primaryChar != null && key.primaryChar !== '') {
    return `${key.primaryChar}'s key`;
  }
  return `key with keyID ${key.keyID}`;
};

export default describeKey;
