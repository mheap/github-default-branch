module.exports = async ({ octokit, log }) => {
  log = log.extend("data:check-rate-limit");
  try {
    const {
      data: {
        rate: { remaining },
      },
    } = await octokit.rateLimit.get();
    log(`You have ${remaining} API requests remaining`);
    return {
      rateLimit: remaining,
    };
  } catch (e) {
    // GitHub Enterprise API versions may not support getting the rate
    // limits, so only log this as a warning, rather than treating errors as
    // fatal.
    log(`⚠️  Unable to determine rate limits: ${e.message}`);
    return {
      rateLimit: null,
    };
  }
};
