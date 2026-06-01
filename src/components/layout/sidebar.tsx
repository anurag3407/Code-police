'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  LayoutDashboard, 
  FolderGit2, 
  History, 
  Settings, 
  CreditCard,
  LogOut,
  Shield,
  ChevronRight
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderGit2 },
  { name: 'Runs', href: '/runs', icon: History },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Billing', href: '/billing', icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, userDoc, signOut } = useAuth();

  return (
    <aside className="flex h-screen w-64 flex-col bg-[#0a0a0a] border-r border-white/10">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-4 border-b border-white/10">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <span className="font-semibold text-white">Bad Code Police</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <item.icon className={cn(
                'h-4 w-4',
                isActive ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-300'
              )} />
              {item.name}
              {isActive && (
                <ChevronRight className="ml-auto h-4 w-4 text-zinc-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Menu */}
      <div className="border-t border-white/10 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-2 hover:bg-white/5"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={userDoc?.photoURL} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                  {userDoc?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-medium text-white truncate max-w-[140px]">
                  {userDoc?.displayName || 'User'}
                </span>
                <span className="text-xs text-zinc-500 truncate max-w-[140px]">
                  {user?.email}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[#18181b] border-white/10">
            <DropdownMenuLabel className="text-zinc-400">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="text-zinc-300 cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem 
              onClick={signOut}
              className="text-red-400 cursor-pointer hover:text-red-300"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
