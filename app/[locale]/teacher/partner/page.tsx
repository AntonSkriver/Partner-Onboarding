'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Building2,
  Globe,
  MapPin,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { getCurrentSession } from '@/lib/auth/session'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { buildProgramSummariesForPartner } from '@/lib/programs/selectors'
import { SDG_DATA } from '@/components/sdg-icons'

export default function TeacherPartnerPage() {
  const t = useTranslations('coordinator')
  const td = useTranslations('dashboard')
  const [session] = useState(() => getCurrentSession())
  const { ready, database } = usePrototypeDb()

  // Trace: teacher email → institutionTeachers → institution → program → partner
  const partnerRecord = useMemo(() => {
    if (!database || !session?.email) return null

    // Find teacher records by email
    const teacherRecords = database.institutionTeachers.filter(
      (t) => t.email.toLowerCase() === session.email.toLowerCase(),
    )
    if (teacherRecords.length === 0) return null

    // Get the institutions the teacher belongs to
    const institutionIds = new Set(teacherRecords.map((t) => t.institutionId))
    const institutions = database.institutions.filter((i) => institutionIds.has(i.id))
    if (institutions.length === 0) return null

    // Get the programs from those institutions
    const programIds = new Set(institutions.map((i) => i.programId))

    // Find the partner that hosts these programs
    const partnerIds = new Set<string>()
    database.programs
      .filter((p) => programIds.has(p.id))
      .forEach((p) => partnerIds.add(p.partnerId))

    // Return the first partner found (prefer the primary one)
    if (partnerIds.size === 0) return null
    return database.partners.find((p) => partnerIds.has(p.id)) ?? null
  }, [database, session?.email])

  const stats = useMemo(() => {
    if (!database || !partnerRecord) return null
    const summaries = buildProgramSummariesForPartner(database, partnerRecord.id, {
      includeRelatedPrograms: true,
    })

    const schoolSet = new Set<string>()
    const teacherSet = new Set<string>()
    const countrySet = new Set<string>()

    summaries.forEach((s) => {
      s.institutions.forEach((inst) => {
        schoolSet.add(inst.id)
        if (inst.country) countrySet.add(inst.country)
      })
      s.teachers.forEach((t) => teacherSet.add(t.id))
    })

    return {
      programs: summaries.length,
      schools: schoolSet.size,
      teachers: teacherSet.size,
      countries: countrySet.size,
    }
  }, [database, partnerRecord])

  if (!ready || !database) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">{t('myPartner')}</h1>
        <p className="mt-1 text-sm text-gray-600">
          {t('myPartnerSubtitle', { organization: partnerRecord?.organizationName ?? session?.organization ?? 'your partner' })}
        </p>
      </div>

      {partnerRecord ? (
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 px-6 py-8 text-white">
            <div className="flex items-start gap-4">
              {partnerRecord.logo ? (
                <img
                  src={partnerRecord.logo}
                  alt={partnerRecord.organizationName}
                  className="h-20 w-20 rounded-2xl bg-white object-contain p-2 shadow-lg"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20">
                  <Building2 className="h-9 w-9 text-white" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{partnerRecord.organizationName}</h2>
                {partnerRecord.mission && (
                  <p className="mt-1 text-sm text-purple-100">{partnerRecord.mission}</p>
                )}
              </div>
            </div>

            {stats && (
              <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="rounded-lg bg-white/10 px-3 py-2 text-center">
                  <p className="text-lg font-bold">{stats.programs}</p>
                  <p className="text-xs text-purple-200">{td('programs')}</p>
                </div>
                <div className="rounded-lg bg-white/10 px-3 py-2 text-center">
                  <p className="text-lg font-bold">{stats.schools}</p>
                  <p className="text-xs text-purple-200">{td('schools')}</p>
                </div>
                <div className="rounded-lg bg-white/10 px-3 py-2 text-center">
                  <p className="text-lg font-bold">{stats.teachers}</p>
                  <p className="text-xs text-purple-200">{td('educators')}</p>
                </div>
                <div className="rounded-lg bg-white/10 px-3 py-2 text-center">
                  <p className="text-lg font-bold">{stats.countries}</p>
                  <p className="text-xs text-purple-200">{td('countries')}</p>
                </div>
              </div>
            )}
          </div>

          <CardContent className="p-6">
            {partnerRecord.description && (
              <p className="text-sm leading-relaxed text-gray-600">{partnerRecord.description}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {partnerRecord.organizationType && (
                <Badge variant="outline" className="capitalize">
                  {partnerRecord.organizationType}
                </Badge>
              )}
              {partnerRecord.country && (
                <Badge variant="outline">
                  <MapPin className="mr-1 h-3 w-3" />
                  {partnerRecord.country}
                </Badge>
              )}
              {partnerRecord.languages?.map((lang) => (
                <Badge key={lang} variant="outline">
                  <Globe className="mr-1 h-3 w-3" />
                  {lang.toUpperCase()}
                </Badge>
              ))}
            </div>

            {partnerRecord.sdgFocus && partnerRecord.sdgFocus.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {partnerRecord.sdgFocus.map((sdg) => {
                  const num = parseInt(sdg.replace('SDG ', ''), 10)
                  const data = SDG_DATA[num]
                  return (
                    <Badge
                      key={sdg}
                      variant="outline"
                      className="border-orange-300 text-orange-700"
                    >
                      SDG {num}{data ? `: ${data.title}` : ''}
                    </Badge>
                  )
                })}
              </div>
            )}

            {partnerRecord.website && (
              <p className="mt-4 text-sm text-gray-500">
                <a
                  href={partnerRecord.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  {partnerRecord.website}
                </a>
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-4 p-10 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">{td('noPartner')}</h3>
            <p className="text-gray-500">{td('noPartnerDesc')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
