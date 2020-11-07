const { Octokit } = require("@octokit/rest");
module.exports = (argv) => {
  argv = argv || {};

  let OctokitClass = Octokit;
  if (argv.enterpriseCompatibility) {
    const {
      enterpriseCompatibility,
    } = require("@octokit/plugin-enterprise-compatibility");
    OctokitClass = Octokit.plugin(enterpriseCompatibility);
  }

  let octokitArgs = {
    auth: argv.pat || process.env.GITHUB_TOKEN,
  };

  if (argv.baseUrl) {
    octokitArgs.baseUrl = argv.baseUrl;
  }

  return new OctokitClass(octokitArgs);
};
