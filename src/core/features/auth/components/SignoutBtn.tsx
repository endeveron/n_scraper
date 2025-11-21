'use client';

import { useState } from 'react';

import LoadingIcon from '@/core/components/ui/LoadingIcon';
import { useSessionClient } from '@/core/features/auth/hooks/useSessionClient';
import { SIGNOUT_BUTTON_LABEL } from '@/core/translations/uk';

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
        <span className="cursor-pointer">{SIGNOUT_BUTTON_LABEL}</span>
      )}
    </div>
  );
};

export default SignOutButton;
