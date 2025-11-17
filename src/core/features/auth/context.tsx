'use client';

import { Session } from 'next-auth';
import { getSession } from 'next-auth/react';
import { createContext, useContext, useEffect, useState } from 'react';

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession: Session | null;
}) {
  const [session, setSession] = useState(initialSession);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setTimeout(async () => {
        const newSession = await getSession();

        if (mounted && newSession) setSession(newSession);
      }, 1000);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
