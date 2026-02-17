'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { LanguageSwitcher } from '@/components/language-switcher'
import { usePartnerOnboarding } from '@/contexts/partner-onboarding-context'

export function PartnerOnboardingHeader() {
  const t = useTranslations('onboarding')
  const tShell = useTranslations('shell')
  const { formData } = usePartnerOnboarding()

  const orgName = formData.organizationName?.trim()
  const initials = orgName
    ? orgName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'C2'

  return (
    <header className="border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/isotipo.png"
              alt="Class2Class"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-lg font-semibold text-gray-900">{tShell('class2classPartner')}</span>
          </Link>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            {t('welcomeTitle')}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          {orgName && (
            <div className="hidden text-right md:block">
              <p className="text-sm font-medium text-gray-900">{orgName}</p>
            </div>
          )}
          {orgName && (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white">
              {initials}
            </div>
          )}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}
