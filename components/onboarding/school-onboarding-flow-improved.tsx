'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSchoolForm } from '@/contexts/school-form-context'
import { ProgressBar } from './progress-bar-improved'
import { WelcomeScreenSchool } from './welcome-screen-school'
import { SchoolNameStep } from './school-steps/school-name-step-improved'
import { SchoolDetailsStep } from './school-steps/school-details-step-improved'
import { ContactStep } from './school-steps/contact-step-improved'
import { InterestsStep } from './school-steps/interests-step-improved'
import { SDGSelectionStep } from './steps/sdg-selection-step'
import { SchoolProfilePreview } from './school-profile-preview'
import { SchoolCompletionStep } from './school-steps/school-completion-step-improved'

export default function SchoolOnboardingFlowImproved() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SchoolOnboardingContent />
    </Suspense>
  )
}


function SchoolOnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stepParam = searchParams.get('step')
  const initialStep = stepParam ? parseInt(stepParam) : 0
  const [isDesktop, setIsDesktop] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { formData } = useSchoolForm()

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
    { name: "Welcome", component: WelcomeScreenSchool },
    { name: "School Name", component: SchoolNameStep },
    { name: "School Details", component: SchoolDetailsStep },
    { name: "Contact Information", component: ContactStep },
    { name: "Interests", component: InterestsStep },
    { name: "SDG Focus", component: SDGSelectionStep },
    { name: "Complete", component: SchoolCompletionStep },
  ]

  // Validate the step parameter
  const currentStep = Math.min(Math.max(initialStep, 0), steps.length - 1)
  const CurrentStepComponent = steps[currentStep].component

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      router.push(`/school/onboarding?step=${currentStep + 1}`)
      window.scrollTo(0, 0)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      router.push(`/school/onboarding?step=${currentStep - 1}`)
      window.scrollTo(0, 0)
    }
  }

  const goToStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      router.push(`/school/onboarding?step=${step}`)
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

  const isWelcomeStep = currentStep === 0
  const isFinalStep = currentStep === steps.length - 1
  const shouldShowPreviewPanel = (isDesktop && !isWelcomeStep) || isFinalStep

  return (
    <div className="min-h-screen bg-white">
      {isWelcomeStep ? (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-6 sm:px-8 lg:px-12">
          <CurrentStepComponent
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
            onGoToStep={goToStep}
            context="school"
          />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row min-h-screen max-w-[1920px] mx-auto">
          {/* Form column */}
          <div className="w-full lg:w-[55%] bg-white">
            <div className={`relative flex flex-col justify-center mx-auto px-6 sm:px-8 lg:px-12 py-8 lg:py-12 ${isFinalStep ? 'min-h-0' : 'min-h-screen'} max-w-[720px]`}>
              {!isFinalStep && (
                <div className="absolute top-0 left-0 right-0 bg-white/95 border-b border-gray-100 z-10">
                  <div className="max-w-[720px] mx-auto px-6 sm:px-8 lg:px-12 py-4">
                    <ProgressBar
                      currentStep={getProgressStep()}
                      totalSteps={getTotalSteps()}
                      stepNames={steps.slice(1, -1).map(step => step.name)}
                      onGoToStep={(step) => goToStep(step + 1)}
                    />
                  </div>
                </div>
              )}

              <div className={isFinalStep ? 'mt-6' : 'mt-20 pt-4'}>
                <CurrentStepComponent
                  onNext={goToNextStep}
                  onPrevious={goToPreviousStep}
                  onGoToStep={goToStep}
                  context="school"
                />
              </div>
            </div>
          </div>

          {/* Preview column */}
          {shouldShowPreviewPanel && (
            <div className={`w-full lg:w-[45%] bg-gradient-to-br from-green-50 via-white to-blue-50 ${isFinalStep ? 'py-12' : ''}`}>
              <div className={`${isFinalStep ? '' : 'sticky top-0 h-screen'}`}>
                <div className="flex flex-col justify-center h-full max-w-[700px] mx-auto px-6 sm:px-8 lg:px-12 py-8 lg:py-12">
                  <div className="lg:ml-8">
                    <SchoolProfilePreview formData={formData} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
