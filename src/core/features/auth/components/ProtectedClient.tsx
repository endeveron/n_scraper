'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

import { useSessionClient } from '@/core/features/auth/hooks/useSessionClient';
import { useNoteStore } from '@/core/features/note/store';

const ProtectedClient = ({ children }: { children: React.ReactNode }) => {
  const { userId } = useSessionClient();

  const fetchInitData = useNoteStore((s) => s.fetchInitData);

  // Initialize folders
  useEffect(() => {
    if (!userId) return;

    (async () => {
      const res = await fetchInitData({ userId });
      if (!res.success) {
        toast(res.error.message ?? 'Unable to retrieve folders');
      }
    })();
  }, [userId, fetchInitData]);

  return (
    <div className="fade size-full min-w-xs max-w-7xl mx-auto">{children}</div>
  );
};

export default ProtectedClient;
