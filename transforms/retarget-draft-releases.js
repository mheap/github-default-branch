module.exports = async function ({
  owner,
  repo,
  old,
  target,
  dryRun,
  log,
  octokit,
}) {
  log = log.extend("transforms:retarget-draft-releases");

  log("Fetching all draft releases");
  // List all PRs
  let releases = await octokit.paginate(
    "GET /repos/:owner/:repo/releases",
    {
      owner,
      repo,
      per_page: 100,
    },
    (response) => response.data
  );
  log(`Found [${releases.length}] releases`);

  if (releases.length == 0) {
    log(`No releases found. Exiting`);
    return;
  }

  // Filter down to draft releases
  releases = releases.filter((r) => r.draft);
  if (releases.length === 0) {
    log(`No draft releases found. Exiting`);
    return;
  }

  // Update the target branch for all open PRs
  for (let release of releases) {
    if (release.target_commitish != old) {
      log(`Skipping [${release.name}] as it didn't target [${old}]`);
      continue;
    }

    log(
      `Updating release [${release.name}] in [${repo}] from [${release.target_commitish}] to [${target}]`
    );

    if (!dryRun) {
      await octokit.repos.updateRelease({
        owner,
        repo,
        release_id: release.id,
        target_commitish: target,
        tag_name: release.tag_name,
      });
    }
  }
};
