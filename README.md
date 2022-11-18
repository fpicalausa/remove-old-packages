# Remove Stale Branches

This Github Action will identify old packages and remove them

By default, packages are identified as stale if they were created more than 90 days ago.
This is useful to avoid free up space used by your github packages.

# How it works?

This Action look for all the versions of a given package in a given organization.
If the package is old, and is not one of the latest versions, it will remove it.

## ⚠️💣 CAUTION

Without setting `dry_run: true`, this action will remove packages. Consider setting `dry_run: true` until you are happy with how this action works.

## Inputs

| Input                        | Defaults                      | Description                                                                                  |
|------------------------------|-------------------------------|----------------------------------------------------------------------------------------------|
| `package-name`               |                               | The package for which old version will be removed                                            |
| `github-token`               | `${{ secrets.GITHUB_TOKEN }}` | PAT for GitHub API authentication.                                                           |
| `dry-run`                    | `false`                       | Flag that prevents this action from doing any modification to the repository.                |
| `operations-per-run`         | 10                            | Maximum number of stale branches to look at in any run of this action.                       |
| `days-before-package-is-old` | 90                            | A package will be candidate for removal this many days after it was created                  |
| `protect-latest-n-versions`  | 2                             | The latest N versions of a package will never be candidate for removal, even if they are old |

## Example usage

The follow examples show how you can use this action.

### Default configuration

This configuration will remove packages after 90 days, if they aren't the latest 2 remaining.

```yml
on:
  schedule:
    - cron: "0 0 * * *" # Everday at midnight

jobs:
  remove-old-package:
    name: Remove Old Packcages
    runs-on: ubuntu-latest
    steps:
      - uses: fpicalausa/remove-old-packages@v0.0.1
        with:
          package-name: 'my-package'
          dry-run: true # Check out the console output before setting this to false
```

# Development & Build

To start, install dependencies with `npm install`. The source files live under `src`.

You can run the tool locally with `ts-node src/cli.ts` 🖥️

To deploy you changes, start a PR. Don't forget to run `npm build` and include changes to the `dist` dir in your commit.
