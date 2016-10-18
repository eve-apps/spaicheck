export const isVCode = vCode => /[a-zA-Z0-9]{1,64}/.test(vCode);

export const capVCode = (vCode) => {
  if (!isVCode(vCode)) return null;
  if (vCode.length <= 19) return vCode;
  return `${vCode.slice(0, 8)}...${vCode.slice(-8)}`;
};
