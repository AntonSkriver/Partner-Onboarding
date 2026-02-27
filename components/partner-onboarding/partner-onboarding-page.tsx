"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { PartnerWelcomeScreen } from "./components/partner-welcome-screen"
import { PartnerOrganizationDetails } from "./components/partner-organization-details"
import { PartnerMissionSdg } from "./components/partner-mission-sdg"
import { PartnerContactInfo } from "./components/partner-contact-info"
import { PartnerSummary } from "./components/partner-summary"
import { PartnerProgressBar } from "./components/partner-progress-bar"
import { PartnerOnboardingProvider } from "../../contexts/partner-onboarding-context"
import { PartnerPreview } from "./components/partner-preview"
import { PartnerOnboardingHeader } from "./components/partner-onboarding-header"

export default function PartnerOnboardingPage() {
  const t = useTranslations('onboarding')
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">{t('loading')}</div>}>
      <PartnerOnboardingProvider>
        <PartnerOnboardingContent />
      </PartnerOnboardingProvider>
    </Suspense>
  )
}

function PartnerOnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('onboarding')
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
    { name: t('stepWelcome'), component: PartnerWelcomeScreen },
    { name: t('stepDetails'), component: PartnerOrganizationDetails },
    { name: t('stepSdgFocus'), component: PartnerMissionSdg },
    { name: t('stepContact'), component: PartnerContactInfo },
    { name: t('stepSummary'), component: PartnerSummary },
  ]

  const currentStep = Math.min(Math.max(initialStep, 0), steps.length - 1)
  const CurrentStepComponent = steps[currentStep].component
  const isWelcome = currentStep === 0
  const showPreview = !isWelcome && isDesktop
  const showProgressBar = !isWelcome

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

  const getProgressStep = () => {
    if (currentStep === 0) return 0
    return currentStep - 1
  }

  const getTotalSteps = () => {
    return steps.length - 1
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard header — always visible, same as partner-shell */}
      <PartnerOnboardingHeader />

      {/* Progress bar strip (steps 1-5 only) */}
      {showProgressBar && (
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <PartnerProgressBar
              currentStep={getProgressStep()}
              totalSteps={getTotalSteps()}
              stepNames={steps.slice(1).map((step) => step.name)}
              onGoToStep={(step) => goToStep(step + 1)}
            />
          </div>
        </div>
      )}

      {/* Main content — same container as dashboard */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {isWelcome ? (
          <CurrentStepComponent onNext={goToNextStep} onPrevious={goToPreviousStep} onGoToStep={goToStep} />
        ) : (
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="w-full lg:w-[60%]">
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="p-6 sm:p-8">
                  <CurrentStepComponent onNext={goToNextStep} onPrevious={goToPreviousStep} onGoToStep={goToStep} />
                </div>
              </div>
            </div>
            {showPreview && (
              <div className="w-full lg:w-[40%]">
                <div className="lg:sticky lg:top-6">
                  <PartnerPreview currentStep={currentStep} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
