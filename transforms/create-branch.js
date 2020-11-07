module.exports = async function ({
  log,
  owner,
  repo,
  target,
  sha,
  octokit,
  dryRun,
}) {
  log = log.extend("transforms:create-branch");

  log(`Creating branch [${target}]`);
  try {
    // No action if the branch already exists
    await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${target}`,
    });
    log(`Branch [${target}] already exists`);
  } catch (e) {
    if (e.status == 404) {
      log(`Branch [${target}] not found`);
      if (!dryRun) {
        // Otherwise create it
        await octokit.git.createRef({
          owner,
          repo,
          ref: `refs/heads/${target}`,
          sha,
        });
      }
      log(`Branch [${target}] created`);
      return;
    }

    log("API Error");
    throw e;
  }
};
