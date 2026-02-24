"use client"

import { Button } from "@/components/ui/button"
import { usePartnerOnboarding } from "../../../contexts/partner-onboarding-context"
import { CheckCircle, ArrowRight, Users, Target, BarChart3, Sparkles } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

interface PartnerFinalScreenProps {
  onNext?: () => void
  onPrevious: () => void
  onGoToStep: (step: number) => void
}

export function PartnerFinalScreen({ onPrevious }: PartnerFinalScreenProps) {
  const { formData } = usePartnerOnboarding()
  const t = useTranslations('onboarding')

  const isSchool = formData.organizationType === 'school'
  const dashboardUrl = isSchool ? '/school/dashboard/home' : '/partner/profile'

  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      // Save core identity
      localStorage.setItem('organizationType', formData.organizationType || '')
      localStorage.setItem('organizationName', formData.organizationName)
      localStorage.setItem('organizationWebsite', formData.organizationWebsite || '')

      // Save contact info
      localStorage.setItem('onboarding_contactName', formData.contactName)
      localStorage.setItem('onboarding_contactEmail', formData.contactEmail)
      localStorage.setItem('onboarding_contactPhone', formData.contactPhone || '')
      localStorage.setItem('onboarding_contactRole', formData.contactRole || '')

      // Save SDG focus and mission
      localStorage.setItem('onboarding_sdgFocus', JSON.stringify(formData.sdgFocus))
      localStorage.setItem('onboarding_missionStatement', formData.missionStatement || '')

      // Mark as fresh onboarding (not demo login)
      localStorage.setItem('onboarding_completed', 'true')

      if (isSchool) {
        localStorage.setItem('schoolData', JSON.stringify({
          numberOfStudents: formData.numberOfStudents,
          numberOfTeachers: formData.numberOfTeachers,
          gradeLevels: formData.gradeLevels,
          schoolType: formData.schoolType,
          country: formData.country,
          city: formData.city,
          languages: formData.languages,
        }))
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Success header */}
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-600">{t('finalTitle')}</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">{t('finalWelcome')}</h1>
            <p className="mt-2 text-gray-600">
              {t('finalYourProfile')}{' '}
              <span className="font-semibold text-purple-600">
                {formData.organizationName || t('previewYourOrganization')}
              </span>{' '}
              {t('finalProfileReady')}
            </p>
          </div>
        </div>
      </div>

      {/* What's next */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">{t('finalWhatsNext')}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-100">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">{t('finalConnectSchoolsTitle')}</h4>
              <p className="text-sm text-gray-500">{t('finalConnectSchoolsDesc')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">{t('finalLaunchProjectsTitle')}</h4>
              <p className="text-sm text-gray-500">{t('finalLaunchProjectsDesc')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
              <BarChart3 className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">{t('finalTrackImpactTitle')}</h4>
              <p className="text-sm text-gray-500">{t('finalTrackImpactDesc')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100">
              <Sparkles className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">{t('finalShareResourcesTitle')}</h4>
              <p className="text-sm text-gray-500">{t('finalShareResourcesDesc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-between">
        <button
          onClick={onPrevious}
          className="text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          {t('summaryBack')}
        </button>
        <Link href={dashboardUrl}>
          <Button
            size="lg"
            className="bg-purple-600 px-8 font-semibold hover:bg-purple-700"
            onClick={handleComplete}
          >
            {isSchool ? t('finalGoToSchoolDashboard') : t('finalGoToPartnerProfile')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Support */}
      <div className="border-t border-gray-200 pt-6 text-center">
        <p className="mb-2 text-sm text-gray-400">{t('finalQuestionsTitle')}</p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <a href="mailto:support@class2class.org" className="text-purple-600 hover:underline">
            {t('finalEmailSupport')}
          </a>
          <span className="text-gray-200">|</span>
          <Link href="/help" className="text-purple-600 hover:underline">
            {t('finalHelpCenter')}
          </Link>
        </div>
      </div>
    </div>
  )
}
