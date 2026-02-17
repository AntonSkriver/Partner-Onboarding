'use client'

import { useState, useEffect, useMemo } from 'react'
import { Link } from '@/i18n/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Layers } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { getCurrentSession } from '@/lib/auth/session'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { buildProgramCatalog } from '@/lib/programs/selectors'
import { ProgramCatalogCard } from '@/components/program/program-catalog-card'

export default function CoordinatorProgramsPage() {
  const t = useTranslations('coordinator')
  const tp = useTranslations('programs')
  const [session, setSession] = useState<ReturnType<typeof getCurrentSession> | null>(null)
  useEffect(() => {
    setSession(getCurrentSession())
  }, [])
  const { ready, database } = usePrototypeDb()

  const coordinatorRecords = useMemo(() => {
    if (!database || !session?.email) return []
    return database.coordinators.filter(
      (c) => c.email.toLowerCase() === session.email.toLowerCase(),
    )
  }, [database, session?.email])

  const programCatalog = useMemo(() => {
    if (!database || coordinatorRecords.length === 0) return []

    const programIds = new Set(coordinatorRecords.map((c) => c.programId))
    const catalog = buildProgramCatalog(database, { includePrivate: true })
    return catalog.filter((item) => programIds.has(item.programId))
  }, [database, coordinatorRecords])

  if (!ready || !database) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">{t('myProgramsTitle')}</h1>
        <p className="mt-1 text-sm text-gray-600">
          {t('myProgramsSubtitle', { organization: session?.organization ?? 'your organization' })}
        </p>
      </div>

      {programCatalog.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {programCatalog.map((item) => (
            <ProgramCatalogCard
              key={item.programId}
              item={item}
              actions={
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/partner/programs/${item.programId}`}>{tp('viewDetails')}</Link>
                </Button>
              }
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="space-y-4 p-10 text-center">
            <Layers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">{tp('noProgramsAssigned')}</h3>
            <p className="text-gray-500">
              {tp('contactAdmin')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
