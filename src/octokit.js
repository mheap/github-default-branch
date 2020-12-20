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

  // Add Throttling support
  const { throttling } = require("@octokit/plugin-throttling");
  OctokitClass = Octokit.plugin(throttling);

  let octokitArgs = {
    auth: argv.pat || process.env.GITHUB_TOKEN,
    throttle: {
      onRateLimit: (retryAfter, options) => {
        console.error(
          `Request quota exhausted for request ${options.method} ${options.url}`
        );

        // Retry 3 times
        if (options.request.retryCount < 3) {
          console.error(`Retrying after ${retryAfter} seconds!`);
          return true;
        }
      },
      onAbuseLimit: (retryAfter, options, octokit) => {
        // does not retry, only logs a warning
        console.error(
          `Abuse detected for request ${options.method} ${options.url}`
        );
      },
    },
  };

  if (argv.baseUrl) {
    octokitArgs.baseUrl = argv.baseUrl;
  }

  return new OctokitClass(octokitArgs);
};
