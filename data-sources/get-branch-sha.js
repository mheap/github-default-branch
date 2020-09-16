module.exports = async function ({ owner, repo, old, octokit, log }) {
  log = log.extend("data:get-branch-sha");
  try {
    const { data: branch } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${old}`,
    });

    log(`${owner}/${repo}@${old}: ${branch.object.sha}`);

    return branch.object.sha;
  } catch (e) {
    if (e.status == 404) {
      log(`ERROR: ${owner}/${repo}@${old}: Not found`);
    }

    throw e;
  }
};
