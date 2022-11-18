import { Octokit } from "@octokit/core";
import { Repo } from "./types";

export type PackageVersion = {
  org: string
  packageName: string
  id: number
  version: string
  createdAt: string
};

type Resp = {
  id: number,
  name: string,
  created_at: string
}[]

export async function* readPackageVersions(
  octokit: Octokit,
  headers: { [key: string]: string },
  repo: Repo,
  packageName: string
): AsyncGenerator<PackageVersion> {
  let tr: Resp | null = null;
  let page = 1;

  while (tr === null || tr.length === 100) {
    const response = await octokit.request("GET /orgs/{org}/packages/{package_type}/{package_name}/versions{?page,per_page}", {
      org: repo.owner,
      package_type: "npm",
      package_name: packageName,
      per_page: 100,
      page: page++,
    });
    tr = response.data as Resp;

    for (const packageVersion of tr) {
      yield { id: packageVersion.id, org: repo.owner, version: packageVersion.name, packageName, createdAt: packageVersion.created_at }
    }
  }
}

export async function deletePackageVersion(
  octokit: Octokit,
  packageVersion: PackageVersion,
  headers: { [key: string]: string },
): Promise<void> {
  const response = await octokit.request("DELETE /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}", {
    org: packageVersion.org,
    package_type: "npm",
    package_name: packageVersion.packageName,
    package_version_id: packageVersion.id
  });

  if (response.status !== 204) throw new Error("Failed to remove version: " + response.status);
}
