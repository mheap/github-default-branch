module.exports = async function (owner, repo, branch, octokit) {
  try {
    await octokit.git.deleteRef({
      owner,
      repo,
      ref: `heads/${branch}`,
    });
  } catch (e) {
    console.log(e);
    console.log("ERROR DELETING MASTER");
  }
};
