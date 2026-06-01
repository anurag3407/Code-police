'use client';

import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="flex h-screen bg-[#050505]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
