import { redirect } from 'next/navigation';

import { DEFAULT_REDIRECT } from '@/core/constants';
import { verifyEmailToken } from '@/core/features/auth/actions';
import {
  ERROR_EMAIL_TOKEN,
  ERROR_INVALID_SEARCH_PARAMS,
  ERROR_UNEXPECTED_FORMAT,
} from '@/core/translations/uk';
import { SearchParams } from '@/core/types';

export default async function EmailResultPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { e, t, i } = await searchParams;
  const email = e as string;
  const token = t as string;
  const userId = i as string;

  if (!email || !token || !userId) {
    throw new Error(ERROR_INVALID_SEARCH_PARAMS);
  }

  // Verify the token
  const res = await verifyEmailToken({
    userId,
    token,
  });

  if (!res.success) {
    // Get error code. See EmailErrorCodes
    if (res?.success === false) {
      if ('code' in res.error) {
        const errCode = res.error.code as number;
        redirect(`/email/error?c=${errCode}&e=${email}`);
      } else {
        throw new Error(ERROR_UNEXPECTED_FORMAT);
      }
    }
    throw new Error(ERROR_EMAIL_TOKEN);
  }

  if (res.data === 'created') return redirect(DEFAULT_REDIRECT);
  if (res.data === 'onboard') return redirect(`/onboarding?t=${userId}`);
}
