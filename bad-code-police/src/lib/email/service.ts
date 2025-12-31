import nodemailer from 'nodemailer';
import { AnalysisRun, Issue } from '@/types/firestore';

// Severity ordering for sorting
const severityOrder: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

// Create email transporter with Gmail OAuth2
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    },
  });
}

// Generate HTML email for analysis report
export function generateReportEmailHtml(
  run: AnalysisRun,
  issues: Issue[],
  repoName: string
): string {
  const totalIssues = Object.values(run.issueCounts).reduce((a, b) => a + b, 0);
  const topIssues = issues
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
    .slice(0, 5);

  const severityBadgeStyles = {
    critical: 'background: #ef4444; color: white;',
    high: 'background: #f97316; color: white;',
    medium: 'background: #eab308; color: black;',
    low: 'background: #3b82f6; color: white;',
    info: 'background: #6b7280; color: white;',
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bad Code Police Report</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #111; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 24px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">
                🚨 Bad Code Police Report
              </h1>
            </td>
          </tr>
          
          <!-- Commit Info -->
          <tr>
            <td style="padding: 24px; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <p style="margin: 0 0 8px 0; color: #a1a1a1; font-size: 14px;">
                Repository: <strong style="color: white;">${repoName}</strong>
              </p>
              <p style="margin: 0 0 8px 0; color: #a1a1a1; font-size: 14px;">
                Commit: <code style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; color: #3b82f6;">${run.commitSha.slice(0, 7)}</code>
                on <strong style="color: white;">${run.branch}</strong>
              </p>
              <p style="margin: 0; color: #a1a1a1; font-size: 14px;">
                Author: <strong style="color: white;">${run.author.name}</strong>
              </p>
            </td>
          </tr>
          
          <!-- Summary -->
          <tr>
            <td style="padding: 24px; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <h2 style="margin: 0 0 16px 0; color: white; font-size: 18px;">Summary</h2>
              <p style="margin: 0 0 16px 0; color: #d1d5db; font-size: 14px; line-height: 1.6;">
                ${run.summary || `Found ${totalIssues} issues in this commit.`}
              </p>
              
              <table cellpadding="0" cellspacing="0" style="width: 100%;">
                <tr>
                  ${run.issueCounts.critical > 0 ? `
                  <td style="padding: 4px;">
                    <span style="${severityBadgeStyles.critical} padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                      ${run.issueCounts.critical} Critical
                    </span>
                  </td>` : ''}
                  ${run.issueCounts.high > 0 ? `
                  <td style="padding: 4px;">
                    <span style="${severityBadgeStyles.high} padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                      ${run.issueCounts.high} High
                    </span>
                  </td>` : ''}
                  ${run.issueCounts.medium > 0 ? `
                  <td style="padding: 4px;">
                    <span style="${severityBadgeStyles.medium} padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                      ${run.issueCounts.medium} Medium
                    </span>
                  </td>` : ''}
                  ${run.issueCounts.low > 0 ? `
                  <td style="padding: 4px;">
                    <span style="${severityBadgeStyles.low} padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                      ${run.issueCounts.low} Low
                    </span>
                  </td>` : ''}
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Top Issues -->
          ${topIssues.length > 0 ? `
          <tr>
            <td style="padding: 24px; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <h2 style="margin: 0 0 16px 0; color: white; font-size: 18px;">Top Issues</h2>
              ${topIssues.map(issue => `
                <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; margin-bottom: 12px; border-left: 3px solid ${
                  issue.severity === 'critical' ? '#ef4444' :
                  issue.severity === 'high' ? '#f97316' :
                  issue.severity === 'medium' ? '#eab308' : '#3b82f6'
                };">
                  <div style="margin-bottom: 8px;">
                    <span style="${severityBadgeStyles[issue.severity as keyof typeof severityBadgeStyles]} padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase;">
                      ${issue.severity}
                    </span>
                    <span style="color: #6b7280; font-size: 12px; margin-left: 8px;">
                      ${issue.category}
                    </span>
                  </div>
                  <p style="margin: 0 0 8px 0; color: white; font-size: 14px; font-weight: 500;">
                    ${issue.message}
                  </p>
                  <p style="margin: 0; color: #6b7280; font-size: 12px;">
                    <code style="background: rgba(255,255,255,0.1); padding: 1px 4px; border-radius: 2px;">
                      ${issue.filePath}:${issue.line}
                    </code>
                  </p>
                </div>
              `).join('')}
            </td>
          </tr>
          ` : ''}
          
          <!-- CTA -->
          <tr>
            <td style="padding: 24px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/runs/${run.id}" 
                 style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                View Full Report →
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 16px 24px; background: rgba(0,0,0,0.3); text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                Powered by Bad Code Police • AI-Powered Code Review
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// Send analysis report email
export async function sendAnalysisReport(
  run: AnalysisRun,
  issues: Issue[],
  repoName: string,
  recipients: string[]
): Promise<void> {
  const transporter = createTransporter();

  const html = generateReportEmailHtml(run, issues, repoName);
  const totalIssues = Object.values(run.issueCounts).reduce((a, b) => a + b, 0);

  const subject = run.issueCounts.critical > 0
    ? `🚨 [CRITICAL] Bad Code Police: ${run.issueCounts.critical} critical issues in ${repoName}`
    : totalIssues > 0
    ? `[Bad Code Police] ${totalIssues} issues found in ${repoName}@${run.commitSha.slice(0, 7)}`
    : `✅ [Bad Code Police] No issues in ${repoName}@${run.commitSha.slice(0, 7)}`;

  await transporter.sendMail({
    from: `"Bad Code Police" <${process.env.GMAIL_USER}>`,
    to: recipients.join(', '),
    subject,
    html,
  });

  console.log(`Email sent to ${recipients.length} recipients for run ${run.id}`);
}
