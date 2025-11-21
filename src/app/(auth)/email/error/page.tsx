import { Metadata } from 'next';

import {
  AnimatedCard,
  CardContent,
  CardTitle,
} from '@/core/components/ui/Card';
import GenerateTokenButton from '@/core/features/auth/components/GenerateTokenButton';
import { EMAIL_ERRORS } from '@/core/features/auth/constants';
import {
  ERROR_PAGE_DESCRIPTION,
  ERROR_PAGE_TITLE,
  ERROR_TITLE,
} from '@/core/translations/uk';
import { SearchParams } from '@/core/types';
import { getErrorMessageFromSearchParams } from '@/core/utils/error';

export const metadata: Metadata = {
  title: ERROR_PAGE_TITLE,
  description: ERROR_PAGE_DESCRIPTION,
};

export default async function EmailErrorPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { e, c } = await searchParams;
  const email = e as string;
  const errCodeStr = c as string;

  if (!email || !errCodeStr) {
    throw new Error('Invalid search params');
  }

  const errorMessage = getErrorMessageFromSearchParams(
    errCodeStr as string,
    EMAIL_ERRORS
  );

  return (
    <AnimatedCard>
      <CardTitle className="text-error">{ERROR_TITLE}</CardTitle>
      <CardContent>
        <p className="-mt-2 text-center">{errorMessage}</p>

        <div className="flex-center">
          <GenerateTokenButton
            email={email}
            className="mt-6"
            btnTitle="Generate a new token"
          />
        </div>
      </CardContent>
    </AnimatedCard>
  );
}
