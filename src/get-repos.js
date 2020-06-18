module.exports = async function (args, octokit) {
  if (args.repo) {
    return [args.repo];
  }

  let repos = [];
  if (args.org) {
    repos = await octokit.paginate(
      octokit.repos.listForOrg,
      {
        org: args.org,
        per_page: 100
      },
      (response) => response.data
    );
  }

  if (args.user) {
    repos = await octokit.paginate(
      octokit.repos.listForAuthenticatedUser,
      {
        per_page: 100
      },
      (response) => response.data
    );

    // Filter down to repos owned by the provided user
    // This is different to using affiliation: owner as it allows
    // the consumer to update repos that they have admin access to
    // but do not own
    repos = repos.filter((repo) => repo.owner.login == args.user);
  }

  if (args.skipForks) {
    repos = repos.filter((repo) => !repo.fork);
  }

  // Filter out archived repos as we cannot write to them
  repos = repos.filter((repo) => !repo.archived);

  return repos.map((repo) => repo.full_name);
};
