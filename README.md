# GitHub Default Branch

Rename your default branch on GitHub easily. By default it renames `master` to `main`, but is configurable using the `--new` and `--old` flags.

If provided with an `--org` argument, it will run on all repositories within that organisation. Alternatively, you can provide a `--repo` argument to edit a single repo.

For each repo, this tool will:

- Create a new branch at the same commit SHA as the old one
- Update all open pull requests to point at the new branch
- Update the default branch for the repo
- Delete the old branch

## Installation

```bash
npm install -g github-default-branch
```

## Authentication

[Create a personal access token](https://github.com/settings/tokens/new) with the `repo` scope. This is the value for `<token>` in the examples

## Usage

```
# Rename master to main
github-default-branch --pat <token> --repo user/repo

# Rename dev to develop
github-default-branch --pat <token> --repo user/repo --old dev --new develop
```

Run with the `--verbose` flag to see debug information

## Options

| Flag          | Description                                                    | Default |
| ------------- | -------------------------------------------------------------- | ------- |
| --pat <token> | GitHub API Token                                               | N/A     |
| --repo <name> | The repo to update (format: user/repo)                         | N/A     |
| --user <name> | Update all repos owned by the provided user (example: my-user) | N/A     |
| --org <name>  | Update all repos in the provided org (example: my-org-name)    | N/A     |
| --keep-old    |                                                                | false   |
| --old         | The name of the branch to rename                               | master  |
| --new         | The new branch name                                            | main    |

## Enhancements

- Error if the target branch already exists
- `--visibility` flag (`all`, `public`, `private`). Default `all`
- Copy branch protections from the old branch to the new one
