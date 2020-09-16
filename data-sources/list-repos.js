module.exports = async function ({ log, org, repo, user, skipForks, octokit }) {
  log = log.extend("data:list-repos");

  if (repo) {
    log(`Using provided repo: ${repo}`);
    return { repos: [repo] };
  }

  let repos = [];
  if (org) {
    log(`Fetching repos for org: ${org}`);
    repos = await octokit.paginate(
      octokit.repos.listForOrg,
      {
        org,
        per_page: 100,
      },
      (response) => response.data
    );
  }

  if (user) {
    log(`Fetching repos for user: ${user}`);
    repos = await octokit.paginate(
      octokit.repos.listForAuthenticatedUser,
      {
        per_page: 100,
      },
      (response) => response.data
    );

    // Filter down to repos owned by the provided user
    // This is different to using affiliation: owner as affiliation
    // allows the consumer to update repos that they have admin
    // access to but do not own
    repos = repos.filter((repo) => repo.owner.login == user);
  }

  if (skipForks) {
    repos = repos.filter((repo) => {
      if (repo.fork) {
        log(`Skipping forked repo: ${repo.full_name}`);
      }
      return !repo.fork;
    });
  }

  // Filter out archived repos as we cannot write to them
  repos = repos.filter((repo) => {
    if (repo.archived) {
      log(`Skipping archived repo: ${repo.full_name}`);
    }
    return !repo.archived;
  });

  return {
    repos: repos.map((repo) => repo.full_name),
  };
};
