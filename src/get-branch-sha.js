module.exports = async function (owner, repo, old, octokit) {
  try {
    const { data: branch } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${old}`,
    });

    return branch.object.sha;
  } catch (e) {
    if (e.status == 404) {
      throw new Error(`Branch '${old}' doesn't exist`);
    }

    throw e;
  }
};
