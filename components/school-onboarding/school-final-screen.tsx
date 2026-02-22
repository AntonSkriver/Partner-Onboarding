"use client"

import { Button } from "@/components/ui/button"
import { useSchoolForm } from "@/contexts/school-form-context"
import { CheckCircle, ArrowRight, Users, Target, BarChart3, BookOpen } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

interface SchoolFinalScreenProps {
  onNext?: () => void
  onPrevious: () => void
  onGoToStep: (step: number) => void
}

export function SchoolFinalScreen({ onPrevious }: SchoolFinalScreenProps) {
  const { formData } = useSchoolForm()
  const t = useTranslations('schoolOnboarding')

  return (
    <div className="space-y-8">
      {/* Success header */}
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-600">{t('finalSuccessLabel')}</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">{t('finalTitle')}</h1>
            <p className="mt-2 text-gray-600">
              {t('finalProfileFor')}{' '}
              <span className="font-semibold text-purple-600">
                {formData.schoolName || t('previewYourSchool')}
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
              <Target className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">{t('finalBrowseProjectsTitle')}</h4>
              <p className="text-sm text-gray-500">{t('finalBrowseProjectsDesc')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">{t('finalConnectSchoolsTitle')}</h4>
              <p className="text-sm text-gray-500">{t('finalConnectSchoolsDesc')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
              <BookOpen className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">{t('finalAccessResourcesTitle')}</h4>
              <p className="text-sm text-gray-500">{t('finalAccessResourcesDesc')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100">
              <BarChart3 className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">{t('finalTrackImpactTitle')}</h4>
              <p className="text-sm text-gray-500">{t('finalTrackImpactDesc')}</p>
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
          {t('back')}
        </button>
        <Link href="/school/dashboard">
          <Button
            size="lg"
            className="bg-purple-600 px-8 font-semibold hover:bg-purple-700"
          >
            {t('finalGoToDashboard')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Support */}
      <div className="border-t border-gray-200 pt-6 text-center">
        <p className="mb-2 text-sm text-gray-400">{t('finalNeedHelp')}</p>
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
