"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { SchoolWelcomeScreen } from "./school-welcome-screen"
import { SchoolNameStep } from "../onboarding/school-steps/school-name-step-improved"
import { SchoolDetailsStep } from "../onboarding/school-steps/school-details-step-improved"
import { ContactStep } from "../onboarding/school-steps/contact-step-improved"
import { InterestsStep } from "../onboarding/school-steps/interests-step-improved"
import { SDGSelectionStep } from "../onboarding/steps/sdg-selection-step"
import { SchoolFinalScreen } from "./school-final-screen"
import { SchoolProgressBar } from "./school-progress-bar"
import { SchoolFormProvider } from "@/contexts/school-form-context"
import { SchoolPreview } from "./school-preview"
import { SchoolOnboardingHeader } from "./school-onboarding-header"

export default function SchoolOnboardingPage() {
  const t = useTranslations('schoolOnboarding')
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">{t('loading')}</div>}>
      <SchoolOnboardingContent />
    </Suspense>
  )
}

function SchoolOnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('schoolOnboarding')
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
    { name: t('stepWelcome'), component: SchoolWelcomeScreen },
    { name: t('stepSchoolName'), component: SchoolNameStep },
    { name: t('stepDetails'), component: SchoolDetailsStep },
    { name: t('stepContact'), component: ContactStep },
    { name: t('stepInterests'), component: InterestsStep },
    { name: t('stepSdg'), component: SDGSelectionStep },
    { name: t('stepComplete'), component: SchoolFinalScreen },
  ]

  const currentStep = Math.min(Math.max(initialStep, 0), steps.length - 1)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic step component with varying prop shapes
  const CurrentStepComponent = steps[currentStep].component as React.ComponentType<any>
  const isFinal = currentStep === steps.length - 1
  const isWelcome = currentStep === 0
  const showPreview = !isWelcome && isDesktop
  const showProgressBar = !isWelcome && !isFinal

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

  const getProgressStep = () => {
    if (currentStep === 0) return 0
    if (currentStep === steps.length - 1) return steps.length - 2
    return currentStep - 1
  }

  const getTotalSteps = () => {
    return steps.length - 2
  }

  if (!mounted) {
    return null
  }

  // Build common props for step components
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stepProps: Record<string, any> = {
    onNext: goToNextStep,
    onPrevious: goToPreviousStep,
    onGoToStep: goToStep,
  }

  // SDG step has different props
  if (currentStep === 5) {
    stepProps.onBack = goToPreviousStep
    stepProps.currentStep = getProgressStep()
    stepProps.totalSteps = getTotalSteps()
    stepProps.context = 'school'
  }

  return (
    <SchoolFormProvider>
      <div className="min-h-screen bg-gray-50">
        <SchoolOnboardingHeader />

        {showProgressBar && (
          <div className="border-b border-gray-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
              <SchoolProgressBar
                currentStep={getProgressStep()}
                totalSteps={getTotalSteps()}
                stepNames={steps.slice(1, -1).map((step) => step.name)}
                onGoToStep={(step) => goToStep(step + 1)}
              />
            </div>
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {isWelcome ? (
            <CurrentStepComponent {...stepProps} />
          ) : isFinal ? (
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="w-full lg:w-[55%]">
                <CurrentStepComponent {...stepProps} />
              </div>
              <div className="w-full lg:w-[45%]">
                <div className="lg:sticky lg:top-6">
                  <SchoolPreview currentStep={currentStep} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="w-full lg:w-[60%]">
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="p-6 sm:p-8">
                    <CurrentStepComponent {...stepProps} />
                  </div>
                </div>
              </div>
              {showPreview && (
                <div className="w-full lg:w-[40%]">
                  <div className="lg:sticky lg:top-6">
                    <SchoolPreview currentStep={currentStep} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </SchoolFormProvider>
  )
}
