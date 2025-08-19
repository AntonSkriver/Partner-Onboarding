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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
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

              {/* School Profile Preview */}
              {currentStep > 0 && currentStep < steps.length - 1 && (
                <div className="mt-8">
                  <SchoolProfilePreview formData={formData} />
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
                context="school"
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
              context="school"
            />
          </div>
        </div>
      )}
    </div>
  )
}