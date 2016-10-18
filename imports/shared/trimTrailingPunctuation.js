const trimTrailingPunctuation = (str, m = false) =>
  str.replace(new RegExp('[?!.,](?=$)', `g${(m ? 'm' : '')}`), '');

export default trimTrailingPunctuation;
