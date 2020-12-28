module.exports = async function ({
  owner,
  repo,
  old,
  target,
  octokit,
  log,
  dryRun,
}) {
  log = log.extend("transforms:github-pages");

  log("Updating GitHub Pages config");

  try {
    const {
      data: { source },
    } = await octokit.repos.getPages({
      owner,
      repo,
    });

    if (source.branch != old) {
      log(
        `Skipping GitHub pages as [${source.branch}] does not match [${old}]`
      );
      return;
    }

    source.branch = target;

    if (!dryRun) {
      await octokit.repos.updateInformationAboutPagesSite({
        owner,
        repo,
        source,
      });
    }

    log(
      `Updated GitHub pages from [${old}] to [${target}] with path [${source.path}]`
    );
  } catch (e) {
    if (e.status === 404) {
      log(`No GitHub Pages found for [${owner}/${repo}]`);
      return;
    }
    throw e;
  }
};
