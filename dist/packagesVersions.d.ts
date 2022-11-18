import { Octokit } from "@octokit/core";
import { Repo } from "./types";
export declare type PackageVersion = {
    org: string;
    packageName: string;
    id: number;
    version: string;
    createdAt: string;
};
export declare function readPackageVersions(octokit: Octokit, headers: {
    [key: string]: string;
}, repo: Repo, packageName: string): AsyncGenerator<PackageVersion>;
export declare function deletePackageVersion(octokit: Octokit, packageVersion: PackageVersion, headers: {
    [key: string]: string;
}): Promise<void>;
