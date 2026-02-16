'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { type ProfileDashboardCard } from '@/lib/profile/dashboard-cards'

interface ProfileDashboardGridProps {
  greeting: string
  cards: ProfileDashboardCard[]
  title?: string
  description?: string
}

export function ProfileDashboardGrid({
  greeting,
  cards,
  title,
  description,
}: ProfileDashboardGridProps) {
  const t = useTranslations('dashboard')
  const tc = useTranslations('common')
  const resolvedTitle = title ?? t('yourGlobalHub')
  const resolvedDescription = description ?? t('everythingYouNeed')
  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-gray-900">{greeting}</h1>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">{resolvedTitle}</h2>
          <p className="text-sm text-gray-600">{resolvedDescription}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <Card key={card.id} className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
                <CardContent className="space-y-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                    <Icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                    <p className="text-sm text-gray-600">{card.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" className="px-0 text-sm text-purple-600 hover:text-purple-700">
                      {tc('learnMore')}
                    </Button>
                    <Button variant="profile" size="sm" asChild>
                      <Link href={card.href}>{card.ctaLabel}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
