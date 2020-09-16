const fs = require("fs");
const replaceAll = require("string.prototype.replaceall");

module.exports = async function (options) {
  options.log = options.log.extend("update-content");
  let { owner, repo, octokit, dryRun, log } = options;

  // Load all replacement files
  const replacementsDir = `${__dirname}/../replacements`;
  const files = fs
    .readdirSync(replacementsDir)
    .filter((f) => f.endsWith(".js"));

  // Build up a map of filename => replacements
  const replacements = await files.reduce(async (acc, next) => {
    acc = await acc;
    const { path, replacements } = await require(`${replacementsDir}/${next}`)(
      options
    );
    return Object.assign(acc, { [path]: replacements });
  }, Promise.resolve({}));

  // Apply all replacements, touching each file once
  for (let path in replacements) {
    try {
      let file = await loadFile(owner, repo, path, octokit);

      let content = file.content;
      for (let r of replacements[path]) {
        content = replaceAll(content, r.from, r.to);
      }

      if (content === file.content) {
        log(`No changes detected in [${path}]`);
        continue;
      }

      log(`Updating [${path}]`);
      if (!dryRun) {
        await writeFile(owner, repo, path, content, file.sha, octokit);
      }
    } catch (e) {
      log(`Unable to update [${path}]`);
    }
  }
};

async function loadFile(owner, repo, path, octokit) {
  const {
    data: { sha, content },
  } = await octokit.repos.getContent({
    owner,
    repo,
    path,
  });

  return {
    sha,
    content: Buffer.from(content, "base64").toString(),
  };
}

async function writeFile(owner, repo, path, content, sha, octokit) {
  const { data: file } = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message: `github-default-branch: Update ${path}`,
    content: Buffer.from(content).toString("base64"),
    sha,
  });

  return file;
}
