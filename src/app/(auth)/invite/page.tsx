import { Metadata } from 'next';

import { AnimatedCard, CardTitle } from '@/core/components/ui/Card';
import InviteForm from '@/core/features/auth/components/InviteForm';
import {
  INVITE_CARD_TITLE,
  INVITE_PAGE_DESCRIPTION,
  INVITE_PAGE_TITLE,
} from '@/core/translations/uk';

export const metadata: Metadata = {
  title: INVITE_PAGE_TITLE,
  description: INVITE_PAGE_DESCRIPTION,
};

export default async function InviteCodePage() {
  return (
    <AnimatedCard>
      <CardTitle className="text-accent">{INVITE_CARD_TITLE}</CardTitle>
      <InviteForm />
    </AnimatedCard>
  );
}
