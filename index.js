const Octokit = require("./src/octokit");
const log = require("debug")("ghdb");

module.exports = async (argv) => {
  let options = {
    log,
    ...argv,
  };

  options = {
    ...options,
    octokit: Octokit(options),
  };

  const target = options.new;
  options.target = target;

  // Check current rate limit
  await require("./data-sources/check-rate-limit")(options);

  // Load the list of repos to interact with
  const { repos } = await require("./data-sources/list-repos")(options);

  const getBranchSha = require("./data-sources/get-branch-sha");

  // For each repo
  for (let r of repos) {
    log(`Processing ${r}`);

    const [owner, repo] = r.split("/", 2);

    const repoOptions = {
      ...options,
      owner,
      repo,
    };

    // Fetch the old branch sha
    try {
      repoOptions.sha = await getBranchSha(repoOptions);
    } catch (e) {
      // Typically, this will fail when the old branch, i.e. master, doesn't exist.
      log(`Skipping ${r}: ${e.message}`);
      continue;
    }

    // Apply all transforms
    let transforms = [
      "create-branch",
      "update-default-branch",
      "retarget-pull-requests",
      "branch-protection",
      "delete-old-branch",
    ];

    // Remove any disallowed transforms
    transforms = transforms.filter((transform) => {
      const skip = Object.keys(repoOptions).includes(`skip-${transform}`);
      if (skip) {
        log(`Skipping transform [${transform}]`);
      }
      return !skip;
    });

    for (let transform of transforms) {
      await require(`./transforms/${transform}`)(repoOptions);
    }

    // Update all content files
    log("Updating content");
    const updateContent = require("./src/update-content");
    await updateContent(repoOptions);
  }
};
