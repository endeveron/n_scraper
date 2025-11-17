'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/core/components/ui/ThemeProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      storageKey="theme"
    >
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  );
}
