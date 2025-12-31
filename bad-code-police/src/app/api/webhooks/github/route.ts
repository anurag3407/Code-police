import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { GitHubPushEvent, GitHubPullRequestEvent } from '@/types/github';

// Verify GitHub webhook signature
function verifySignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  
  const expected = `sha256=${crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')}`;
  
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

// Find project by GitHub repo ID - returns project data with required fields
async function findProjectByRepoId(repoId: number): Promise<{
  id: string;
  orgId: string;
  webhookSecret: string;
} | null> {
  const projectsRef = adminDb.collection('projects');
  const query = await projectsRef.where('githubRepoId', '==', repoId).limit(1).get();
  
  if (query.empty) return null;
  
  const doc = query.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    orgId: data.orgId as string,
    webhookSecret: data.webhookSecret as string,
  };
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const signature = headersList.get('x-hub-signature-256');
    const event = headersList.get('x-github-event');
    const deliveryId = headersList.get('x-github-delivery');

    // Read raw body for signature verification
    const body = await request.text();

    // Parse payload
    let payload: GitHubPushEvent | GitHubPullRequestEvent;
    try {
      payload = JSON.parse(body);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    // Find the project by repository ID
    const project = await findProjectByRepoId(payload.repository.id);
    if (!project) {
      console.log('Unknown repository:', payload.repository.id);
      return NextResponse.json({ error: 'Unknown repository' }, { status: 404 });
    }

    // Verify webhook signature
    if (!verifySignature(body, signature, project.webhookSecret)) {
      console.error('Invalid webhook signature for project:', project.id);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Handle the event
    if (event === 'push') {
      await handlePushEvent(payload as GitHubPushEvent, project);
    } else if (event === 'pull_request') {
      await handlePullRequestEvent(payload as GitHubPullRequestEvent, project);
    } else {
      // Ignore other events
      return NextResponse.json({ message: 'Event ignored' }, { status: 200 });
    }

    return NextResponse.json({ 
      message: 'Webhook received',
      deliveryId,
      event 
    }, { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle push events
async function handlePushEvent(event: GitHubPushEvent, project: { id: string; orgId: string }) {
  // Skip if no commits
  if (!event.commits || event.commits.length === 0) {
    return;
  }

  // Get the head commit
  const headCommit = event.head_commit || event.commits[event.commits.length - 1];
  const branch = event.ref.replace('refs/heads/', '');

  // Create analysis run document
  const runRef = adminDb.collection('analysisRuns').doc();
  
  await runRef.set({
    id: runRef.id,
    orgId: project.orgId,
    projectId: project.id,
    commitSha: headCommit.id,
    branch,
    triggerType: 'push',
    author: {
      name: headCommit.author.name,
      email: headCommit.author.email,
    },
    status: 'pending',
    issueCounts: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    },
    createdAt: Timestamp.now(),
    aiUsageStats: {
      tokensUsed: 0,
      latencyMs: 0,
      chunksProcessed: 0,
    },
  });

  console.log('Created analysis run:', runRef.id, 'for commit:', headCommit.id);

  // Trigger async processing (in a real app, use a queue like Cloud Tasks)
  // For now, we'll call the analysis API endpoint
  triggerAnalysisAsync(runRef.id);
}

// Handle pull request events
async function handlePullRequestEvent(event: GitHubPullRequestEvent, project: { id: string; orgId: string }) {
  // Only process opened, synchronize (new commits), and reopened
  if (!['opened', 'synchronize', 'reopened'].includes(event.action)) {
    return;
  }

  const pr = event.pull_request;

  // Create analysis run document
  const runRef = adminDb.collection('analysisRuns').doc();
  
  await runRef.set({
    id: runRef.id,
    orgId: project.orgId,
    projectId: project.id,
    commitSha: pr.head.sha,
    branch: pr.head.ref,
    triggerType: 'pull_request',
    prNumber: pr.number,
    author: {
      name: pr.user.login,
      email: pr.user.email || '',
      avatar: pr.user.avatar_url,
    },
    status: 'pending',
    issueCounts: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    },
    createdAt: Timestamp.now(),
    aiUsageStats: {
      tokensUsed: 0,
      latencyMs: 0,
      chunksProcessed: 0,
    },
  });

  console.log('Created analysis run:', runRef.id, 'for PR:', pr.number);

  // Trigger async processing
  triggerAnalysisAsync(runRef.id);
}

// Trigger analysis processing (fire and forget)
function triggerAnalysisAsync(runId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  fetch(`${baseUrl}/api/analysis/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // In production, add a secret header for auth
      'X-Internal-Secret': process.env.NEXTAUTH_SECRET || '',
    },
    body: JSON.stringify({ runId }),
  }).catch(error => {
    console.error('Failed to trigger analysis:', error);
  });
}
