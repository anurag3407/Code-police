import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { adminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { createGitHubClient, fetchCommitDiff, fetchPullRequestDiff } from '@/lib/github/api';
import { chunkCodeByFile, DiffFile } from '@/lib/ai/chunker';
import { analyzeCodeChunk, generateSummary, CodeIssue } from '@/lib/ai/chains';

export async function POST(request: Request) {
  try {
    // Verify internal secret (in production, use proper auth)
    const headersList = await headers();
    const secret = headersList.get('x-internal-secret');
    
    if (secret !== process.env.NEXTAUTH_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { runId } = await request.json();
    
    if (!runId) {
      return NextResponse.json({ error: 'Missing runId' }, { status: 400 });
    }

    // Process the analysis run
    await processAnalysisRun(runId);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Analysis processing error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

async function processAnalysisRun(runId: string) {
  const startTime = Date.now();
  
  // Get the analysis run
  const runRef = adminDb.collection('analysisRuns').doc(runId);
  const runDoc = await runRef.get();
  
  if (!runDoc.exists) {
    throw new Error(`Analysis run ${runId} not found`);
  }

  const run = runDoc.data()!;
  
  // Update status to running
  await runRef.update({ status: 'running' });

  try {
    // Get project info
    const projectRef = adminDb.collection('projects').doc(run.projectId);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      throw new Error(`Project ${run.projectId} not found`);
    }

    const project = projectDoc.data()!;

    // Get user's GitHub access token
    const userRef = adminDb.collection('users').doc(project.ownerId || run.orgId.replace('org_', ''));
    const userDoc = await userRef.get();
    
    if (!userDoc.exists || !userDoc.data()?.githubAccessToken) {
      throw new Error('GitHub access token not found');
    }

    const accessToken = userDoc.data()!.githubAccessToken;
    const client = createGitHubClient(accessToken);

    // Fetch diff based on trigger type
    let files: DiffFile[];
    let commitMessage: string;

    if (run.triggerType === 'pull_request' && run.prNumber) {
      const prDiff = await fetchPullRequestDiff(
        client,
        project.githubOwner,
        project.githubRepoName,
        run.prNumber
      );
      files = prDiff.files;
      commitMessage = prDiff.title;
    } else {
      const commitDiff = await fetchCommitDiff(
        client,
        project.githubOwner,
        project.githubRepoName,
        run.commitSha
      );
      files = commitDiff.files;
      commitMessage = commitDiff.message;
    }

    // Chunk the code
    const chunks = chunkCodeByFile(files);
    
    console.log(`Processing ${chunks.length} chunks for run ${runId}`);

    // Analyze each chunk and collect issues with file paths
    interface IssueWithPath extends CodeIssue {
      filePath: string;
    }
    const allIssues: IssueWithPath[] = [];
    let totalTokens = 0;

    for (const chunk of chunks) {
      const issues = await analyzeCodeChunk({
        codeSnippet: chunk.content,
        filePath: chunk.filePath,
        language: chunk.language,
        commitMessage,
      });

      // Add file path to each issue and merge
      allIssues.push(...issues.map(issue => ({
        ...issue,
        filePath: chunk.filePath,
      })));

      // Estimate tokens used (rough)
      totalTokens += Math.ceil(chunk.content.length / 4) + 500; // Input + output estimate
    }

    // Calculate issue counts
    const issueCounts = {
      critical: allIssues.filter(i => i.severity === 'critical').length,
      high: allIssues.filter(i => i.severity === 'high').length,
      medium: allIssues.filter(i => i.severity === 'medium').length,
      low: allIssues.filter(i => i.severity === 'low').length,
      info: allIssues.filter(i => i.severity === 'info').length,
    };

    // Generate summary
    const summary = await generateSummary({
      repoName: `${project.githubOwner}/${project.githubRepoName}`,
      commitSha: run.commitSha,
      branch: run.branch,
      issues: allIssues,
    });

    // Save issues to Firestore
    const batch = adminDb.batch();
    
    for (const issue of allIssues) {
      const issueRef = adminDb.collection('issues').doc();
      batch.set(issueRef, {
        id: issueRef.id,
        orgId: run.orgId,
        projectId: run.projectId,
        analysisRunId: runId,
        filePath: issue.filePath || '',
        line: issue.line,
        endLine: issue.endLine,
        severity: issue.severity,
        category: issue.category,
        message: issue.message,
        suggestedFix: issue.suggestedFix,
        explanation: issue.explanation,
        ruleId: issue.ruleId,
        isMuted: false,
      });
    }

    await batch.commit();

    // Update the analysis run with results
    const latencyMs = Date.now() - startTime;
    
    await runRef.update({
      status: 'completed',
      summary,
      issueCounts,
      completedAt: Timestamp.now(),
      aiUsageStats: {
        tokensUsed: totalTokens,
        latencyMs,
        chunksProcessed: chunks.length,
      },
    });

    console.log(`Analysis run ${runId} completed: ${allIssues.length} issues found in ${latencyMs}ms`);

    // TODO: Send email notification
    // await sendEmailReport(run, allIssues, summary);

  } catch (error) {
    console.error(`Analysis run ${runId} failed:`, error);
    
    await runRef.update({
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      completedAt: Timestamp.now(),
    });
  }
}
