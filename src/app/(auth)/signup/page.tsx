import { Metadata } from 'next';

import { AnimatedCard, CardTitle } from '@/core/components/ui/Card';
import SignUpForm from '@/core/features/auth/components/SignupForm';
import {
  SIGNUP_CARD_TITLE,
  SIGNUP_PAGE_DESCRIPTION,
  SIGNUP_PAGE_TITLE,
} from '@/core/translations/uk';

export const metadata: Metadata = {
  title: SIGNUP_PAGE_TITLE,
  description: SIGNUP_PAGE_DESCRIPTION,
};

export default async function SignupPage() {
  return (
    <AnimatedCard>
      <CardTitle className="text-accent">{SIGNUP_CARD_TITLE}</CardTitle>
      <SignUpForm />
    </AnimatedCard>
  );
}
