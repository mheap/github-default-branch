const replaceAll = require("string.prototype.replaceall");

module.exports = async function (
  owner,
  repo,
  old,
  target,
  octokit,
  isVerbose,
  isDryRun
) {
  const replacements = {
    "README.md": [
      {
        from: `@${old}`,
        to: `@${target}`,
      },
      {
        from: `${owner}/${repo}.svg?branch=${old}`,
        to: `${owner}/${repo}.svg?branch=${target}`,
      },
    ],
  };

  for (let path in replacements) {
    try {
      let file = await loadFile(owner, repo, path, octokit);

      let content = file.content;
      for (let r of replacements[path]) {
        var re = new RegExp(r.from, "g");
        content = replaceAll(content, r.from, r.to);
      }

      if (content !== file.content) {
        if (isVerbose) {
          console.log(`✏️  Updating [${path}]`);
        }
        if (!isDryRun) {
          const r = await writeFile(
            owner,
            repo,
            path,
            content,
            file.sha,
            octokit
          );
        }
      } else {
        if (isVerbose) {
          console.log(`✏️  No changes detected in [${path}]`);
        }
      }
    } catch (e) {
      console.log(e);
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
