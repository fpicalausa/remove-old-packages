import { Octokit } from "@octokit/core";
import { PackageVersion } from "./packagesVersions";
export interface Actions {
    removePackageVersion(packageVersion: PackageVersion): Promise<void>;
}
declare class NoopActions {
    removePackageVersion(packageVersion: PackageVersion): Promise<void>;
}
declare class RealActions {
    private octokit;
    private headers;
    constructor(octokit: Octokit, headers: {
        [p: string]: string;
    });
    removePackageVersion(packageVersion: PackageVersion): Promise<void>;
}
export declare function createActions(isDryRun: boolean, octokit: Octokit, headers: {
    [key: string]: string;
}): NoopActions | RealActions;
export {};
