'use client';


import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,

  GitBranch,
  User,
  Clock,
  FileCode2,
  AlertTriangle,
  Shield,
  Zap,
  Bug,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Copy,
  Lightbulb
} from 'lucide-react';
import { useState } from 'react';

// Mock data for a single run
const mockRun = {
  id: 'run_1',
  project: { name: 'frontend-app', owner: 'myorg' },
  commitSha: 'a1b2c3d4e5f6789012345',
  branch: 'main',
  author: { name: 'John Doe', email: 'john@example.com' },
  status: 'completed',
  triggerType: 'push',
  summary: 'Found 11 issues across 4 files. Primary concerns include potential XSS vulnerabilities in user input handling and N+1 query patterns in data fetching.',
  issueCounts: { critical: 0, high: 2, medium: 5, low: 3, info: 1 },
  createdAt: '2024-12-31T08:00:00Z',
  completedAt: '2024-12-31T08:02:30Z',
  aiUsageStats: { tokensUsed: 4500, latencyMs: 12500, chunksProcessed: 8 },
};

const mockIssues = [
  {
    id: 'issue_1',
    filePath: 'src/components/UserInput.tsx',
    line: 42,
    severity: 'high',
    category: 'security',
    message: 'Potential XSS vulnerability: User input is rendered without sanitization',
    explanation: 'The user input from the form is directly inserted into the DOM using dangerouslySetInnerHTML without proper sanitization. This could allow attackers to inject malicious scripts.',
    suggestedFix: "Use a library like DOMPurify to sanitize the input: `dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }}`",
    codeSnippet: `<div dangerouslySetInnerHTML={{ __html: userInput }} />`,
  },
  {
    id: 'issue_2',
    filePath: 'src/lib/api.ts',
    line: 89,
    severity: 'high',
    category: 'performance',
    message: 'N+1 query pattern detected in loop',
    explanation: 'Each iteration of the loop makes a separate API call. This can cause significant performance issues with large datasets.',
    suggestedFix: 'Batch the IDs and make a single API call: `const users = await fetchUsersByIds(ids)`',
    codeSnippet: `for (const id of userIds) {\n  const user = await fetchUser(id);\n  results.push(user);\n}`,
  },
  {
    id: 'issue_3',
    filePath: 'src/components/DataTable.tsx',
    line: 156,
    severity: 'medium',
    category: 'readability',
    message: 'Function exceeds recommended complexity (cyclomatic complexity: 15)',
    explanation: 'This function has many conditional branches making it hard to understand and maintain. Consider breaking it into smaller, focused functions.',
    suggestedFix: 'Extract conditional logic into separate helper functions',
    codeSnippet: `function processData(data, options) {\n  // 150 lines of nested conditionals\n}`,
  },
  {
    id: 'issue_4',
    filePath: 'src/hooks/useData.ts',
    line: 23,
    severity: 'medium',
    category: 'bug',
    message: 'Potential memory leak: useEffect cleanup missing',
    explanation: 'The effect subscribes to an event but does not unsubscribe on cleanup. This can cause memory leaks and unexpected behavior.',
    suggestedFix: 'Add cleanup: `return () => unsubscribe()`',
    codeSnippet: `useEffect(() => {\n  subscribe(handler);\n  // Missing cleanup\n}, []);`,
  },
];

const severityColors = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  info: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
};

const categoryIcons = {
  security: Shield,
  performance: Zap,
  readability: FileCode2,
  bug: Bug,
  test: AlertTriangle,
  style: FileCode2,
};

export default function RunDetailPage() {

  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/runs" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Runs
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            {mockRun.project.name}
            <code className="text-base font-normal text-zinc-400 bg-white/5 px-2 py-1 rounded">
              {mockRun.commitSha.slice(0, 7)}
            </code>
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-zinc-400">
            <div className="flex items-center gap-1">
              <GitBranch className="h-4 w-4" />
              {mockRun.branch}
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {mockRun.author.name}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {new Date(mockRun.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
        <Button variant="outline" className="gap-2 bg-white/5 border-white/10 text-zinc-300">
          <ExternalLink className="h-4 w-4" />
          View on GitHub
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="bg-[#0a0a0a] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-zinc-300">{mockRun.summary}</p>
          
          <div className="flex items-center gap-4">
            {Object.entries(mockRun.issueCounts).map(([severity, count]) => (
              count > 0 && (
                <Badge key={severity} className={severityColors[severity as keyof typeof severityColors]}>
                  {count} {severity}
                </Badge>
              )
            ))}
          </div>

          <Separator className="bg-white/10" />

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-zinc-500">Duration</span>
              <p className="text-white font-medium">
                {(mockRun.aiUsageStats.latencyMs / 1000).toFixed(1)}s
              </p>
            </div>
            <div>
              <span className="text-zinc-500">Tokens Used</span>
              <p className="text-white font-medium">
                {mockRun.aiUsageStats.tokensUsed.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-zinc-500">Files Analyzed</span>
              <p className="text-white font-medium">
                {mockRun.aiUsageStats.chunksProcessed}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      <Card className="bg-[#0a0a0a] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Issues Found</CardTitle>
          <CardDescription className="text-zinc-500">
            {mockIssues.length} issues across {new Set(mockIssues.map(i => i.filePath)).size} files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {mockIssues.map((issue) => {
                const Icon = categoryIcons[issue.category as keyof typeof categoryIcons] || AlertTriangle;
                const isExpanded = expandedIssue === issue.id;

                return (
                  <div
                    key={issue.id}
                    className="rounded-lg border border-white/10 bg-white/5 overflow-hidden"
                  >
                    {/* Issue Header */}
                    <div
                      className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => setExpandedIssue(isExpanded ? null : issue.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                            issue.severity === 'critical' || issue.severity === 'high'
                              ? 'bg-red-500/10 text-red-400'
                              : issue.severity === 'medium'
                              ? 'bg-yellow-500/10 text-yellow-400'
                              : 'bg-blue-500/10 text-blue-400'
                          }`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{issue.message}</p>
                            <div className="flex items-center gap-2 mt-1 text-sm text-zinc-500">
                              <code className="bg-white/5 px-1.5 py-0.5 rounded">
                                {issue.filePath}:{issue.line}
                              </code>
                              <Badge className={severityColors[issue.severity as keyof typeof severityColors]}>
                                {issue.severity}
                              </Badge>
                              <Badge variant="outline" className="border-white/10 text-zinc-400">
                                {issue.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-zinc-500" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-zinc-500" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4">
                        {/* Explanation */}
                        <div>
                          <h4 className="text-sm font-medium text-zinc-400 mb-2">Explanation</h4>
                          <p className="text-zinc-300 text-sm">{issue.explanation}</p>
                        </div>

                        {/* Code Snippet */}
                        <div>
                          <h4 className="text-sm font-medium text-zinc-400 mb-2">Code</h4>
                          <div className="relative">
                            <pre className="overflow-x-auto text-sm bg-[#0d1117] p-4 rounded-lg border border-white/10">
                              <code className="text-zinc-300 font-mono">{issue.codeSnippet}</code>
                            </pre>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="absolute top-2 right-2 h-6 w-6 text-zinc-500 hover:text-white"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Suggested Fix */}
                        {issue.suggestedFix && (
                          <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-2">
                              <Lightbulb className="h-4 w-4" />
                              Suggested Fix
                            </div>
                            <p className="text-zinc-300 text-sm">{issue.suggestedFix}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
