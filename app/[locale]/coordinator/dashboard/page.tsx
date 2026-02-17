'use client'

import { useState, useEffect, useMemo } from 'react'
import { Link } from '@/i18n/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Layers, Building2, School, GraduationCap, Users, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { getCurrentSession } from '@/lib/auth/session'
import { usePrototypeDb } from '@/hooks/use-prototype-db'

export default function CoordinatorDashboardPage() {
  const t = useTranslations('dashboard')
  const tc = useTranslations('coordinator')
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

  const stats = useMemo(() => {
    if (!database || coordinatorRecords.length === 0)
      return { programs: 0, schools: 0, teachers: 0, region: '' }

    const programIds = new Set(coordinatorRecords.map((c) => c.programId))
    const coordinatorIds = new Set(coordinatorRecords.map((c) => c.id))
    const region = coordinatorRecords[0]?.region ?? ''

    const institutions = database.institutions.filter((inst) =>
      coordinatorIds.has(inst.coordinatorId),
    )
    const institutionIds = new Set(institutions.map((i) => i.id))

    const teachers = database.institutionTeachers.filter((t) =>
      institutionIds.has(t.institutionId),
    )

    return {
      programs: programIds.size,
      schools: institutions.length,
      teachers: teachers.length,
      region,
    }
  }, [database, coordinatorRecords])

  if (!ready || !database) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    )
  }

  const firstName = session?.name?.split(' ')[0] ?? 'Coordinator'

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">{t('hi', { name: firstName })}</h1>
        <p className="mt-1 text-sm text-gray-600">
          {t('coordinatorFor', { organization: session?.organization ?? 'your organization' })}
          {stats.region ? ` · ${stats.region}` : ''}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100">
              <Layers className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.programs}</p>
              <p className="text-sm text-gray-500">{t('programs')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
              <School className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.schools}</p>
              <p className="text-sm text-gray-500">{t('schools')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.teachers}</p>
              <p className="text-sm text-gray-500">{t('teachers')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="group transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100">
              <Layers className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{tc('myProgramsTitle')}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('viewPrograms')}
            </p>
            <Button variant="link" className="mt-3 h-auto p-0 text-purple-600" asChild>
              <Link href="/coordinator/programs">
                {t('viewPrograms')} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="group transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t('partnerContentHub')}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('partnerContentHubDesc', { organization: session?.organization ?? 'your partner' })}
            </p>
            <Button variant="link" className="mt-3 h-auto p-0 text-purple-600" asChild>
              <Link href="/coordinator/partner">
                {t('openHub')} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
