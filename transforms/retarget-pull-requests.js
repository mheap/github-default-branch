module.exports = async function ({
  owner,
  repo,
  old,
  target,
  dryRun,
  log,
  octokit,
}) {
  log = log.extend("transforms:retarget-pull-requests");

  log("Fetching all open pull requests");
  // List all PRs
  let pulls = await octokit.paginate(
    "GET /repos/:owner/:repo/pulls",
    {
      owner,
      repo,
      state: "open",
      per_page: 100,
    },
    (response) => response.data
  );
  log(`Found [${pulls.length}] pull requests`);

  // Update the target branch for all open PRs
  for (let pr of pulls) {
    if (pr.base.ref != old) {
      log(`Skipping [#${pr.number}] as it didn't target [${old}]`);
      continue;
    }

    log(
      `Updating pull request [#${pr.number}] in [${repo}] from [${pr.base.ref}] to [${target}]`
    );

    if (!dryRun) {
      await octokit.pulls.update({
        owner,
        repo,
        pull_number: pr.number,
        base: target,
      });
    }
  }
};
