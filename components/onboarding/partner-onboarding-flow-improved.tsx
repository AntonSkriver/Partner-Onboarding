'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import { usePartnerForm } from '@/contexts/partner-form-context'
import { ProgressBar } from './progress-bar-improved'
import { WelcomeScreen } from './welcome-screen-improved'
import { PartnerTypeSelection } from './partner-type-selection'
import { OrganizationDetails } from './organization-details'
import { MissionStatementStep } from './mission-statement-step'
import { SdgSelectionStep } from './sdg-selection-step'
import { ContactInformation } from './contact-information'
import { ProfilePreview } from './profile-preview-improved'
import { FinalScreen } from './final-screen-improved'

export default function PartnerOnboardingFlowImproved() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PartnerOnboardingContent />
    </Suspense>
  )
}

function PartnerOnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stepParam = searchParams.get('step')
  const initialStep = stepParam ? parseInt(stepParam) : 0
  const [isDesktop, setIsDesktop] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { formData } = usePartnerForm()

  useEffect(() => {
    setMounted(true)
    const checkWidth = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    checkWidth()
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
  }, [])

  const steps = [
    { name: "Welcome", component: WelcomeScreen },
    { name: "Organization Type", component: PartnerTypeSelection },
    { name: "Organization Details", component: OrganizationDetails },
    { name: "Mission", component: MissionStatementStep },
    { name: "SDG Selection", component: SdgSelectionStep },
    { name: "Contact Information", component: ContactInformation },
    { name: "Preview", component: ProfilePreview },
    { name: "Complete", component: FinalScreen },
  ]

  // Validate the step parameter
  const currentStep = Math.min(Math.max(initialStep, 0), steps.length - 1)
  const CurrentStepComponent = steps[currentStep].component

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      router.push(`/partner/onboarding?step=${currentStep + 1}`)
      window.scrollTo(0, 0)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      router.push(`/partner/onboarding?step=${currentStep - 1}`)
      window.scrollTo(0, 0)
    }
  }

  const goToStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      router.push(`/partner/onboarding?step=${step}`)
      window.scrollTo(0, 0)
    }
  }

  // Calculate the progress step (excluding Welcome and Final screens)
  const getProgressStep = () => {
    if (currentStep === 0) return 0 // Welcome screen
    if (currentStep === steps.length - 1) return steps.length - 2 // Final screen
    return currentStep - 1 // All other steps
  }

  // Get the total number of steps (excluding Welcome and Final screens)
  const getTotalSteps = () => {
    return steps.length - 2 // -2 because we exclude Welcome and Final screens
  }

  if (!mounted) {
    return null // Prevent hydration issues by not rendering until mounted
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Desktop Layout */}
      {isDesktop ? (
        <div className="flex min-h-screen">
          {/* Left Panel - Progress and Preview */}
          <div className="w-1/2 bg-white border-r border-gray-200 p-8">
            <div className="max-w-md mx-auto">
              {/* Progress Bar */}
              {currentStep > 0 && currentStep < steps.length - 1 && (
                <div className="mb-8">
                  <ProgressBar
                    currentStep={getProgressStep()}
                    totalSteps={getTotalSteps()}
                    stepNames={steps.slice(1, -1).map(step => step.name)}
                    onGoToStep={(step) => goToStep(step + 1)}
                  />
                </div>
              )}

              {/* Profile Preview */}
              {currentStep > 0 && currentStep < steps.length - 1 && (
                <div className="mt-8">
                  <ProfilePreview formData={formData} />
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Current Step */}
          <div className="w-1/2 bg-white p-8">
            <div className="max-w-md mx-auto">
              <CurrentStepComponent
                onNext={goToNextStep}
                onPrevious={goToPreviousStep}
                onGoToStep={goToStep}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Mobile Layout */
        <div className="min-h-screen bg-white">
          <div className="max-w-md mx-auto p-4">
            {/* Progress Bar for Mobile */}
            {currentStep > 0 && currentStep < steps.length - 1 && (
              <div className="mb-6">
                <ProgressBar
                  currentStep={getProgressStep()}
                  totalSteps={getTotalSteps()}
                  stepNames={steps.slice(1, -1).map(step => step.name)}
                  onGoToStep={(step) => goToStep(step + 1)}
                />
              </div>
            )}

            {/* Current Step */}
            <CurrentStepComponent
              onNext={goToNextStep}
              onPrevious={goToPreviousStep}
              onGoToStep={goToStep}
            />
          </div>
        </div>
      )}
    </div>
  )
} 