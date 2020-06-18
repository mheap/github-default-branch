const Confirm = require("prompt-confirm");

module.exports = async function (cliConfirmed, old, target) {
  if (cliConfirmed) {
    return Promise.resolve(true);
  }

  const message = `This tool will:
* Create a new branch (${target}) at the same commit as ${old}
* Update all pull requests that pointed at ${old} to ${target}
* Replace ${old} with ${target} in README.md
* DELETE THE OLD BRANCH (${old}). Run again with --keep-old to skip this step

Continue?`;

  return new Confirm({
    name: "continue",
    message,
    default: false,
  }).run();
};
