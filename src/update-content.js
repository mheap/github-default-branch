const fs = require('fs');
const util = require('util');
const replaceAll = require("string.prototype.replaceall");

const ls = util.promisify(fs.readdir);

module.exports = async function (options) {
  const {
    owner,
    repo,
    octokit,
    verbose,
    isDryRun,
  } = options;
  const replacementsDir = `${__dirname}/replacements`;
  const files = (await ls(replacementsDir)).filter((f) => f.endsWith('.js'));
  const replacements = files.reduce((acc, next) => {
    const { path, replacements } = require(`${replacementsDir}/${next}`)(options);
    return Object.assign(acc, { [path]: replacements });
  }, {});
  for (let path in replacements) {
    try {
      let file = await loadFile(owner, repo, path, octokit);

      let content = file.content;
      for (let r of replacements[path]) {
        const re = new RegExp(r.from, "g");
        content = replaceAll(content, re, r.to);
      }

      if (content !== file.content) {
        if (verbose) {
          console.log(`✏️  Updating [${path}]`);
        }
        if (!isDryRun) {
          await writeFile(
            owner,
            repo,
            path,
            content,
            file.sha,
            octokit
          );
        }
      } else {
        if (verbose) {
          console.log(`✏️  No changes detected in [${path}]`);
        }
      }
    } catch (e) {
      if (verbose) {
        console.log(`✏️  Unable to update [${path}]`);
      }
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
