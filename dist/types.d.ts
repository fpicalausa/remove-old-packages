export declare type Repo = {
    repo: string;
    owner: string;
};
export declare type Params = {
    githubToken?: string;
    isDryRun: boolean;
    operationsPerRun: number;
    repo: Repo;
    packageName: string;
    protectLatestNVersions: number;
    daysBeforePackageIsOld: number;
};
