# GitHub Default Branch

Rename your default branch on GitHub easily. By default it renames `master` to `main`, but is configurable using the `--new` and `--old` flags.

If provided with an `--org` argument, it will run on all repositories within that organisation. Alternatively, you can provide a `--repo` argument to edit a single repo.

For each repo, this tool will:

- Create a new branch at the same commit SHA as the old one
- Update all open pull requests to point at the new branch
- Update the default branch for the repo
- Delete the old branch
- Update [known URL patterns](https://github.com/mheap/github-default-branch/tree/main/replacements) in source files
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

Set `DEBUG="ghdb*"` as an environment variable to see debug information

## Options

| Flag          | Description                                                                                                  | Default |
| ------------- | ------------------------------------------------------------------------------------------------------------ | ------- |
| --pat <token> | GitHub API Token                                                                                             | N/A     |
| --old         | The name of the branch to rename                                                                             | master  |
| --new         | The new branch name                                                                                          | main    |
| --repo <name> | The repo to update (format: user/repo)                                                                       | N/A     |
| --user <name> | Update all repos owned by the provided user (example: my-user)                                               | N/A     |
| --org <name>  | Update all repos in the provided org (example: my-org-name)                                                  | N/A     |
| --team <name> | Update all repos in the provided team (example: my-team-name), only usable in combination with org parameter | N/A     |
| --dry-run     | Output log messages only. Do not make any changes                                                            | false   |
| --skip-forks  | Skips forked repositories                                                                                    | false   |
| --confirm     | Run without prompting for confirmation                                                                       | false   |

## Skipping transforms

You might want to skip any of the available transforms (such as deleting the old branch). You can add `--skip-[transform-name]` to disable the transform e.g. `--skip-delete-old-branch`.

## Available transforms

| Transform              | Description                                           |
| ---------------------- | ----------------------------------------------------- |
| update-default-branch  | Set the default branch of the repo to `$new`          |
| retarget-pull-requests | Change the base for any open pull requests            |
| branch-protection      | Update any branch protection rules to point at `$new` |
| delete-old-branch      | Delete the `$old` branch                              |

Pending transforms:

- Copy branch protections instead of updating if `--skip-delete-old-branch` is used ([#26](https://github.com/mheap/github-default-branch/issues/26))
- Retarget draft releases ([#30](https://github.com/mheap/github-default-branch/issues/30))
- Update GitHub Pages configuration ([#16](https://github.com/mheap/github-default-branch/issues/16))

## Replacements

Part of this script checks for the existence of files and updates their contents. Replacements are the mechanism for these updates.

### How it Works

Each .js file in the `replacements` folder is given a chance to run during the content updating step of the script. Each file in replacements is expected to export a function, that function receives all of the options that are available to the outmost script.

If there is nothing to replace, then the script moves on to the next replacement.

### How to Add a Replacement

Add a file to `replacements` with a .js extension

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
        from: "<from string>",
        to: "<to string>",
      },
      {
        from: "<from string>",
        to: "<to string>",
      },
    ],
  };
};
```

The file with the path in your repo will have any line matching `from` be swapped out with `to`
