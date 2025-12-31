'use client';

import { useOrg } from '@/hooks/use-org';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Bell, 
  Shield, 
  Zap, 
  FileCode2, 
  Bug,
  TestTube2,
  Palette,
  Save
} from 'lucide-react';

const categories = [
  { id: 'security', name: 'Security', icon: Shield, description: 'OWASP vulnerabilities, injection attacks' },
  { id: 'performance', name: 'Performance', icon: Zap, description: 'N+1 queries, memory leaks' },
  { id: 'readability', name: 'Readability', icon: FileCode2, description: 'Complex code, unclear naming' },
  { id: 'bugs', name: 'Bug Detection', icon: Bug, description: 'Potential runtime errors' },
  { id: 'tests', name: 'Test Coverage', icon: TestTube2, description: 'Missing test suggestions' },
  { id: 'style', name: 'Code Style', icon: Palette, description: 'Formatting, consistency' },
];

export default function SettingsPage() {
  const { currentOrg } = useOrg();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-zinc-400">
          Manage organization settings and analysis preferences
        </p>
      </div>

      <Tabs defaultValue="rules" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="rules" className="data-[state=active]:bg-white/10 text-zinc-400 data-[state=active]:text-white">
            <Settings className="mr-2 h-4 w-4" />
            Rules
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-white/10 text-zinc-400 data-[state=active]:text-white">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <Card className="bg-[#0a0a0a] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Analysis Categories</CardTitle>
              <CardDescription className="text-zinc-500">
                Choose which types of issues to detect in your code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:border-blue-500/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <category.icon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white">{category.name}</span>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                          Enabled
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-500 mt-1">{category.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0a0a0a] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Ignore Patterns</CardTitle>
              <CardDescription className="text-zinc-500">
                Files and directories to exclude from analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Glob patterns (one per line)</Label>
                <textarea
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm font-mono resize-none focus:outline-none focus:border-blue-500/50"
                  defaultValue={`node_modules/**\n*.min.js\n*.min.css\ndist/**\nbuild/**\n.next/**`}
                />
              </div>
              <Button className="gap-2 bg-blue-500 hover:bg-blue-600">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#0a0a0a] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Severity Threshold</CardTitle>
              <CardDescription className="text-zinc-500">
                Minimum severity level to report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {['info', 'low', 'medium', 'high', 'critical'].map((level, i) => (
                  <Button
                    key={level}
                    variant="outline"
                    className={`capitalize ${
                      i <= 2
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        : 'bg-white/5 text-zinc-400 border-white/10'
                    }`}
                  >
                    {level}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                Currently reporting issues with severity: Low and above
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-[#0a0a0a] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Email Notifications</CardTitle>
              <CardDescription className="text-zinc-500">
                Configure when to receive analysis reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div>
                    <p className="font-medium text-white">On every push</p>
                    <p className="text-sm text-zinc-500">Receive email for each commit pushed</p>
                  </div>
                  <Button variant="outline" className="bg-white/5 border-white/10 text-zinc-400">
                    Disabled
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-blue-500/30">
                  <div>
                    <p className="font-medium text-white">On pull requests</p>
                    <p className="text-sm text-zinc-500">Receive email for new and updated PRs</p>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    Enabled
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div>
                    <p className="font-medium text-white">Only on high severity</p>
                    <p className="text-sm text-zinc-500">Only notify when critical issues are found</p>
                  </div>
                  <Button variant="outline" className="bg-white/5 border-white/10 text-zinc-400">
                    Disabled
                  </Button>
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div className="space-y-2">
                <Label className="text-zinc-300">Additional email recipients</Label>
                <Input
                  placeholder="team@example.com, lead@example.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                />
                <p className="text-xs text-zinc-500">
                  Comma-separated email addresses
                </p>
              </div>

              <Button className="gap-2 bg-blue-500 hover:bg-blue-600">
                <Save className="h-4 w-4" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
