'use client'

import { PartnerFormProvider } from '@/contexts/partner-form-context'
import PartnerOnboardingFlowImproved from '@/components/onboarding/partner-onboarding-flow-improved'

export default function PartnerOnboardingImprovedPage() {
  return (
    <PartnerFormProvider>
      <PartnerOnboardingFlowImproved />
    </PartnerFormProvider>
  )
} 