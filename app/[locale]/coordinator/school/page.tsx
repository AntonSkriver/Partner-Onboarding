'use client'

import { useState, useMemo } from 'react'
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
  const [session] = useState(() => getCurrentSession())
  const { ready, database } = usePrototypeDb()

  const coordinatorRecords = useMemo(() => {
    if (!database || !session?.email) return []
    return database.coordinators.filter(
      (c) => c.email.toLowerCase() === session.email.toLowerCase(),
    )
  }, [database, session?.email])

  const institutions = useMemo(() => {
    if (!database || coordinatorRecords.length === 0) return []
    const coordinatorIds = new Set(coordinatorRecords.map((c) => c.id))
    return database.institutions.filter((inst) =>
      coordinatorIds.has(inst.coordinatorId),
    )
  }, [database, coordinatorRecords])

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
            return (
              <Card key={inst.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                      <School className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{inst.name}</h3>
                      {inst.country && (
                        <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="h-3.5 w-3.5" />
                          {getCountryDisplay(inst.country)}
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
