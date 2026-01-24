import { Octokit } from '@octokit/rest';

export function createGitHubClient(token: string) {
  return new Octokit({
    auth: token,
  });
}

export async function getRepositories(token: string) {
  const octokit = createGitHubClient(token);
  const { data } = await octokit.repos.listForAuthenticatedUser({
    sort: 'updated',
    per_page: 100,
  });
  return data;
}

export async function getRepository(token: string, owner: string, repo: string) {
  const octokit = createGitHubClient(token);
  const { data } = await octokit.repos.get({
    owner,
    repo,
  });
  return data;
}

export async function getRepositoryContents(
  token: string,
  owner: string,
  repo: string,
  path: string = ''
) {
  const octokit = createGitHubClient(token);
  const { data } = await octokit.repos.getContent({
    owner,
    repo,
    path,
  });
  return data;
}

export async function getRepositoryCommits(
  token: string,
  owner: string,
  repo: string,
  perPage: number = 30
) {
  const octokit = createGitHubClient(token);
  const { data } = await octokit.repos.listCommits({
    owner,
    repo,
    per_page: perPage,
  });
  return data;
}

export async function getAuthenticatedUser(token: string) {
  const octokit = createGitHubClient(token);
  const { data } = await octokit.users.getAuthenticated();
  return data;
}
