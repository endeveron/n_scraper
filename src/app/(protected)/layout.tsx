import { redirect } from 'next/navigation';

import { SIGNIN_REDIRECT } from '@/core/constants';
import ProtectedClient from '@/core/features/auth/components/ProtectedClient';
import { auth } from '~/auth';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) return redirect(SIGNIN_REDIRECT);

  return <ProtectedClient>{children}</ProtectedClient>;
}
