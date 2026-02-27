"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useRouter as useI18nRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { createSession } from "@/lib/auth/session"
import { SchoolWelcomeScreen } from "./school-welcome-screen"
import { SchoolNameStep } from "../onboarding/school-steps/school-name-step-improved"
import { SchoolDetailsStep } from "../onboarding/school-steps/school-details-step-improved"
import { ContactStep } from "../onboarding/school-steps/contact-step-improved"
import { InterestsStep } from "../onboarding/school-steps/interests-step-improved"
import { SDGSelectionStep } from "../onboarding/steps/sdg-selection-step"
import { SchoolProgressBar } from "./school-progress-bar"
import { SchoolFormProvider, useSchoolForm } from "@/contexts/school-form-context"
import { SchoolPreview } from "./school-preview"
import { SchoolOnboardingHeader } from "./school-onboarding-header"

export default function SchoolOnboardingPage() {
  const t = useTranslations('schoolOnboarding')
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">{t('loading')}</div>}>
      <SchoolFormProvider>
        <SchoolOnboardingContent />
      </SchoolFormProvider>
    </Suspense>
  )
}

function SchoolOnboardingContent() {
  const router = useRouter()
  const i18nRouter = useI18nRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('schoolOnboarding')
  const { formData } = useSchoolForm()
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
  ]

  const currentStep = Math.min(Math.max(initialStep, 0), steps.length - 1)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic step component with varying prop shapes
  const CurrentStepComponent = steps[currentStep].component as React.ComponentType<any>
  const isWelcome = currentStep === 0
  const showPreview = !isWelcome && isDesktop
  const showProgressBar = !isWelcome

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      router.push(`/school/onboarding?step=${currentStep + 1}`)
      window.scrollTo(0, 0)
    } else {
      // Last step — save onboarding data to localStorage and redirect to dashboard
      localStorage.setItem('onboarding_completed', 'true')
      localStorage.setItem('organizationName', formData.schoolName || '')
      localStorage.setItem('onboarding_contactName', formData.contactName || '')
      localStorage.setItem('onboarding_contactEmail', formData.contactEmail || '')
      if (formData.sdgFocus?.length) {
        localStorage.setItem('onboarding_sdgFocus', JSON.stringify(formData.sdgFocus))
      }
      localStorage.setItem('schoolData', JSON.stringify({
        schoolType: formData.schoolType || '',
        city: formData.city || '',
        country: formData.country || '',
        numberOfStudents: formData.studentCount || 0,
        numberOfTeachers: formData.teacherCount || 0,
        gradeLevels: formData.gradelevels || [],
        languages: formData.languages || [],
      }))

      createSession({
        email: formData.contactEmail || '',
        role: 'teacher',
        organization: formData.schoolName || '',
        name: formData.contactName || '',
        source: 'onboarding',
      })
      i18nRouter.push('/school/dashboard/home')
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
    return currentStep - 1
  }

  const getTotalSteps = () => {
    return steps.length - 1
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
    <div className="min-h-screen bg-gray-50">
      <SchoolOnboardingHeader />

      {showProgressBar && (
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <SchoolProgressBar
              currentStep={getProgressStep()}
              totalSteps={getTotalSteps()}
              stepNames={steps.slice(1).map((step) => step.name)}
              onGoToStep={(step) => goToStep(step + 1)}
            />
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {isWelcome ? (
          <CurrentStepComponent {...stepProps} />
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
  )
}
