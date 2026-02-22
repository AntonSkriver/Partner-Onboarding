"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Globe2, Users, Target, Zap } from "lucide-react"
import { useTranslations } from "next-intl"

interface SchoolWelcomeScreenProps {
  onNext: () => void
  onPrevious?: () => void
  onGoToStep?: (step: number) => void
}

export function SchoolWelcomeScreen({ onNext }: SchoolWelcomeScreenProps) {
  const t = useTranslations('schoolOnboarding')
  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-10 sm:px-10 sm:py-12">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            {t('welcomeTitle')}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-purple-100">
            {t('welcomeSubtitle')}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              onClick={onNext}
              size="lg"
              className="bg-white text-purple-700 hover:bg-purple-50 font-semibold px-8 shadow-lg"
            >
              {t('welcomeGetStarted')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <span className="flex items-center gap-1.5 text-sm text-purple-200">
              <Zap className="h-3.5 w-3.5" />
              {t('welcomeTimeEstimate')}
            </span>
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
            <Globe2 className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900">{t('welcomeFeatureGlobalTitle')}</h3>
          <p className="mt-1 text-sm text-gray-500 leading-relaxed">
            {t('welcomeFeatureGlobalDesc')}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">{t('welcomeFeatureCulturalTitle')}</h3>
          <p className="mt-1 text-sm text-gray-500 leading-relaxed">
            {t('welcomeFeatureCulturalDesc')}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
            <Target className="h-5 w-5 text-emerald-600" />
          </div>
          <h3 className="font-semibold text-gray-900">{t('welcomeFeatureSdgTitle')}</h3>
          <p className="mt-1 text-sm text-gray-500 leading-relaxed">
            {t('welcomeFeatureSdgDesc')}
          </p>
        </div>
      </div>

      {/* Trust bar */}
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            {t('welcomeTrustedBy')}
          </p>
          <div className="flex items-center gap-6 text-sm font-medium text-gray-300">
            <span>UNICEF</span>
            <span>UNESCO</span>
            <span>LEGO Education</span>
            <span>Microsoft</span>
          </div>
        </div>
      </div>
    </div>
  )
}
