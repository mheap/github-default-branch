module.exports = async function (args, octokit) {
  if (args.repo) {
    return [args.repo];
  }

  let repos;
  if (args.org) {
    ({ data: repos } = await octokit.repos.listForOrg({
      org: args.org,
    }));
  }

  if (args.user) {
    ({ data: repos } = await octokit.repos.listForAuthenticatedUser());

    // Filter down to repos owned by the provided user
    // This is different to using affiliation: owner as it allows
    // the consumer to update repos that they have admin access to
    // but do not own
    repos = repos.filter((repo) => repo.owner.login == args.user);
  }

  return repos.map((repo) => repo.full_name);
};
