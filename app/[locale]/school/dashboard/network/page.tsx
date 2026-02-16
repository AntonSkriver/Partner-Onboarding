'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, School, UserPlus, Globe } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { getCurrentSession } from '@/lib/auth/session'

interface TeacherDisplay {
  id: string
  name: string
  email: string
  subject: string
  status: 'active' | 'invited' | 'inactive'
  programs: string[]
}

interface PartnerSchoolDisplay {
  id: string
  name: string
  country: string
  programName: string
}

export default function SchoolNetworkPage() {
  const t = useTranslations('profile.network')
  const ts = useTranslations('schools')
  const [loading, setLoading] = useState(true)
  const [activeInstitutionId, setActiveInstitutionId] = useState<string | null>(null)
  const [activeProgramIds, setActiveProgramIds] = useState<string[]>([])
  const [isNewlyInvitedSchool, setIsNewlyInvitedSchool] = useState(false)
  const { ready: prototypeReady, database } = usePrototypeDb()

  const session = getCurrentSession()
  const normalizedSchoolName = session?.organization?.trim().toLowerCase() ?? ''
  const normalizedEmail = session?.email?.toLowerCase() ?? ''

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setActiveInstitutionId(window.localStorage.getItem('activeInstitutionId'))
      setActiveProgramIds(JSON.parse(window.localStorage.getItem('activeProgramIds') || '[]'))
      setIsNewlyInvitedSchool(window.localStorage.getItem('isNewlyInvitedSchool') === 'true')
    }
  }, [])

  useEffect(() => {
    if (prototypeReady) {
      setLoading(false)
    }
  }, [prototypeReady])

  // Find matching institutions (by ID, email, or name)
  const matchingInstitutions = useMemo(() => {
    if (!database) return []

    return database.institutions.filter((institution) => {
      if (activeInstitutionId && institution.id === activeInstitutionId) return true
      const emailMatch = institution.contactEmail?.toLowerCase() === normalizedEmail
      const nameMatch = normalizedSchoolName && institution.name?.trim().toLowerCase() === normalizedSchoolName
      return emailMatch || nameMatch
    })
  }, [database, activeInstitutionId, normalizedEmail, normalizedSchoolName])

  // Get institution IDs for teacher lookup
  const institutionIds = useMemo(() => {
    return new Set(matchingInstitutions.map((i) => i.id))
  }, [matchingInstitutions])

  // Get program IDs from institutions or localStorage
  const programIds = useMemo(() => {
    if (activeProgramIds.length > 0) return new Set(activeProgramIds)
    return new Set(matchingInstitutions.map((i) => i.programId))
  }, [activeProgramIds, matchingInstitutions])

  // Get teachers for this institution
  const teachers = useMemo((): TeacherDisplay[] => {
    if (!database || institutionIds.size === 0) return []

    const byEmail = new Map<string, TeacherDisplay>()

    database.institutionTeachers
      .filter((teacher) => institutionIds.has(teacher.institutionId))
      .forEach((teacher) => {
        const program = database.programs.find((p) => p.id === teacher.programId)
        const programName = program?.name || 'Unknown Program'
        const key = teacher.email.toLowerCase()
        const existing = byEmail.get(key)
        if (existing) {
          if (!existing.programs.includes(programName)) {
            existing.programs.push(programName)
          }
          return
        }
        byEmail.set(key, {
          id: teacher.id,
          name: `${teacher.firstName} ${teacher.lastName}`,
          email: teacher.email,
          subject: teacher.subject || 'General',
          status: teacher.status,
          programs: [programName],
        })
      })

    return Array.from(byEmail.values())
  }, [database, institutionIds])

  // Get partner schools (other institutions in the same programs)
  // Newly invited schools start with a blank slate - no partner schools shown yet
  const partnerSchools = useMemo((): PartnerSchoolDisplay[] => {
    if (!database || institutionIds.size === 0 || programIds.size === 0) return []
    if (isNewlyInvitedSchool) return []

    return database.institutions
      .filter((institution) => {
        // Exclude our own institution(s)
        if (institutionIds.has(institution.id)) return false
        // Only include institutions in the same programs
        return programIds.has(institution.programId)
      })
      .map((institution) => {
        const program = database.programs.find((p) => p.id === institution.programId)
        return {
          id: institution.id,
          name: institution.name,
          country: institution.country || 'Unknown',
          programName: program?.name || 'Unknown Program',
        }
      })
  }, [database, institutionIds, programIds, isNewlyInvitedSchool])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="mb-2 h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">{t('title')}</h1>
        <p className="text-sm text-gray-600">
          {t('subtitleSchool')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                {t('teachers')}
              </CardTitle>
              <CardDescription>
                {t('teachersDesc')}
              </CardDescription>
            </div>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              <UserPlus className="mr-2 h-4 w-4" />
              {t('inviteTeacher')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {teachers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm font-medium text-gray-600">{t('noTeachers')}</p>
              <p className="text-xs text-gray-500">
                {t('noTeachersDesc')}
              </p>
            </div>
          ) : (
            teachers.map((teacher) => (
              <div
                key={teacher.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 p-4"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900">{teacher.name}</p>
                  <p className="text-sm text-gray-600">
                    {teacher.subject} • {teacher.email}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {teacher.programs.map((program) => (
                      <Badge key={program} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                        {program}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Badge variant={teacher.status === 'active' ? 'default' : 'secondary'}>
                  {teacher.status}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5 text-purple-600" />
                {t('partnerSchools')}
              </CardTitle>
              <CardDescription>
                {t('partnerSchoolsDesc')}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              {ts('inviteSchool')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {partnerSchools.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Globe className="mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm font-medium text-gray-600">{t('noPartnerSchools')}</p>
              <p className="text-xs text-gray-500">
                {t('noPartnerSchoolsDesc')}
              </p>
            </div>
          ) : (
            partnerSchools.map((school) => (
              <div
                key={school.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 p-4"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {school.name}{' '}
                    <span className="text-xs text-gray-500">· {school.programName}</span>
                  </p>
                  <p className="text-sm text-gray-600">{school.country}</p>
                </div>
                <Button variant="outline" size="sm">
                  View profile
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
