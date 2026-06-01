'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/hooks/use-auth';
import { OrgProvider } from '@/hooks/use-org';
import { TooltipProvider } from '@/components/ui/tooltip';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <OrgProvider>
        <TooltipProvider delayDuration={200}>
          {children}
        </TooltipProvider>
      </OrgProvider>
    </AuthProvider>
  );
}
