import { Octokit } from "@octokit/core";
import { createActions, Actions } from "./versionActions";
import { Params } from "./types";
import { PackageVersion, readPackageVersions } from "./packagesVersions";
import * as core from "@actions/core";
import { addDays, formatDistance, formatISO, subDays } from "date-fns";
import { parseISO } from "date-fns/fp";

async function processPackageVersion(plan: Plan, actions: Actions) {
  if (plan.action === "skip") {
    console.log(`-> Keeping version ${plan.version.version}: ${plan.reason}`);
    return;
  }

  console.log("Packages was published on " + formatISO(plan.createdAt));
  let timeAgo = formatDistance(
    plan.cutoffTime,
    new Date(),
    { addSuffix: true }
  );
  console.log(`Packages was valid until ${formatISO(plan.cutoffTime)} (${timeAgo})`);

  if (plan.action === "remove") {
    console.log(`-> Removing version ${plan.version.version}`);
    await actions.removePackageVersion(plan.version);
  }
}

type PlanCommon = {
  version: PackageVersion;
  createdAt: number;
};

type Plan = PlanCommon &
  (
    | { action: "skip"; reason: string }
    | {
    action: "remove";
    cutoffTime: number;
  }
    );

async function plan(
  packageVersion: PackageVersion,
  index: number,
  filter: Params & {
    cutoff: number;
  }
): Promise<Plan> {
  const createdAt = parseISO(packageVersion.createdAt).getTime()

  const planMeta: PlanCommon = {
    version: packageVersion,
    createdAt
  };

  if (index < filter.protectLatestNVersions) {
    return {
      action: "skip",
      reason: `last ${filter.protectLatestNVersions} versions are protected`,
      ...planMeta
    };
  }

  if (createdAt >= filter.cutoff) {
    return {
      action: "skip",
      reason: `updated at ${formatISO(createdAt)} which is after cutoff date ${formatISO(filter.cutoff)}`,
      ...planMeta
    };
  }

  const cutoffTime = addDays(
    createdAt,
    filter.daysBeforePackageIsOld
  ).getTime();

  return {
    action: "remove",
    cutoffTime,
    ...planMeta
  };
}

function versionCompare(v1: string, v2: string) {
  const [version1, tag1] = v1.split('-');
  const [version2, tag2] = v1.split('-');
  const parts1 = version1.split('.').map(Number);
  const parts2 = version2.split('.').map(Number);

  for (let i = 0; i < Math.min(parts1.length, parts2.length); i++) {
    if (parts1[i] === parts2[i]) {
      continue;
    }

    if (parts1[i] < parts2[i]) {
      return -1;
    }

    return 1
  }

  if (parts1.length !== parts2.length) {
    return parts1.length - parts2.length;
  }

  if (tag1 && !tag2) {
    return 1;
  }
  if (!tag1 && tag2) {
    return -1;
  }
  return 0;
}

export async function removeOldPackages(
  octokit: Octokit,
  params: Params
): Promise<void> {
  const headers: { [key: string]: string } = params.githubToken
    ? {
      "Content-Type": "application/json",
      Authorization: "bearer " + params.githubToken
    }
    : {};

  if (isNaN(params.daysBeforePackageIsOld)) {
    throw new Error('days-before-package-is-old must be a number (got NaN)')
  }

  const now = new Date();
  const cutoff = subDays(now, params.daysBeforePackageIsOld).getTime();
  const actions = createActions(params.isDryRun, octokit, headers);

  let operations = 0;

  if (params.isDryRun) {
    console.log("Running in dry-run mode. No package will be removed.");
  }

  console.log(`Packages updated before ${formatISO(cutoff)} will be removed`);

  const icons: Record<Plan["action"], string> = {
    remove: "❌",
    skip: "✅"
  };

  const filter = { ...params, cutoff };

  const packageVersions = [];
  for await (const version of readPackageVersions(
    octokit,
    headers,
    params.repo,
    params.packageName
  )) {
    packageVersions.push(version);
  }

  const sortedVersions = packageVersions.sort((p1, p2) => -versionCompare(p1.version,p2.version));

  for (let i = 0; i < sortedVersions.length; i++){
    let version = sortedVersions[i];
    const versionPlan = await plan(version, i, filter);
    core.startGroup(`${icons[versionPlan.action]} version ${version.version}`);
    try {
      await processPackageVersion(versionPlan, actions);

      if (versionPlan.action !== "skip") {
        operations++;
      }
    } finally {
      core.endGroup();
    }

    if (operations >= params.operationsPerRun) {
      console.log("Exiting after " + operations + " operations");
      return;
    }
  }
}
