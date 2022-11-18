import { Octokit } from "@octokit/core";
import { removeOldPackages } from "./removeOldPackages";
import process from "process";

let octokit = new Octokit({ auth: process.env.GITHUB_TOKEN});

const timer = setTimeout(() => {}, 120000);
removeOldPackages(octokit, {
  githubToken:process.env.GITHUB_TOKEN,
  isDryRun: true,
  operationsPerRun: 50,
  repo: {
    owner: "github",
    repo: "octocat",
  },
  protectLatestNVersions: 4,
  packageName: "octocat",
  daysBeforePackageIsOld: 3,
})
  .then(() => clearTimeout(timer))
  .catch((e) => console.log(e));
