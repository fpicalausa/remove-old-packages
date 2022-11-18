import { Octokit } from "@octokit/core";
import { Params } from "./types";
export declare function removeOldPackages(octokit: Octokit, params: Params): Promise<void>;
