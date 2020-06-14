module.exports = async function (args, octokit) {
  if (args.repo) {
    return [args.repo];
  }

  const { data: repos } = await octokit.repos.listForOrg({
    org: args.org,
  });

  return repos.map((repo) => repo.full_name);
};
