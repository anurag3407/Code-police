'use client';

import { useOrg } from '@/hooks/use-org';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ChevronDown, Search, Plus, Building2 } from 'lucide-react';

export function TopBar() {
  const { currentOrg, organizations, setCurrentOrgId } = useOrg();

  return (
    <header className="h-16 border-b border-white/10 bg-[#0a0a0a] flex items-center justify-between px-6">
      {/* Left side - Org selector */}
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white"
            >
              <Building2 className="h-4 w-4 text-zinc-400" />
              <span className="max-w-[200px] truncate">
                {currentOrg?.name || 'Select Organization'}
              </span>
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 bg-[#18181b] border-white/10">
            <DropdownMenuLabel className="text-zinc-400">Organizations</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => setCurrentOrgId(org.id)}
                className={`cursor-pointer ${
                  org.id === currentOrg?.id 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'text-zinc-300'
                }`}
              >
                <Building2 className="mr-2 h-4 w-4" />
                <span className="truncate">{org.name}</span>
                {org.plan !== 'free' && (
                  <span className="ml-auto text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-0.5 rounded-full">
                    {org.plan}
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search projects, commits..."
            className="w-full bg-white/5 border-white/10 pl-10 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-0"
          />
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-3">
        <Button 
          className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
        >
          <Plus className="h-4 w-4" />
          Connect Repo
        </Button>
      </div>
    </header>
  );
}
