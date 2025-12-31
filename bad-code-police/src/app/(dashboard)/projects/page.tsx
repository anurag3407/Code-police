'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useOrg } from '@/hooks/use-org';
import { useAuth } from '@/hooks/use-auth';
import { doc, updateDoc, collection, addDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Github, 
  FolderGit2, 
  GitBranch, 
  Clock, 
  AlertTriangle,
  ExternalLink,
  Settings,
  MoreVertical,
  CheckCircle2,
  Loader2,
  Search,
  Lock,
  Globe,
  Star
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// GitHub repo from API
interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
  description: string | null;
  language: string | null;
  defaultBranch: string;
  htmlUrl: string;
  updatedAt: string;
  stargazersCount: number;
}

// UI display type for projects
interface ProjectDisplay {
  id: string;
  name: string;
  owner: string;
  language: string;
  defaultBranch: string;
  active: boolean;
  lastAnalysis: string;
  totalIssues: number;
  criticalIssues: number;
}

const languageColors: Record<string, string> = {
  TypeScript: 'bg-blue-500',
  JavaScript: 'bg-yellow-500',
  Python: 'bg-green-500',
  Go: 'bg-cyan-500',
  Rust: 'bg-orange-500',
  Java: 'bg-red-500',
  Ruby: 'bg-red-400',
  PHP: 'bg-purple-500',
  'C#': 'bg-green-600',
  C: 'bg-gray-500',
  'C++': 'bg-pink-500',
};

// Convert real Project to display format
function toProjectDisplay(p: { id: string; githubOwner: string; githubRepoName: string; language?: string; defaultBranch: string; active: boolean }): ProjectDisplay {
  return {
    id: p.id,
    name: p.githubRepoName,
    owner: p.githubOwner,
    language: p.language || 'Unknown',
    defaultBranch: p.defaultBranch,
    active: p.active,
    lastAnalysis: 'Never',
    totalIssues: 0,
    criticalIssues: 0,
  };
}

export default function ProjectsPage() {
  const { projects, currentOrg, refreshProjects } = useOrg();
  const { user, userDoc } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [repoSelectOpen, setRepoSelectOpen] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [savingToken, setSavingToken] = useState(false);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [connectingRepo, setConnectingRepo] = useState<number | null>(null);
  
  // Handle GitHub OAuth callback - save token to Firestore
  useEffect(() => {
    const githubToken = searchParams.get('github_token');
    const connected = searchParams.get('github_connected');
    
    if (githubToken && user && connected === 'pending') {
      const saveToken = async () => {
        setSavingToken(true);
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            githubAccessToken: githubToken,
          });
          setGithubConnected(true);
          router.replace('/projects?github_connected=true');
          // Auto-open repo selection after connecting
          setTimeout(() => setRepoSelectOpen(true), 500);
        } catch (error) {
          console.error('Failed to save GitHub token:', error);
          router.replace('/projects?error=token_save_failed');
        } finally {
          setSavingToken(false);
        }
      };
      saveToken();
    } else if (connected === 'true') {
      setGithubConnected(true);
    }
  }, [searchParams, user, router]);

  // Check if user has GitHub token
  useEffect(() => {
    if (userDoc?.githubAccessToken) {
      setGithubConnected(true);
    }
  }, [userDoc]);
  
  // Fetch GitHub repos when dialog opens
  useEffect(() => {
    if (repoSelectOpen && userDoc?.githubAccessToken) {
      fetchGitHubRepos();
    }
  }, [repoSelectOpen, userDoc]);

  const fetchGitHubRepos = async () => {
    if (!userDoc?.githubAccessToken) return;
    
    setLoadingRepos(true);
    try {
      const response = await fetch('/api/github/repos', {
        headers: {
          'Authorization': `Bearer ${userDoc.githubAccessToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setGithubRepos(data.repositories);
      } else {
        console.error('Failed to fetch repos');
      }
    } catch (error) {
      console.error('Error fetching repos:', error);
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleConnectRepo = async (repo: GitHubRepo) => {
    if (!user || !userDoc?.githubAccessToken || !currentOrg) return;
    
    setConnectingRepo(repo.id);
    try {
      // Call API to set up webhook
      const response = await fetch('/api/github/connect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userDoc.githubAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoId: repo.id,
          owner: repo.owner,
          name: repo.name,
          userId: user.uid,
          orgId: currentOrg.id,
        }),
      });

      if (response.ok) {
        const { project } = await response.json();
        
        // Save project to Firestore
        await addDoc(collection(db, 'projects'), {
          ...project,
          createdAt: Timestamp.now(),
        });

        // Refresh projects list
        if (refreshProjects) {
          await refreshProjects();
        }
        
        setRepoSelectOpen(false);
        router.replace('/projects?repo_connected=true');
      } else {
        console.error('Failed to connect repo');
      }
    } catch (error) {
      console.error('Error connecting repo:', error);
    } finally {
      setConnectingRepo(null);
    }
  };

  const handleConnectGitHub = () => {
    window.location.href = '/api/auth/github';
  };

  // Filter repos by search query
  const filteredRepos = githubRepos.filter(repo => 
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if repo is already connected
  const isRepoConnected = (repoId: number) => {
    return projects.some(p => p.githubRepoId === repoId);
  };
  
  // Convert real projects to display format
  const displayProjects: ProjectDisplay[] = projects.map(toProjectDisplay);

  return (
    <div className="space-y-6">
      {/* GitHub Connected Success Banner */}
      {githubConnected && searchParams.get('github_connected') === 'true' && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <CheckCircle2 className="h-5 w-5 text-green-400" />
          <p className="text-green-400">GitHub connected successfully! Click the button below to select repositories.</p>
        </div>
      )}
      
      {/* Saving Token Loading */}
      {savingToken && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
          <p className="text-blue-400">Connecting your GitHub account...</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-zinc-400">
            Manage your connected GitHub repositories
          </p>
        </div>
        
        {githubConnected ? (
          <Button 
            className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
            onClick={() => setRepoSelectOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Repository
          </Button>
        ) : (
          <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0">
                <Plus className="h-4 w-4" />
                Connect Repository
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0a0a0a] border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>Connect a GitHub Repository</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Connect your GitHub account to analyze your repositories.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Button
                  className="w-full gap-2 bg-white/5 border border-white/10 text-white hover:bg-white/10"
                  onClick={handleConnectGitHub}
                >
                  <Github className="h-5 w-5" />
                  Connect with GitHub
                </Button>
                <p className="text-xs text-center text-zinc-500">
                  We&apos;ll only access the repositories you explicitly authorize.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Repo Selection Dialog */}
      <Dialog open={repoSelectOpen} onOpenChange={setRepoSelectOpen}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select a Repository</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Choose a repository to start monitoring with AI code analysis.
            </DialogDescription>
          </DialogHeader>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="Search repositories..." 
              className="pl-9 bg-white/5 border-white/10 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Repos List */}
          <ScrollArea className="h-[400px] pr-4">
            {loadingRepos ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : filteredRepos.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                {searchQuery ? 'No repositories match your search' : 'No repositories found'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredRepos.map((repo) => {
                  const connected = isRepoConnected(repo.id);
                  const connecting = connectingRepo === repo.id;
                  
                  return (
                    <div
                      key={repo.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        connected 
                          ? 'bg-green-500/5 border-green-500/20' 
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                            {repo.private ? (
                              <Lock className="h-5 w-5 text-yellow-400" />
                            ) : (
                              <Globe className="h-5 w-5 text-blue-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-white truncate">{repo.name}</p>
                              {repo.stargazersCount > 0 && (
                                <span className="flex items-center gap-1 text-xs text-yellow-400">
                                  <Star className="h-3 w-3" />
                                  {repo.stargazersCount}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-zinc-500 truncate">{repo.owner}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {repo.language && (
                            <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                              <span className={`h-2.5 w-2.5 rounded-full ${languageColors[repo.language] || 'bg-gray-500'}`} />
                              {repo.language}
                            </div>
                          )}
                          
                          {connected ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Connected
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                              onClick={() => handleConnectRepo(repo)}
                              disabled={connecting}
                            >
                              {connecting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Connect'
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      {repo.description && (
                        <p className="text-sm text-zinc-500 mt-2 line-clamp-1">{repo.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Projects Grid */}
      {displayProjects.length === 0 ? (
        <Card className="bg-[#0a0a0a] border-white/10 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
              <FolderGit2 className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No projects yet</h3>
            <p className="text-zinc-400 text-center mb-4 max-w-sm">
              Connect your first GitHub repository to start analyzing your code with AI.
            </p>
            <Button
              onClick={() => githubConnected ? setRepoSelectOpen(true) : setConnectDialogOpen(true)}
              className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600"
            >
              <Github className="h-4 w-4" />
              {githubConnected ? 'Select Repository' : 'Connect GitHub'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayProjects.map((project) => (
            <Card
              key={project.id}
              className="bg-[#0a0a0a] border-white/10 hover:border-white/20 transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <FolderGit2 className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-white">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="text-zinc-500">
                        {project.owner}
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#18181b] border-white/10">
                      <DropdownMenuItem className="text-zinc-300 cursor-pointer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View on GitHub
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-zinc-300 cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${languageColors[project.language] || 'bg-gray-500'}`} />
                    {project.language}
                  </div>
                  <div className="flex items-center gap-1">
                    <GitBranch className="h-3.5 w-3.5" />
                    {project.defaultBranch}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <Clock className="h-3.5 w-3.5" />
                    {project.lastAnalysis}
                  </div>
                  <div className="flex items-center gap-2">
                    {project.criticalIssues > 0 ? (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        {project.criticalIssues}
                      </Badge>
                    ) : project.totalIssues > 0 ? (
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        {project.totalIssues} issues
                      </Badge>
                    ) : (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Clean
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
