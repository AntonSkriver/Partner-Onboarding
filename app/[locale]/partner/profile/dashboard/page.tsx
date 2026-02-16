'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Building2 } from 'lucide-react'
import { ProfileDashboardGrid } from '@/components/profile/profile-dashboard-grid'
import { getCurrentSession } from '@/lib/auth/session'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { buildProfileDashboardCards } from '@/lib/profile/dashboard-cards'
import {
  buildProgramSummariesForPartner,
  type ProgramSummary,
} from '@/lib/programs/selectors'

export default function PartnerDashboardPage() {
  const t = useTranslations('dashboard')
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<ReturnType<typeof getCurrentSession>>(null)
  const { ready: prototypeReady, database } = usePrototypeDb()

  useEffect(() => {
    const s = getCurrentSession()
    setSession(s)
    setLoading(false)
  }, [])

  const normalizedOrganizationName = session?.organization
    ? session.organization.trim().toLowerCase()
    : null

  const partnerRecord = useMemo(() => {
    if (!database) return null
    if (normalizedOrganizationName) {
      const match = database.partners.find(
        (partner) => partner.organizationName.toLowerCase() === normalizedOrganizationName,
      )
      if (match) return match
    }
    return database.partners.length > 0 ? database.partners[0] : null
  }, [database, normalizedOrganizationName])

  const programSummaries = useMemo<ProgramSummary[]>(() => {
    if (!prototypeReady || !database || !partnerRecord) return []
    return buildProgramSummariesForPartner(database, partnerRecord.id, {
      includeRelatedPrograms: true,
    })
  }, [prototypeReady, database, partnerRecord])

  const stats = useMemo(() => {
    const uniqueSchools = new Set<string>()
    const uniqueCountries = new Set<string>()
    let totalStudents = 0
    let totalEducators = 0

    programSummaries.forEach((summary) => {
      summary.institutions.forEach((inst) => {
        const name = inst.name?.trim()
        if (name) uniqueSchools.add(name.toLowerCase())
        if (inst.country) uniqueCountries.add(inst.country)
        totalStudents += inst.activeStudentCount || 0
      })
      summary.teachers.forEach((t) => {
        if (t.status === 'active') totalEducators++
      })
    })

    return {
      programs: programSummaries.length,
      schools: uniqueSchools.size,
      countries: uniqueCountries.size,
      students: totalStudents,
      educators: totalEducators,
    }
  }, [programSummaries])

  const dashboardCards = useMemo(
    () =>
      buildProfileDashboardCards('/partner/profile', {
        programs: {
          description:
            stats.programs > 0
              ? `${stats.programs} active program${stats.programs > 1 ? 's' : ''} across ${stats.countries} ${stats.countries === 1 ? 'country' : 'countries'}.`
              : 'Create and manage your global education programs.',
        },
        analytics: {
          description:
            stats.programs > 0
              ? `${stats.students.toLocaleString()} students across ${stats.schools} ${stats.schools === 1 ? 'school' : 'schools'}.`
              : 'Track your program performance and global reach.',
        },
        network: {
          description:
            stats.educators > 0
              ? `${stats.educators} active educator${stats.educators > 1 ? 's' : ''} in your network.`
              : 'Manage coordinators and educational institutions.',
        },
        contact: {
          description: partnerRecord?.contactEmail || 'View and update your contact details.',
        },
      }),
    [
      partnerRecord?.contactEmail,
      stats.countries,
      stats.educators,
      stats.programs,
      stats.schools,
      stats.students,
    ],
  )

  if (loading || !prototypeReady) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!partnerRecord) {
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <Building2 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h2 className="mb-2 text-lg font-semibold text-gray-900">{t('noOrgProfile')}</h2>
          <p className="text-gray-600">{t('pleaseCreateProfile')}</p>
        </CardContent>
      </Card>
    )
  }

  return <ProfileDashboardGrid greeting={t('hi', { name: partnerRecord.organizationName })} cards={dashboardCards} />
}
