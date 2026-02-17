'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { School, MapPin, Users, GraduationCap, Building2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { getCurrentSession } from '@/lib/auth/session'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { getCountryDisplay } from '@/lib/countries'

export default function CoordinatorSchoolPage() {
  const t = useTranslations('dashboard')
  const tNav = useTranslations('nav')
  const [session, setSession] = useState<ReturnType<typeof getCurrentSession> | null>(null)
  useEffect(() => {
    setSession(getCurrentSession())
  }, [])
  const { ready, database } = usePrototypeDb()

  // Find all coordinator records for this user
  const coordinatorRecords = useMemo(() => {
    if (!database) return []
    const email = session?.email ?? 'marco.bianchi@savethechildren.it'
    return database.coordinators.filter(
      (c) => c.email.toLowerCase() === email.toLowerCase(),
    )
  }, [database, session?.email])

  // Get institutions the coordinator directly manages
  const directInstitutions = useMemo(() => {
    if (!database || coordinatorRecords.length === 0) return []
    const coordinatorIds = new Set(coordinatorRecords.map((c) => c.id))
    return database.institutions.filter((inst) =>
      coordinatorIds.has(inst.coordinatorId),
    )
  }, [database, coordinatorRecords])

  // Also get all institutions from the same partner's programs (e.g. all Punti Luce)
  const allPartnerInstitutions = useMemo(() => {
    if (!database || coordinatorRecords.length === 0) return []
    // Find program IDs the coordinator works on
    const programIds = new Set(coordinatorRecords.map((c) => c.programId))
    // Find the partner for those programs
    const partnerIds = new Set(
      database.programs
        .filter((p) => programIds.has(p.id))
        .map((p) => p.partnerId),
    )
    // Find ALL programs by that partner
    const allPartnerProgramIds = new Set(
      database.programs
        .filter((p) => partnerIds.has(p.partnerId))
        .map((p) => p.id),
    )
    // Find all institutions in those programs
    return database.institutions.filter((inst) =>
      allPartnerProgramIds.has(inst.programId),
    )
  }, [database, coordinatorRecords])

  // Deduplicate by name (same physical location may appear in multiple programs)
  const institutions = useMemo(() => {
    const seen = new Map<string, typeof allPartnerInstitutions[0]>()
    // Prefer direct institutions, then add partner ones
    for (const inst of directInstitutions) {
      if (!seen.has(inst.name)) seen.set(inst.name, inst)
    }
    for (const inst of allPartnerInstitutions) {
      if (!seen.has(inst.name)) seen.set(inst.name, inst)
    }
    return Array.from(seen.values())
  }, [directInstitutions, allPartnerInstitutions])

  const directIds = useMemo(
    () => new Set(directInstitutions.map((i) => i.id)),
    [directInstitutions],
  )

  const teachersByInstitution = useMemo(() => {
    if (!database) return new Map<string, number>()
    const map = new Map<string, number>()
    institutions.forEach((inst) => {
      const count = database.institutionTeachers.filter(
        (t) => t.institutionId === inst.id,
      ).length
      map.set(inst.id, count)
    })
    return map
  }, [database, institutions])

  if (!ready || !database) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">{tNav('mySchool')}</h1>
        <p className="mt-1 text-sm text-gray-600">
          {t('schoolsOverview', { count: institutions.length })}
        </p>
      </div>

      {institutions.length > 0 ? (
        <div className="space-y-4">
          {institutions.map((inst) => {
            const teacherCount = teachersByInstitution.get(inst.id) ?? 0
            const isDirect = directIds.has(inst.id)
            return (
              <Card key={inst.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                      <School className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{inst.name}</h3>
                        {isDirect && (
                          <Badge variant="outline" className="border-green-300 text-green-700 text-xs">
                            {t('yourSchool')}
                          </Badge>
                        )}
                      </div>
                      {inst.country && (
                        <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="h-3.5 w-3.5" />
                          {inst.city ? `${inst.city}, ` : ''}{getCountryDisplay(inst.country).name}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-3">
                        {teacherCount > 0 && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <GraduationCap className="h-4 w-4 text-green-600" />
                            <span>{teacherCount} {t('teachers')}</span>
                          </div>
                        )}
                        {inst.studentCount && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Users className="h-4 w-4 text-purple-600" />
                            <span>{inst.studentCount} {t('students')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="space-y-4 p-10 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">{t('noSchools')}</h3>
            <p className="text-gray-500">{t('noSchoolsDesc')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
