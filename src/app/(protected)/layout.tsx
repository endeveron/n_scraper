import { Session } from 'next-auth';
import { redirect } from 'next/navigation';

import { SIGNIN_REDIRECT } from '@/core/constants';
import ProtectedClient from '@/core/features/auth/components/ProtectedClient';
import { auth } from '~/auth';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session: Session | null = null;

  try {
    session = await auth();
  } catch {
    redirect(SIGNIN_REDIRECT);
  }

  if (!session?.user) {
    redirect(SIGNIN_REDIRECT);
  }

  return <ProtectedClient>{children}</ProtectedClient>;
}
