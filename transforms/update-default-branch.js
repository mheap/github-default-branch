module.exports = async function ({
  owner,
  repo,
  old,
  target,
  dryRun,
  log,
  octokit,
}) {
  log = log.extend("transforms:update-default-branch");

  log(`Updating default branch to [${target}] in [${repo}]`);

  const {
    data: { default_branch: defaultBranch },
  } = await octokit.repos.get({
    owner,
    repo,
  });

  if (defaultBranch !== old) {
    log(
      `Default branch is not [${old}]. Found [${defaultBranch}]. Not updating default branch`
    );
    return;
  }

  // Update the default branch in the repo
  if (!dryRun) {
    await octokit.repos.update({
      owner,
      repo,
      // The `name` parameter must be included for compatibility with older
      // GitHub Enterprise API versions:
      // https://github.community/t/cannot-change-default-branch/13728/13
      name: repo,
      default_branch: target,
    });
    log(`Updated default branch for [${repo}]`);
  }
};
