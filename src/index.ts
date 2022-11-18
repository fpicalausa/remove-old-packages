import * as github from "@actions/github";
import * as core from "@actions/core";
import { removeOldPackages } from "./removeOldPackages";

async function run(): Promise<void> {
  const githubToken = core.getInput("github-token", { required: true });
  const packageName = core.getInput("package-name", { required: true });
  const octokit = github.getOctokit(githubToken);
  const isDryRun = core.getBooleanInput("dry-run", { required: false });
  const operationsPerRun = Number.parseInt(
    core.getInput("operations-per-run", { required: false })
  );
  const protectLatestNVersions = Number.parseInt(
    core.getInput("protect-latest-n-versions", { required: false })
  );

  const daysBeforePackageIsOld = Number.parseInt(
    core.getInput("days-before-package-is-old", { required: false })
  );

  return removeOldPackages(octokit, {
    isDryRun,
    repo: github.context.repo,
    operationsPerRun,
    packageName,
    protectLatestNVersions,
    daysBeforePackageIsOld,
  });
}

run();
