import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    // Get the access token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
    }

    const accessToken = authHeader.replace('Bearer ', '');
    const { repoId, owner, name, userId, orgId } = await request.json();

    if (!repoId || !owner || !name || !userId || !orgId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate a webhook secret
    const webhookSecret = crypto.randomBytes(32).toString('hex');

    // Create Octokit client
    const octokit = new Octokit({ auth: accessToken });

    // Get repository info
    const { data: repo } = await octokit.repos.get({ owner, repo: name });

    // Create webhook
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/github`;
    
    let webhookId: number | undefined;
    try {
      const { data: webhook } = await octokit.repos.createWebhook({
        owner,
        repo: name,
        config: {
          url: webhookUrl,
          content_type: 'json',
          secret: webhookSecret,
          insecure_ssl: '0',
        },
        events: ['push', 'pull_request'],
        active: true,
      });
      webhookId = webhook.id;
    } catch (webhookError: unknown) {
      // Webhook creation might fail if user doesn't have admin access
      // We'll still create the project, just without webhook
      console.warn('Could not create webhook:', webhookError);
    }

    // Return project data to be saved by the client
    const projectData = {
      githubRepoId: repo.id,
      githubOwner: repo.owner.login,
      githubRepoName: repo.name,
      defaultBranch: repo.default_branch,
      language: repo.language,
      webhookId,
      webhookSecret,
      active: true,
      orgId,
      ownerId: userId,
    };

    return NextResponse.json({ project: projectData, webhookCreated: !!webhookId });

  } catch (error) {
    console.error('Failed to connect repository:', error);
    return NextResponse.json({ error: 'Failed to connect repository' }, { status: 500 });
  }
}
