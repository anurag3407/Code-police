import { Octokit } from '@octokit/rest';

// GitHub API client factory
export function createGitHubClient(accessToken: string) {
  return new Octokit({
    auth: accessToken,
  });
}

// Fetch commit diff from GitHub
export async function fetchCommitDiff(
  client: Octokit,
  owner: string,
  repo: string,
  sha: string
) {
  const response = await client.repos.getCommit({
    owner,
    repo,
    ref: sha,
  });

  return {
    sha: response.data.sha,
    message: response.data.commit.message,
    author: response.data.commit.author,
    files: response.data.files?.map(file => ({
      filename: file.filename,
      status: file.status as 'added' | 'removed' | 'modified' | 'renamed',
      patch: file.patch,
      additions: file.additions,
      deletions: file.deletions,
    })) || [],
  };
}

// Fetch PR diff from GitHub
export async function fetchPullRequestDiff(
  client: Octokit,
  owner: string,
  repo: string,
  prNumber: number
) {
  const response = await client.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });

  const filesResponse = await client.pulls.listFiles({
    owner,
    repo,
    pull_number: prNumber,
    per_page: 100,
  });

  return {
    title: response.data.title,
    body: response.data.body,
    headSha: response.data.head.sha,
    baseSha: response.data.base.sha,
    author: response.data.user,
    files: filesResponse.data.map(file => ({
      filename: file.filename,
      status: file.status as 'added' | 'removed' | 'modified' | 'renamed',
      patch: file.patch,
      additions: file.additions,
      deletions: file.deletions,
    })),
  };
}

// Create webhook for a repository
export async function createWebhook(
  client: Octokit,
  owner: string,
  repo: string,
  webhookUrl: string,
  secret: string
) {
  const response = await client.repos.createWebhook({
    owner,
    repo,
    config: {
      url: webhookUrl,
      content_type: 'json',
      secret,
      insecure_ssl: '0',
    },
    events: ['push', 'pull_request'],
    active: true,
  });

  return response.data;
}

// Delete webhook
export async function deleteWebhook(
  client: Octokit,
  owner: string,
  repo: string,
  hookId: number
) {
  await client.repos.deleteWebhook({
    owner,
    repo,
    hook_id: hookId,
  });
}

// List user's repositories
export async function listUserRepos(client: Octokit) {
  const response = await client.repos.listForAuthenticatedUser({
    sort: 'updated',
    per_page: 100,
    affiliation: 'owner,collaborator,organization_member',
  });

  return response.data.map(repo => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    owner: repo.owner.login,
    private: repo.private,
    description: repo.description,
    language: repo.language,
    defaultBranch: repo.default_branch,
    htmlUrl: repo.html_url,
  }));
}

// Get user info from token
export async function getAuthenticatedUser(client: Octokit) {
  const response = await client.users.getAuthenticated();
  return response.data;
}
