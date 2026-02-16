'use client'

import { SchoolFormProvider } from '@/contexts/school-form-context'
import SchoolOnboardingFlowImproved from '@/components/onboarding/school-onboarding-flow-improved'

export default function SchoolOnboardingPage() {
  return (
    <SchoolFormProvider>
      <SchoolOnboardingFlowImproved />
    </SchoolFormProvider>
  )
}