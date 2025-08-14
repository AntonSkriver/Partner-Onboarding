"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { WelcomeScreen } from "./components/welcome-screen"
import { RoleSelection } from "./components/role-selection"
import { LanguageSelection } from "./components/language-selection"
import { SchoolInfo } from "./components/school-info"
import { GradesSelection } from "./components/grades-selection"
import { SubjectsSelection } from "./components/subjects-selection"
import { InterestsMotivations } from "./components/interests-motivations"
import { ProfileSummary } from "./components/profile-summary"
import { FinalScreen } from "./components/final-screen"
import { ProgressBar } from "./components/progress-bar"
import { ProfileFormProvider } from "./context/profile-form-context"
import { ProfilePreview } from "./components/profile-preview"
import Image from "next/image"

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  )
}

function OnboardingContent() {
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
    { name: "Welcome", component: WelcomeScreen },
    { name: "Role", component: RoleSelection },
    { name: "School", component: SchoolInfo },
    { name: "Language", component: LanguageSelection },
    { name: "Grades", component: GradesSelection },
    { name: "Subjects", component: SubjectsSelection },
    { name: "Interests", component: InterestsMotivations },
    { name: "Summary", component: ProfileSummary },
    { name: "Complete", component: FinalScreen },
  ]

  // Validate the step parameter
  const currentStep = Math.min(Math.max(initialStep, 0), steps.length - 1)
  const CurrentStepComponent = steps[currentStep].component

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      router.push(`/onboarding?step=${currentStep + 1}`)
      window.scrollTo(0, 0)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      router.push(`/onboarding?step=${currentStep - 1}`)
      window.scrollTo(0, 0)
    }
  }

  const goToStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      router.push(`/onboarding?step=${step}`)
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
    <ProfileFormProvider>
      {currentStep === 0 ? (
        // Welcome Screen - Single Column with Dark Background
        <div className="min-h-screen bg-[#151C2C] flex items-center justify-center px-8 sm:px-4 md:px-5 lg:px-6">
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
                    <ProgressBar
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

          {/* Right Column - Profile Preview */}
          {/* Show on desktop for all steps, or on mobile only for final step */}
          {(currentStep === steps.length - 1 || isDesktop) && (
            <div className={`w-full lg:w-[45%] bg-[#DFCFFF] ${currentStep === steps.length - 1 ? 'min-h-0 py-4' : ''}`}>
              <div className={`${currentStep === steps.length - 1 ? '' : 'sticky top-0 h-screen'}`}>
                <div className="flex flex-col justify-center h-full max-w-[700px] mx-auto px-8 sm:px-4 md:px-5 lg:px-6 py-4 lg:py-6">
                  <div className="lg:ml-8">
                    <ProfilePreview />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </ProfileFormProvider>
  )
}

