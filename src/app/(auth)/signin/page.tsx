import { Metadata } from 'next';

import { AnimatedCard, CardTitle } from '@/core/components/ui/Card';
import SignInForm from '@/core/features/auth/components/SigninForm';
import {
  SIGNIN_CARD_TITLE,
  SIGNIN_PAGE_DESCRIPTION,
  SIGNIN_PAGE_TITLE,
} from '@/core/translations/uk';

export const metadata: Metadata = {
  title: SIGNIN_PAGE_TITLE,
  description: SIGNIN_PAGE_DESCRIPTION,
};

export default async function SigninPage() {
  return (
    <AnimatedCard>
      <CardTitle>{SIGNIN_CARD_TITLE}</CardTitle>
      <SignInForm />
    </AnimatedCard>
  );
}
