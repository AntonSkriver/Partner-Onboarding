'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Link2, School, MapPin, Users, GraduationCap } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { getCurrentSession } from '@/lib/auth/session'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { getCountryDisplay } from '@/lib/countries'

export default function CoordinatorConnectPage() {
  const t = useTranslations('dashboard')
  const tNav = useTranslations('nav')
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
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">{tNav('connect')}</h1>
        <p className="mt-1 text-sm text-gray-600">
          {t('schoolsInNetwork', { count: institutions.length })}
        </p>
      </div>

      {institutions.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {institutions.map((inst) => {
            const teacherCount = teachersByInstitution.get(inst.id) ?? 0
            return (
              <Card key={inst.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                      <School className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-gray-900">{inst.name}</h3>
                      {inst.country && (
                        <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="h-3 w-3" />
                          {getCountryDisplay(inst.country)}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {teacherCount > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <GraduationCap className="mr-1 h-3 w-3" />
                            {teacherCount} {t('teachers')}
                          </Badge>
                        )}
                        {inst.studentCount && (
                          <Badge variant="outline" className="text-xs">
                            <Users className="mr-1 h-3 w-3" />
                            {inst.studentCount} {t('students')}
                          </Badge>
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
            <Link2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">{t('noConnections')}</h3>
            <p className="text-gray-500">{t('noConnectionsDesc')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
