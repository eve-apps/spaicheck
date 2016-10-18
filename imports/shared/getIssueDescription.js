/* global Assets: true */

const varRegex = /\$\{([a-zA-Z_][0-9a-zA-Z_]*)\}/g;
const formatString = (str, values) =>
  (str === '' ? '' : str.replace(varRegex, (match, varName) => values[varName]));

const issueDescsPath = 'issueDescriptions.json';
const issueDescs = (() => {
  try {
    return JSON.parse(Assets.getText(issueDescsPath));
  } catch (error) {
    console.error(`Error parsing issue descriptions:\n${error.stack}`);
    return {};
  }
})();

const getIssueDescription = (issueName, firstCheck, issueData = {}) => {
  const fallbackDesc = `<missing description for issue "${issueName}">`;
  const rootIssueDesc = issueDescs[issueName];
  if (rootIssueDesc == null) return fallbackDesc;

  // If there is only one description for the issue, return it
  if (typeof rootIssueDesc === 'string') return formatString(rootIssueDesc, issueData);

  // Otherwise, return the correct issue description depending on the context
  const issueDesc = rootIssueDesc[firstCheck ? 'first' : 'change'];
  if (issueDesc == null) return fallbackDesc;

  return formatString(issueDesc, issueData);
};

export default getIssueDescription;
