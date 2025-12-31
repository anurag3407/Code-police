import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

// Issue schema for structured output
export const CodeIssueSchema = z.object({
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
  category: z.enum(['security', 'performance', 'readability', 'bug', 'test', 'style']),
  message: z.string().describe('Clear, concise description of the issue'),
  line: z.number().describe('Starting line number of the issue'),
  endLine: z.number().optional().describe('Ending line number if span multiple lines'),
  suggestedFix: z.string().optional().describe('Concrete code fix suggestion'),
  explanation: z.string().describe('Why this is problematic and its impact'),
  ruleId: z.string().optional().describe('Rule identifier like SEC001, PERF001'),
});

export const IssuesOutputSchema = z.object({
  issues: z.array(CodeIssueSchema),
});

export type CodeIssue = z.infer<typeof CodeIssueSchema>;

// Initialize Gemini model
function getGeminiModel(temperature: number = 0) {
  return new ChatGoogleGenerativeAI({
    model: 'gemini-2.0-flash-lite',
    apiKey: process.env.GOOGLE_API_KEY,
    temperature,
    maxRetries: 3,
  });
}

// Static analysis prompt
const STATIC_ANALYSIS_PROMPT = `You are a senior code reviewer with expertise in security, performance, and code quality. Analyze the following code for issues.

**File:** {filePath}
**Language:** {language}
**Commit Message:** {commitMessage}

**Code to analyze:**
\`\`\`{language}
{codeSnippet}
\`\`\`

**Analysis Focus Areas:**
1. **Security** (severity: critical/high): SQL injection, XSS, command injection, insecure secrets, authentication flaws
2. **Performance** (severity: medium/high): N+1 queries, memory leaks, inefficient algorithms, unnecessary re-renders
3. **Bug Detection** (severity: varies): Null pointer risks, race conditions, incorrect logic, edge cases
4. **Readability** (severity: low/medium): Complex functions (>50 lines), unclear naming, missing comments for complex logic
5. **Test Coverage** (severity: info/low): Untested edge cases, missing error handling tests

**Instructions:**
- Only report REAL issues found in the code
- Be specific with line numbers
- Provide actionable fix suggestions
- If no issues found, return an empty array
- Focus on substantive issues, not style nitpicks unless they affect readability significantly

Return your analysis as a JSON object with an "issues" array. Each issue should have: severity, category, message, line, explanation, and optionally suggestedFix and ruleId.`;

// Summary generation prompt  
const SUMMARY_PROMPT = `Based on the following code analysis results, generate a concise summary for an email report.

**Repository:** {repoName}
**Commit:** {commitSha}
**Branch:** {branch}

**Issue Counts:**
- Critical: {criticalCount}
- High: {highCount}
- Medium: {mediumCount}
- Low: {lowCount}
- Info: {infoCount}

**Top Issues:**
{topIssues}

Generate a 2-3 paragraph summary that:
1. Highlights the most important findings
2. Provides context on the severity distribution
3. Gives 1-2 actionable recommendations

Keep the tone professional but friendly. Be concise.`;

// Main analysis function
export async function analyzeCodeChunk(input: {
  codeSnippet: string;
  filePath: string;
  language: string;
  commitMessage: string;
}): Promise<CodeIssue[]> {
  const model = getGeminiModel(0);
  
  // Use withStructuredOutput for reliable JSON parsing
  const structuredModel = model.withStructuredOutput(IssuesOutputSchema);

  const prompt = PromptTemplate.fromTemplate(STATIC_ANALYSIS_PROMPT);
  const formattedPrompt = await prompt.format(input);

  try {
    const result = await structuredModel.invoke(formattedPrompt);
    return result.issues || [];
  } catch (error) {
    console.error('Analysis failed for', input.filePath, error);
    return [];
  }
}

// Generate summary for email report
export async function generateSummary(input: {
  repoName: string;
  commitSha: string;
  branch: string;
  issues: CodeIssue[];
}): Promise<string> {
  const model = getGeminiModel(0.3);
  
  const counts = {
    critical: input.issues.filter(i => i.severity === 'critical').length,
    high: input.issues.filter(i => i.severity === 'high').length,
    medium: input.issues.filter(i => i.severity === 'medium').length,
    low: input.issues.filter(i => i.severity === 'low').length,
    info: input.issues.filter(i => i.severity === 'info').length,
  };

  // Get top 5 issues by severity
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  const topIssues = input.issues
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
    .slice(0, 5)
    .map((issue, i) => `${i + 1}. [${issue.severity.toUpperCase()}] ${issue.message}`)
    .join('\n');

  const prompt = PromptTemplate.fromTemplate(SUMMARY_PROMPT);
  const formattedPrompt = await prompt.format({
    repoName: input.repoName,
    commitSha: input.commitSha.slice(0, 7),
    branch: input.branch,
    criticalCount: counts.critical,
    highCount: counts.high,
    mediumCount: counts.medium,
    lowCount: counts.low,
    infoCount: counts.info,
    topIssues: topIssues || 'No issues found.',
  });

  try {
    const response = await model.invoke(formattedPrompt);
    return response.content as string;
  } catch (error) {
    console.error('Summary generation failed:', error);
    return `Analysis completed. Found ${input.issues.length} issues across your codebase.`;
  }
}
