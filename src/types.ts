export type Repo = {
  repo: string;
  owner: string;
};

export type Params = {
  githubToken?: string;
  isDryRun: boolean;
  operationsPerRun: number;
  repo: Repo;
  packageName: string;
  protectLatestNVersions: number;
  daysBeforePackageIsOld: number;
};
