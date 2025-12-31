import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

export async function GET(request: Request) {
  try {
    // Get the access token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
    }

    const accessToken = authHeader.replace('Bearer ', '');

    // Create Octokit client
    const octokit = new Octokit({ auth: accessToken });

    // Fetch repositories
    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
      affiliation: 'owner,collaborator,organization_member',
    });

    // Transform to a simpler format
    const repositories = repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: repo.owner.login,
      private: repo.private,
      description: repo.description,
      language: repo.language,
      defaultBranch: repo.default_branch,
      htmlUrl: repo.html_url,
      updatedAt: repo.updated_at,
      stargazersCount: repo.stargazers_count,
    }));

    return NextResponse.json({ repositories });

  } catch (error) {
    console.error('Failed to fetch repositories:', error);
    return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 });
  }
}
