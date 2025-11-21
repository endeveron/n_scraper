import { Metadata } from 'next';

import {
  AnimatedCard,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/core/components/ui/Card';
import { verifyUserId } from '@/core/features/auth/actions';
import OnboardingForm from '@/core/features/auth/components/OnboardingForm';
import {
  ONBOARDING_CARD_DESCRIPTION,
  ONBOARDING_CARD_TITLE,
  ONBOARDING_PAGE_DESCRIPTION,
  ONBOARDING_PAGE_TITLE,
} from '@/core/translations/uk';
import { SearchParams } from '@/core/types';

export const metadata: Metadata = {
  title: ONBOARDING_PAGE_TITLE,
  description: ONBOARDING_PAGE_DESCRIPTION,
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { t } = await searchParams;
  const userId = t as string;

  if (!userId) throw new Error(`Invalid search param for user's objectId`);

  // Check the validity of the user objectId
  await verifyUserId(userId);

  return (
    <AnimatedCard>
      <CardTitle className="text-accent">{ONBOARDING_CARD_TITLE}</CardTitle>

      <CardDescription className="text-muted">
        {ONBOARDING_CARD_DESCRIPTION}
      </CardDescription>

      <CardContent>
        <OnboardingForm userId={userId} />
      </CardContent>
    </AnimatedCard>
  );
}
