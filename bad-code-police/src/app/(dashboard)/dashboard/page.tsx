'use client';

import { useOrg } from '@/hooks/use-org';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FolderGit2, 
  AlertTriangle, 
  History, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Zap,
  Bug,
  FileCode2
} from 'lucide-react';

// Mock data - will be replaced with real Firestore data
const mockStats = {
  totalProjects: 5,
  totalRuns: 47,
  issuesThisWeek: 23,
  issuesChange: -15, // negative means fewer issues (good!)
  avgIssuesPerRun: 4.2,
};

const mockRecentRuns = [
  {
    id: '1',
    project: 'frontend-app',
    commit: 'a1b2c3d',
    branch: 'main',
    status: 'completed',
    issues: { critical: 0, high: 2, medium: 5, low: 3 },
    createdAt: '2 hours ago',
  },
  {
    id: '2',
    project: 'backend-api',
    commit: 'e4f5g6h',
    branch: 'feature/auth',
    status: 'completed',
    issues: { critical: 1, high: 0, medium: 3, low: 1 },
    createdAt: '5 hours ago',
  },
  {
    id: '3',
    project: 'shared-lib',
    commit: 'i7j8k9l',
    branch: 'main',
    status: 'running',
    issues: { critical: 0, high: 0, medium: 0, low: 0 },
    createdAt: 'Just now',
  },
];

const mockTopIssues = [
  { category: 'Security', count: 12, icon: Shield, color: 'text-red-400' },
  { category: 'Performance', count: 8, icon: Zap, color: 'text-yellow-400' },
  { category: 'Bugs', count: 6, icon: Bug, color: 'text-orange-400' },
  { category: 'Style', count: 15, icon: FileCode2, color: 'text-blue-400' },
];

export default function DashboardPage() {
  const { currentOrg, projects, loading } = useOrg();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400">
          Overview of your code analysis for {currentOrg?.name || 'your workspace'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#0a0a0a] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Total Projects
            </CardTitle>
            <FolderGit2 className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{projects.length || mockStats.totalProjects}</div>
            <p className="text-xs text-zinc-500">Connected GitHub repos</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Analysis Runs
            </CardTitle>
            <History className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{mockStats.totalRuns}</div>
            <p className="text-xs text-zinc-500">This month</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Issues Found
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{mockStats.issuesThisWeek}</div>
            <div className="flex items-center text-xs">
              {mockStats.issuesChange < 0 ? (
                <>
                  <ArrowDownRight className="h-3 w-3 text-green-400 mr-1" />
                  <span className="text-green-400">{Math.abs(mockStats.issuesChange)}% fewer</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="h-3 w-3 text-red-400 mr-1" />
                  <span className="text-red-400">{mockStats.issuesChange}% more</span>
                </>
              )}
              <span className="text-zinc-500 ml-1">than last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Avg Issues/Run
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{mockStats.avgIssuesPerRun}</div>
            <p className="text-xs text-zinc-500">Across all projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Runs */}
        <Card className="lg:col-span-2 bg-[#0a0a0a] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Recent Analysis Runs</CardTitle>
            <CardDescription className="text-zinc-500">
              Latest code reviews from your repositories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentRuns.map((run) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <FolderGit2 className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{run.project}</span>
                        <code className="text-xs text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">
                          {run.commit}
                        </code>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <span>{run.branch}</span>
                        <span>•</span>
                        <span>{run.createdAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {run.status === 'running' ? (
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        Running...
                      </Badge>
                    ) : (
                      <>
                        {run.issues.critical > 0 && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                            {run.issues.critical} Critical
                          </Badge>
                        )}
                        {run.issues.high > 0 && (
                          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                            {run.issues.high} High
                          </Badge>
                        )}
                        {run.issues.medium > 0 && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            {run.issues.medium} Medium
                          </Badge>
                        )}
                        {Object.values(run.issues).every(v => v === 0) && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            All Clear
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Issue Categories */}
        <Card className="bg-[#0a0a0a] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Issues by Category</CardTitle>
            <CardDescription className="text-zinc-500">
              This week&apos;s breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTopIssues.map((item) => (
                <div key={item.category} className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center ${item.color}`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">{item.category}</span>
                      <span className="text-sm text-zinc-400">{item.count}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.category === 'Security' ? 'bg-red-400' :
                          item.category === 'Performance' ? 'bg-yellow-400' :
                          item.category === 'Bugs' ? 'bg-orange-400' : 'bg-blue-400'
                        }`}
                        style={{ width: `${(item.count / 20) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
