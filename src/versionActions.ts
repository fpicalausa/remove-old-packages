import { Octokit } from "@octokit/core";
import { Repo } from "./types";
import { PackageVersion, deletePackageVersion } from "./packagesVersions";

export interface Actions {
  removePackageVersion(packageVersion: PackageVersion): Promise<void>;
}

class NoopActions {
  async removePackageVersion(packageVersion: PackageVersion): Promise<void> {
    console.log(
      `[dry-run] Package version ${packageVersion.version} would have been removed`
    );
  }
}

class RealActions {
  private octokit: Octokit;
  private headers: { [p: string]: string };

  constructor(octokit: Octokit, headers: { [p: string]: string }) {
    this.octokit = octokit;
    this.headers = headers;
  }

  async removePackageVersion(packageVersion: PackageVersion): Promise<void> {
    console.log(`Removing package version ${packageVersion.version}`);
    deletePackageVersion(this.octokit, packageVersion, this.headers);
  }
}

export function createActions(
  isDryRun: boolean,
  octokit: Octokit,
  headers: { [key: string]: string }
) {
  if (isDryRun) return new NoopActions();

  return new RealActions(octokit, headers);
}
