"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PartnerWelcomeScreen } from "./components/partner-welcome-screen"
import { PartnerTypeSelection } from "./components/partner-type-selection"
import { PartnerOrganizationDetails } from "./components/partner-organization-details"
import { PartnerMissionSdg } from "./components/partner-mission-sdg"
import { PartnerContactInfo } from "./components/partner-contact-info"
import { PartnerSummary } from "./components/partner-summary"
import { PartnerFinalScreen } from "./components/partner-final-screen"
import { PartnerProgressBar } from "./components/partner-progress-bar"
import { PartnerOnboardingProvider } from "../../contexts/partner-onboarding-context"
import { PartnerPreview } from "./components/partner-preview"

export default function PartnerOnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
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
    { name: "Welcome", component: PartnerWelcomeScreen },
    { name: "Type", component: PartnerTypeSelection },
    { name: "Details", component: PartnerOrganizationDetails },
    { name: "Mission", component: PartnerMissionSdg },
    { name: "Contact", component: PartnerContactInfo },
    { name: "Summary", component: PartnerSummary },
    { name: "Complete", component: PartnerFinalScreen },
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
    <PartnerOnboardingProvider>
      {currentStep === 0 ? (
        // Welcome Screen - Single Column with Dark Background
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center px-8 sm:px-4 md:px-5 lg:px-6">
          <CurrentStepComponent onNext={goToNextStep} onPrevious={goToPreviousStep} onGoToStep={goToStep} />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row min-h-screen max-w-[1920px] mx-auto">
          {/* Left Column - Form */}
          <div className={`w-full ${currentStep === steps.length - 1 ? 'lg:w-[55%] min-h-0' : 'lg:w-[55%]'} bg-white`}>
            <div className={`relative flex flex-col justify-center mx-auto px-8 sm:px-4 md:px-5 lg:px-6 py-4 lg:py-6 ${currentStep === steps.length - 1 ? 'min-h-0' : 'min-h-screen'} max-w-[700px]`}>
              {/* Progress Bar - Moved to top */}
              {currentStep !== steps.length - 1 && (
                <div className="absolute top-0 left-0 right-0 bg-white z-10">
                  <div className="max-w-[700px] mx-auto px-8 sm:px-4 md:px-5 lg:px-6 py-4">
                    <PartnerProgressBar
                      currentStep={getProgressStep()}
                      totalSteps={getTotalSteps()}
                      stepNames={steps.slice(1, -1).map((step) => step.name)}
                      onGoToStep={(step) => goToStep(step + 1)}
                    />
                  </div>
                </div>
              )}

              <div className={currentStep === steps.length - 1 ? 'mt-4' : 'mt-20 pt-4'}>
                <CurrentStepComponent onNext={goToNextStep} onPrevious={goToPreviousStep} onGoToStep={goToStep} />
              </div>
            </div>
          </div>

          {/* Right Column - Partner Preview */}
          {/* Show on desktop for all steps, or on mobile only for final step */}
          {(currentStep === steps.length - 1 || isDesktop) && (
            <div className={`w-full lg:w-[45%] bg-gradient-to-br from-purple-50 to-blue-50 ${currentStep === steps.length - 1 ? 'min-h-0 py-4' : ''}`}>
              <div className={`${currentStep === steps.length - 1 ? '' : 'sticky top-0 h-screen'}`}>
                <div className="flex flex-col justify-center h-full max-w-[700px] mx-auto px-8 sm:px-4 md:px-5 lg:px-6 py-4 lg:py-6">
                  <div className="lg:ml-8">
                    <PartnerPreview />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </PartnerOnboardingProvider>
  )
}