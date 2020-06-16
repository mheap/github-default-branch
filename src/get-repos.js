module.exports = async function (args, octokit) {
  if (args.repo) {
    return [args.repo];
  }

  let repos = [];
  if (args.org) {
    for await (const response of octokit.paginate.iterator(octokit.repos.listForOrg, { org: args.org })) {
      repos = repos.concat(response.data);
    }
  }

  if (args.user) {
    for await (const response of octokit.paginate.iterator(octokit.repos.listForAuthenticatedUser)) {
      repos = repos.concat(response.data);
    }

    // Filter down to repos owned by the provided user
    // This is different to using affiliation: owner as it allows
    // the consumer to update repos that they have admin access to
    // but do not own
    repos = repos.filter((repo) => repo.owner.login == args.user);
  }

  if (args.skipForks) {
    repos = repos.filter((repo) => !repo.fork);
  }

  return repos.map((repo) => repo.full_name);
};
