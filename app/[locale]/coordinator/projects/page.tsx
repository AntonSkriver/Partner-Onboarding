'use client'

import { useState, useEffect, useMemo } from 'react'
import { Link } from '@/i18n/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Layers, Globe, Users, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { getCurrentSession } from '@/lib/auth/session'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { getCountryDisplay } from '@/lib/countries'

export default function CoordinatorProjectsPage() {
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

  const projects = useMemo(() => {
    if (!database || coordinatorRecords.length === 0) return []
    const programIds = new Set(coordinatorRecords.map((c) => c.programId))
    return database.programProjects.filter((p: { programId: string }) => programIds.has(p.programId))
  }, [database, coordinatorRecords])

  if (!ready || !database) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">{tNav('myProjects')}</h1>
        <p className="mt-1 text-sm text-gray-600">
          {t('projectsInPrograms', { count: projects.length })}
        </p>
      </div>

      {projects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project: any) => (
            <Card key={project.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-900">{project.title}</h3>
                {project.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">{project.description}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.countries && project.countries.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <Globe className="mr-1 h-3 w-3" />
                      {project.countries.slice(0, 2).map(getCountryDisplay).join(', ')}
                      {project.countries.length > 2 && ` +${project.countries.length - 2}`}
                    </Badge>
                  )}
                  {project.studentsReached && (
                    <Badge variant="outline" className="text-xs">
                      <Users className="mr-1 h-3 w-3" />
                      {project.studentsReached} {t('students')}
                    </Badge>
                  )}
                  {project.status && (
                    <Badge
                      className={
                        project.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }
                    >
                      {project.status}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="space-y-4 p-10 text-center">
            <Layers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">{t('noProjects')}</h3>
            <p className="text-gray-500">{t('noProjectsDesc')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
