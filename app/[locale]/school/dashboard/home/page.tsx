'use client'

import { Link } from '@/i18n/navigation'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  School,
  Layers,
  BookOpen,
  BarChart3,
  Users,
  FolderKanban,
  Globe,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { getCurrentSession } from '@/lib/auth/session'
import { usePrototypeDb } from '@/hooks/use-prototype-db'

interface SchoolProfile {
  id: string
  name: string
  type: string
  location: string
  city: string
  country: string
  studentCount: number
  teacherCount: number
  programCount: number
  projectCount: number
}

export default function SchoolDashboardHomePage() {
  const t = useTranslations('dashboard')
  const tn = useTranslations('nav')
  const tc = useTranslations('common')
  const [school, setSchool] = useState<SchoolProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { ready: prototypeReady, database } = usePrototypeDb()

  useEffect(() => {
    loadSchoolProfile()
  }, [prototypeReady])

  const loadSchoolProfile = async () => {
    setLoading(true)
    try {
      const currentSession = getCurrentSession()
      if (!currentSession || currentSession.role !== 'teacher' || !prototypeReady || !database) {
        setSchool(null)
        return
      }

      const normalizedEmail = currentSession.email.toLowerCase()
      const normalizedName = currentSession.organization?.trim().toLowerCase()

      const activeInstitutionId =
        typeof window !== 'undefined'
          ? window.localStorage.getItem('activeInstitutionId')
          : null
      const activeProgramIds =
        typeof window !== 'undefined'
          ? JSON.parse(window.localStorage.getItem('activeProgramIds') || '[]')
          : []

      const matchingInstitutions = database.institutions.filter((institution) => {
        const idMatch = activeInstitutionId && institution.id === activeInstitutionId
        const emailMatch = institution.contactEmail?.toLowerCase() === normalizedEmail
        const nameMatch = normalizedName && institution.name?.trim().toLowerCase() === normalizedName
        return idMatch || emailMatch || nameMatch
      })

      const primaryInstitution = matchingInstitutions[0]

      if (!primaryInstitution) {
        // Fresh onboarding user: try localStorage schoolData
        const rawSchoolData = typeof window !== 'undefined' ? localStorage.getItem('schoolData') : null
        const orgName = currentSession.organization ?? localStorage.getItem('organizationName') ?? 'My School'
        if (rawSchoolData) {
          const schoolData = JSON.parse(rawSchoolData)
          setSchool({
            id: 'onboarding-school',
            name: orgName,
            type: schoolData.schoolType ?? 'School',
            location: [schoolData.city, schoolData.country].filter(Boolean).join(', '),
            city: schoolData.city ?? '',
            country: schoolData.country ?? '',
            studentCount: schoolData.numberOfStudents ?? 0,
            teacherCount: schoolData.numberOfTeachers ?? 0,
            programCount: 0,
            projectCount: 0,
          })
        } else {
          setSchool(null)
        }
        return
      }

      const programIds = activeProgramIds.length
        ? activeProgramIds
        : Array.from(new Set(matchingInstitutions.map((institution) => institution.programId)))

      const teacherCount = database.institutionTeachers.filter(
        (teacher) => teacher.institutionId === primaryInstitution.id,
      ).length

      setSchool({
        id: primaryInstitution.id,
        name: primaryInstitution.name,
        type: primaryInstitution.type ?? 'School',
        location: [primaryInstitution.city, primaryInstitution.country].filter(Boolean).join(', '),
        city: primaryInstitution.city ?? '',
        country: primaryInstitution.country ?? '',
        studentCount: primaryInstitution.studentCount ?? 0,
        teacherCount,
        programCount: programIds.length,
        projectCount: 0,
      })
    } catch (err) {
      console.error('Error loading school profile:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
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

  if (!school) {
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <School className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h2 className="mb-2 text-lg font-semibold text-gray-900">{t('noSchoolProfile')}</h2>
          <p className="text-gray-600">{t('pleaseCreateSchoolProfile')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-gray-900">
            Hi, {school.name}
          </h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-600" />
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">{school.programCount}</p>
                <p className="text-xs text-gray-600">{t('programs')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">{school.teacherCount}</p>
                <p className="text-xs text-gray-600">{t('teachers')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-purple-600" />
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">{school.projectCount}</p>
                <p className="text-xs text-gray-600">{t('projects')}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">{t('yourGlobalHub')}</h2>
          <p className="text-sm text-gray-600">
            {t('everythingYouNeed')}
          </p>
        </div>

        {/* Grid of Navigation Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Overview Card */}
          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <School className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{tn('overview')}</h3>
                <p className="text-sm text-gray-600">
                  {t('overviewDesc')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="px-0 text-sm text-purple-600 hover:text-purple-700">
                  {tc('learnMore')}
                </Button>
                <Button
                  className="bg-purple-600 text-white hover:bg-purple-700"
                  size="sm"
                  asChild
                >
                  <Link href="/school/dashboard/overview">{tc('view')}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Programs Card */}
          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Layers className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{tn('programs')}</h3>
                <p className="text-sm text-gray-600">
                  {t('programsSchoolDesc')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="px-0 text-sm text-purple-600 hover:text-purple-700">
                  {tc('learnMore')}
                </Button>
                <Button
                  className="bg-purple-600 text-white hover:bg-purple-700"
                  size="sm"
                  asChild
                >
                  <Link href="/school/dashboard/programs">{tc('explore')}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Projects Card */}
          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <FolderKanban className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{tn('projects')}</h3>
                <p className="text-sm text-gray-600">
                  {t('projectsDesc')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="px-0 text-sm text-purple-600 hover:text-purple-700">
                  {tc('learnMore')}
                </Button>
                <Button
                  className="bg-purple-600 text-white hover:bg-purple-700"
                  size="sm"
                  asChild
                >
                  <Link href="/school/dashboard/projects">{tc('view')}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resources Card */}
          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{tn('resources')}</h3>
                <p className="text-sm text-gray-600">
                  {t('resourcesDesc')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="px-0 text-sm text-purple-600 hover:text-purple-700">
                  {tc('learnMore')}
                </Button>
                <Button
                  className="bg-purple-600 text-white hover:bg-purple-700"
                  size="sm"
                  asChild
                >
                  <Link href="/school/dashboard/resources">{tc('browse')}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Network Card */}
          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{tn('network')}</h3>
                <p className="text-sm text-gray-600">
                  {t('networkTeacherDesc')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="px-0 text-sm text-purple-600 hover:text-purple-700">
                  {tc('learnMore')}
                </Button>
                <Button
                  className="bg-purple-600 text-white hover:bg-purple-700"
                  size="sm"
                  asChild
                >
                  <Link href="/school/dashboard/network">{tc('manage')}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analytics Card */}
          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{tn('analytics')}</h3>
                <p className="text-sm text-gray-600">
                  {t('analyticsSchoolDesc')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="px-0 text-sm text-purple-600 hover:text-purple-700">
                  {tc('learnMore')}
                </Button>
                <Button
                  className="bg-purple-600 text-white hover:bg-purple-700"
                  size="sm"
                  asChild
                >
                  <Link href="/school/dashboard/analytics">{t('viewMetrics')}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
