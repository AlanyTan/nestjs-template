/**
 * Usage: npx ts-node tools/repository-report/repository-report.ts
 *
 * You need this environment variable:
 *   export REPOSITORY_REPORT_TOKEN=<YourToken>
 */

const GIT_HUB_API_BASE_URL = "https://api.github.com";
const ORG_NAME = "AcertaAnalyticsSolutions";

const GIT_HUB_TOKEN = process.env.REPOSITORY_REPORT_TOKEN!;

type Repository = {
  name: string;
};

type Pr = {
  merged_at: string;
};

async function getRepositories(): Promise<[Repository]> {
  const url = `${GIT_HUB_API_BASE_URL}/orgs/${ORG_NAME}/repos`;
  console.log(`getting repositories using URL: ${url}`);
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GIT_HUB_TOKEN}`,
    },
  });
  return await response.json();
}

async function getClosedPrs(repositoryName: string): Promise<[Pr]> {
  const url = `${GIT_HUB_API_BASE_URL}/repos/${ORG_NAME}/${repositoryName}/pulls?state=closed`;
  console.log(`getting PRs using URL: ${url}`);
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GIT_HUB_TOKEN}`,
    },
  });

  return await response.json();
}

function isWithinLastWeek(stringDate: string): boolean {
  const date = new Date(stringDate);
  const now = new Date();
  const lastWeekDate = new Date();
  lastWeekDate.setDate(now.getDate() - 7);
  return date >= lastWeekDate;
}

function checkPrs(prs: [Pr], repositoryName: string): string | undefined {
  if (prs.length > 0) {
    const pr = prs.find((pr) => pr.merged_at);
    if (!pr) {
      throw Error("no merged PR");
    }
    if (isWithinLastWeek(pr.merged_at)) {
      return `${repositoryName} - PR date: ${pr.merged_at}`;
    }
  }
  return undefined;
}

async function main(): Promise<void> {
  const repositories = await getRepositories();
  const results: string[] = [];
  for (const repository of repositories) {
    console.log(`getting PRs of repository: ${repository.name}`);
    const result = checkPrs(await getClosedPrs(repository.name), repository.name);
    if (result) {
      results.push(result);
    }
  }
  console.log();
  results.forEach((result) => {
    console.log(result);
  });
}

(async (): Promise<void> => {
  await main();
})();

export {};
