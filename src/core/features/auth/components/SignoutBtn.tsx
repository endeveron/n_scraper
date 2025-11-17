'use client';

import { useState } from 'react';

import LoadingIcon from '@/core/components/ui/LoadingIcon';
import { useSessionClient } from '@/core/features/auth/hooks/useSessionClient';

const SignOutButton = () => {
  const { status, isLoading, signOutSafely } = useSessionClient();
  const [pending, setPending] = useState(false);

  const handleClick = () => {
    setPending(true);
    signOutSafely();
  };

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div onClick={handleClick}>
      {pending || isLoading ? (
        <LoadingIcon className="scale-75" />
      ) : (
        <span className="cursor-pointer">Sign Out</span>
      )}
    </div>
  );
};

export default SignOutButton;
