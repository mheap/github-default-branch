module.exports = async function ({ owner, repo, old, octokit, log, dryRun }) {
  log = log.extend("transforms:delete-old-branch");
  try {
    if (!dryRun) {
      await octokit.git.deleteRef({
        owner,
        repo,
        ref: `heads/${old}`,
      });
    }
    log(`Deleted [${old}] branch`);
  } catch (e) {
    console.log(e);
    log(`Error deleting [${old}]`);
  }
};
