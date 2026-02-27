'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Building2, CheckCircle2, Circle, ArrowRight } from 'lucide-react'
import { ProfileDashboardGrid } from '@/components/profile/profile-dashboard-grid'
import { getCurrentSession, isOnboardedUser } from '@/lib/auth/session'
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
    if (isOnboardedUser(session)) return null
    if (normalizedOrganizationName) {
      const match = database.partners.find(
        (partner) => partner.organizationName.toLowerCase() === normalizedOrganizationName,
      )
      if (match) return match
    }
    return database.partners.length > 0 ? database.partners[0] : null
  }, [database, normalizedOrganizationName, session?.source])

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

  const profileChecklist = useMemo(() => {
    if (!partnerRecord) return { items: [] as const, completedCount: 0, total: 4, allDone: false }

    const hasMission = !!(partnerRecord.mission || partnerRecord.description)
    const hasSdg = (partnerRecord.sdgFocus ?? []).length > 0
    const hasContacts = !!partnerRecord.contactEmail
    const hasPrograms = stats.programs > 0

    const items = [
      { key: 'addMission', done: hasMission, href: '/partner/profile/edit' },
      { key: 'addSdgFocus', done: hasSdg, href: '/partner/profile/edit' },
      { key: 'addContacts', done: hasContacts, href: '/partner/profile/edit' },
      { key: 'createFirstProgram', done: hasPrograms, href: '/partner/programs/create' },
    ] as const

    const completedCount = items.filter((i) => i.done).length
    return { items, completedCount, total: items.length, allDone: completedCount === items.length }
  }, [partnerRecord, stats.programs])

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

  // For fresh onboarded users without a seed partner match, show a welcome dashboard
  const freshProfile = isOnboardedUser(session)

  if (!partnerRecord && !freshProfile) {
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

  const orgDisplayName = partnerRecord?.organizationName ?? session?.organization ?? ''

  return (
    <div className="space-y-6">
      {partnerRecord && !profileChecklist.allDone && (
        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t('completeYourProfile')}</h3>
                <p className="text-sm text-gray-600">{t('completeYourProfileDesc')}</p>
              </div>
              <span className="text-sm font-medium text-purple-600">
                {profileChecklist.completedCount}/{profileChecklist.total}
              </span>
            </div>
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-purple-100">
              <div
                className="h-full rounded-full bg-purple-600 transition-all"
                style={{ width: `${(profileChecklist.completedCount / profileChecklist.total) * 100}%` }}
              />
            </div>
            <div className="space-y-2">
              {profileChecklist.items.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                    item.done
                      ? 'text-gray-400'
                      : 'text-gray-700 hover:bg-purple-100/60'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {item.done ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-300" />
                    )}
                    <span className={item.done ? 'line-through' : ''}>{t(item.key)}</span>
                  </span>
                  {!item.done && <ArrowRight className="h-4 w-4 text-purple-500" />}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      <ProfileDashboardGrid greeting={t('hi', { name: orgDisplayName })} cards={dashboardCards} />
    </div>
  )
}
