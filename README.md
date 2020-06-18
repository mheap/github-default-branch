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

```bash
npm install -g github-default-branch
```

## Authentication

[Create a personal access token](https://github.com/settings/tokens/new) with the `repo` scope. This is the value for `<token>` in the examples.

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
