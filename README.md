# GitHub Default Branch

Rename your default branch on GitHub easily. By default it renames `master` to `main`, but is configurable using the `--new` and `--old` flags.

If provided with an `--org` argument, it will run on all repositories within that organisation. Alternatively, you can provide a `--repo` argument to edit a single repo.

For each repo, this tool will:

- Create a new branch at the same commit SHA as the old one
- Update all open pull requests to point at the new branch
- Update the default branch for the repo
- Delete the old branch
- Update [known URL patterns](https://github.com/mheap/github-default-branch/blob/main/src/update-content.js) in source files
- Update any branch protections for `$old` to `$new`. (This does **not** work with patterns, it has to be an exact match)

## Installation

```shell
npm install -g github-default-branch
```

## Development

```shell
git clone https://github.com/mheap/github-default-branch.git
cd github-default-branch
npm ci
```

## Authentication

[Create a personal access token](https://github.com/settings/tokens/new?scopes=repo&description=github-default-branch) with the `repo` scope. This is the value for `<token>` in the examples.

> If you don't want your token to be stored in your shell history, you can set `GITHUB_TOKEN` in the environment and that will be read instead

## Usage

```
# Rename master to main
github-default-branch --pat <token> --repo user/repo

# Rename dev to develop
github-default-branch --pat <token> --repo user/repo --old dev --new develop

# Rename all repos owned by an org
github-default-branch --pat <token> --org my-org-name

# Rename all repos owned by a user
github-default-branch --pat <token> --user my-user
```

Run with the `--verbose` flag to see debug information

## Options

| Flag              | Description                                                    | Default |
| ----------------- | -------------------------------------------------------------- | ------- |
| --pat <token>     | GitHub API Token                                               | N/A     |
| --repo <name>     | The repo to update (format: user/repo)                         | N/A     |
| --user <name>     | Update all repos owned by the provided user (example: my-user) | N/A     |
| --org <name>      | Update all repos in the provided org (example: my-org-name)    | N/A     |
| --keep-old        | Keep the old branch rather than deleting it                    | false   |
| --dry-run         | Output log messages only. Do not make any changes              | false   |
| --list-repos-only | List repos that would be affected, then exit                   | false   |
| --skip-forks      | Skips forked repositories                                      | false   |
| --old             | The name of the branch to rename                               | master  |
| --new             | The new branch name                                            | main    |
| --confirm         | Run without prompting for confirmation                         | false   |

## Replacements

Part of this script checks for the existence of files and updates their contents. Replacements are the mechanism for these updates.

### How it Works

Each .js file in the src/replacements folder is given a chance to run during the content updating step of the script. Each file in src/replacements is expected to export a function, that function receives all of the options that are available to the outmost script.

If there is nothing to replace, then the script moves on to the next replacement.

### How to Add a Replacement

Add a file to src/replacements with a .js extension

Like this:

```javascript
module.exports = function ({
  owner, // string - repo owner
  repo, // string - repo name
  old, // string - old branch name
  target, // string - new branch name
  octokit, // Octokit - oktokit instance
  verbose, // boolean - verbose flag
  isDryRun, // boolean - dry run flag
}) {
  // code goes here
  return {
    path: "<path to file in repo>",
    replacements: [
      {
        from: "<from pattern>",
        to: "<to pattern>",
      },
      {
        from: "<from pattern>",
        to: "<to pattern>",
      },
    ],
  };
};
```

The file with the path in your repo will have any line matching `from` be swapped out with `to`

### Known Issues

The replacement system gives you octokit, that's great! Unfortunately replacement functions do not currently support asynchronous calls, that's bad.
