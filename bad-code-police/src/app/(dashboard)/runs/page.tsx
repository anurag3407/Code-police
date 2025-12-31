'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  FolderGit2, 
  GitCommit, 
  GitBranch, 
  User, 
  Clock,
  ChevronRight,
  Filter
} from 'lucide-react';

// Mock data for runs
const mockRuns = [
  {
    id: 'run_1',
    project: { name: 'frontend-app', owner: 'myorg' },
    commitSha: 'a1b2c3d4e5f6',
    branch: 'main',
    author: { name: 'John Doe', avatar: null },
    status: 'completed',
    triggerType: 'push',
    issueCounts: { critical: 0, high: 2, medium: 5, low: 3, info: 1 },
    createdAt: '2024-12-31T08:00:00Z',
  },
  {
    id: 'run_2',
    project: { name: 'backend-api', owner: 'myorg' },
    commitSha: 'e4f5g6h7i8j9',
    branch: 'feature/auth',
    author: { name: 'Jane Smith', avatar: null },
    status: 'completed',
    triggerType: 'pull_request',
    prNumber: 42,
    issueCounts: { critical: 1, high: 0, medium: 3, low: 1, info: 0 },
    createdAt: '2024-12-31T05:30:00Z',
  },
  {
    id: 'run_3',
    project: { name: 'shared-lib', owner: 'myorg' },
    commitSha: 'k9l0m1n2o3p4',
    branch: 'main',
    author: { name: 'Bob Johnson', avatar: null },
    status: 'running',
    triggerType: 'push',
    issueCounts: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
    createdAt: '2024-12-31T08:25:00Z',
  },
  {
    id: 'run_4',
    project: { name: 'frontend-app', owner: 'myorg' },
    commitSha: 'q5r6s7t8u9v0',
    branch: 'fix/navbar',
    author: { name: 'Alice Brown', avatar: null },
    status: 'failed',
    triggerType: 'push',
    issueCounts: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
    createdAt: '2024-12-30T22:00:00Z',
    error: 'Failed to fetch diff from GitHub',
  },
];

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>;
    case 'running':
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Running...</Badge>;
    case 'failed':
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Failed</Badge>;
    case 'pending':
      return <Badge className="bg-zinc-500/20 text-zinc-400 border-zinc-500/30">Pending</Badge>;
    default:
      return null;
  }
}

function getTotalIssues(counts: { critical: number; high: number; medium: number; low: number; info: number }) {
  return counts.critical + counts.high + counts.medium + counts.low + counts.info;
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));
  
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

export default function RunsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analysis Runs</h1>
          <p className="text-zinc-400">
            View all code analysis history across your projects
          </p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent border-white/10 text-zinc-300 hover:bg-white/5">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Runs Table */}
      <Card className="bg-[#0a0a0a] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recent Runs</CardTitle>
          <CardDescription className="text-zinc-500">
            All analysis runs from connected repositories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-zinc-400">Project</TableHead>
                <TableHead className="text-zinc-400">Commit</TableHead>
                <TableHead className="text-zinc-400">Branch</TableHead>
                <TableHead className="text-zinc-400">Author</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">Issues</TableHead>
                <TableHead className="text-zinc-400">Time</TableHead>
                <TableHead className="text-zinc-400 w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRuns.map((run) => (
                <TableRow
                  key={run.id}
                  className="border-white/10 hover:bg-white/5 cursor-pointer"
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FolderGit2 className="h-4 w-4 text-blue-400" />
                      <span className="text-white font-medium">{run.project.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <GitCommit className="h-3.5 w-3.5 text-zinc-500" />
                      <code className="text-xs text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded">
                        {run.commitSha.slice(0, 7)}
                      </code>
                      {run.prNumber && (
                        <span className="text-xs text-purple-400">#{run.prNumber}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <GitBranch className="h-3.5 w-3.5 text-zinc-500" />
                      <span className="text-sm text-zinc-400">{run.branch}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <User className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm text-zinc-300">{run.author.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(run.status)}
                  </TableCell>
                  <TableCell>
                    {run.status === 'completed' && (
                      <div className="flex items-center gap-1">
                        {run.issueCounts.critical > 0 && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                            {run.issueCounts.critical}
                          </Badge>
                        )}
                        {run.issueCounts.high > 0 && (
                          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                            {run.issueCounts.high}
                          </Badge>
                        )}
                        {run.issueCounts.medium > 0 && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                            {run.issueCounts.medium}
                          </Badge>
                        )}
                        {getTotalIssues(run.issueCounts) === 0 && (
                          <span className="text-xs text-green-400">All clear</span>
                        )}
                      </div>
                    )}
                    {run.status === 'failed' && (
                      <span className="text-xs text-red-400">Error</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-zinc-500">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-xs">{formatTime(run.createdAt)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/runs/${run.id}`}>
                      <ChevronRight className="h-4 w-4 text-zinc-500 hover:text-white" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
