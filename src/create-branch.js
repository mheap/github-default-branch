module.exports = async function (owner, repo, name, sha, octokit) {
  // Check if it already exists
  let branch;
  try {
    ({ data: branch } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${name}`,
    }));
  } catch (e) {}

  // If the branch already exists, return it
  if (branch) {
    return branch;
  }

  // Otherwise create it
  ({ data: branch } = await octokit.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${name}`,
    sha,
  }));

  return branch;
};
