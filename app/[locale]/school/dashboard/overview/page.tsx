'use client'

import { Link } from '@/i18n/navigation'
import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Mail,
  Phone,
  BarChart3,
  Target,
  Tag,
  Edit,
  Building2,
  Award,
  ShieldCheck,
  GraduationCap,
  Users,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { getCurrentSession } from '@/lib/auth/session'
import { SDGIcon } from '@/components/sdg-icons'
import { SDG_OPTIONS } from '@/contexts/partner-onboarding-context'
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
  languages: string[]
  contactName: string
  contactEmail: string
  contactPhone?: string
  interests: string[]
  sdgFocus: string[]
  childRightsFocus: string[]
  description?: string
  mission?: string
  gradeLevels?: string[]
  schoolType?: string
}

const CRC_ARTICLE_DETAILS: Record<string, { title: string }> = {
  '12': { title: 'Respect for the views of the child' },
  '13': { title: 'Freedom of expression' },
  '24': { title: 'Health and health services' },
  '28': { title: 'Right to education' },
  '29': { title: 'Goals of education' },
  '31': { title: 'Leisure, play, and culture' },
}

type InstitutionExtras = {
  sdgFocus?: string[]
  childRightsFocus?: string[]
  description?: string
  mission?: string
  gradeLevels?: string[]
  schoolType?: string
}

export default function SchoolOverviewPage() {
  const t = useTranslations('profile.overview')
  const tcrc = useTranslations('crc')
  const [school, setSchool] = useState<SchoolProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [institutionIds, setInstitutionIds] = useState<string[]>([])
  const { ready: prototypeReady, database } = usePrototypeDb()

  const activeProgramIds = useMemo<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = window.localStorage.getItem('activeProgramIds')
      return raw ? (JSON.parse(raw) as string[]) : []
    } catch {
      return []
    }
  }, [])

  const quickStats = useMemo(() => {
    if (!prototypeReady || !database) {
      return { programs: 0, projects: 0 }
    }

    const programIds = new Set<string>(activeProgramIds)
    database.institutions.forEach((inst) => {
      if (institutionIds.includes(inst.id)) {
        programIds.add(inst.programId)
      }
    })

    const teacherIds = new Set(
      database.institutionTeachers
        .filter((teacher) => institutionIds.includes(teacher.institutionId))
        .map((teacher) => teacher.id),
    )

    const projectCount = database.programProjects.filter((project) =>
      teacherIds.has(project.createdById),
    ).length

    return { programs: programIds.size, projects: projectCount }
  }, [prototypeReady, database, institutionIds, activeProgramIds])

  const loadSchoolProfile = useCallback(async () => {
    setLoading(true)
    try {
      const session = getCurrentSession()
      if (!session || session.role !== 'teacher' || !prototypeReady || !database) {
        setSchool(null)
        return
      }

      const normalizedEmail = session.email.toLowerCase()
      const normalizedName = session.organization?.trim().toLowerCase()
      const activeInstitutionId =
        typeof window !== 'undefined'
          ? window.localStorage.getItem('activeInstitutionId')
          : null

      const matchingInstitutions = database.institutions.filter((institution) => {
        const idMatch = activeInstitutionId && institution.id === activeInstitutionId
        const emailMatch = institution.contactEmail?.toLowerCase() === normalizedEmail
        const nameMatch = normalizedName && institution.name?.trim().toLowerCase() === normalizedName
        return idMatch || emailMatch || nameMatch
      })

      const primaryInstitution = matchingInstitutions[0]

      if (!primaryInstitution) {
        setSchool(null)
        return
      }

      setInstitutionIds(matchingInstitutions.map((inst) => inst.id))

      const extras = primaryInstitution as unknown as InstitutionExtras

      const mappedSchool: SchoolProfile = {
        id: primaryInstitution.id,
        name: primaryInstitution.name,
        type: primaryInstitution.type ?? 'School',
        location: [primaryInstitution.city, primaryInstitution.country].filter(Boolean).join(', ') || 'Location pending',
        city: primaryInstitution.city ?? '',
        country: primaryInstitution.country ?? '',
        studentCount: primaryInstitution.studentCount ?? 0,
        teacherCount: primaryInstitution.teacherCount ?? 0,
        languages: primaryInstitution.languages?.length ? primaryInstitution.languages : [],
        contactName: primaryInstitution.principalName || session.name || 'School lead',
        contactEmail: primaryInstitution.contactEmail || session.email,
        contactPhone: primaryInstitution.contactPhone,
        interests: [],
        sdgFocus: extras.sdgFocus ?? [],
        childRightsFocus: extras.childRightsFocus ?? [],
        description: extras.description ?? '',
        mission: extras.mission ?? '',
        gradeLevels: extras.gradeLevels ?? [],
        schoolType: extras.schoolType ?? '',
      }

      setSchool(mappedSchool)
    } catch (err) {
      console.error('Error loading school profile:', err)
    } finally {
      setLoading(false)
    }
  }, [prototypeReady, database])

  useEffect(() => {
    loadSchoolProfile()
  }, [loadSchoolProfile])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-48 rounded-2xl" />
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
          <Building2 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h2 className="mb-2 text-lg font-semibold text-gray-900">{t('notSpecified')}</h2>
          <p className="text-gray-600">{t('locationPending')}</p>
        </CardContent>
      </Card>
    )
  }

  const childRightsEntries = school.childRightsFocus.map((article) => {
    const details = CRC_ARTICLE_DETAILS[article] ?? { title: `Article ${article}` }
    const padded = article.padStart(2, '0')
    return {
      article,
      title: details.title,
      iconSrc: `/crc/icons/article-${padded}.png`,
    }
  })

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-gray-900">{school.name}</h1>
          <Button variant="outline" asChild>
            <Link href="/school/dashboard/edit">
              <Edit className="mr-2 h-4 w-4" />
              {t('editProfile')}
            </Link>
          </Button>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">School Overview</h2>
          <p className="text-sm text-gray-600">
            {school.description || `${school.type} in ${school.location}`}
          </p>
        </div>
      </div>

      {/* Detailed Information Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {t('contactInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-gray-900">{school.contactName}</p>
              <p className="text-gray-500">{t('principal')}</p>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="h-3 w-3" />
              <span>{school.contactEmail}</span>
            </div>
            {school.contactPhone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-3 w-3" />
                <span>{school.contactPhone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Thematic Areas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              {t('thematicAreas')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {school.interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {school.interests.map((interest) => (
                  <Badge key={interest} variant="outline">
                    {interest}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">{t('noThematicAreas')}</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t('quickStats')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold text-purple-600">{quickStats.programs}</div>
                <div className="text-sm text-gray-600">{t('programs')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">{quickStats.projects}</div>
                <div className="text-sm text-gray-600">{t('projects')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{school.studentCount}</div>
                <div className="text-sm text-gray-600">{t('students')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">{school.teacherCount}</div>
                <div className="text-sm text-gray-600">{t('teachers')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* School Details Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* School Type & Grade Levels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              {t('schoolDetails')}
            </CardTitle>
            <CardDescription>
              Grade levels and school classification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{t('schoolType')}</p>
              <p className="text-lg font-semibold text-gray-900">
                {school.schoolType || school.type || t('notSpecified')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">{t('gradeLevels')}</p>
              {school.gradeLevels && school.gradeLevels.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {school.gradeLevels.map((grade) => (
                    <Badge key={grade} variant="secondary" className="text-sm">
                      {grade}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">{t('noGradeLevels')}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* School Size */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t('schoolSize')}
            </CardTitle>
            <CardDescription>
              Student and teacher population
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-3xl font-bold text-blue-600">{school.studentCount}</div>
                <div className="text-sm text-gray-600 mt-1">{t('totalStudents')}</div>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-xl">
                <div className="text-3xl font-bold text-amber-600">{school.teacherCount}</div>
                <div className="text-sm text-gray-600 mt-1">{t('totalTeachers')}</div>
              </div>
            </div>
            {school.studentCount > 0 && school.teacherCount > 0 && (
              <div className="mt-4 text-center text-sm text-gray-500">
                {t('studentTeacherRatio')}: {Math.round(school.studentCount / school.teacherCount)}:1
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mission Statement */}
      {school.mission && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              {t('ourMission')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-gray-700">{school.mission}</p>
          </CardContent>
        </Card>
      )}

      {/* Focus Areas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* SDG Focus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              {t('sdgFocus')}
            </CardTitle>
            <CardDescription>
              Priority Sustainable Development Goals our school advances.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {school.sdgFocus.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {school.sdgFocus.map((sdgString) => {
                  const sdgId = typeof sdgString === 'string' ? Number.parseInt(sdgString, 10) : sdgString
                  const sdg = SDG_OPTIONS.find((s) => s.id === sdgId)
                  return sdg ? (
                    <div key={sdgId} className="flex flex-col items-center gap-2">
                      <SDGIcon number={sdgId} size="lg" showTitle={false} />
                      <p className="text-center text-xs leading-tight text-gray-900">
                        {sdg.title}
                      </p>
                    </div>
                  ) : null
                })}
              </div>
            ) : (
              <p className="text-gray-500">{t('noSdgFocus')}</p>
            )}
          </CardContent>
        </Card>

        {/* Child Rights Focus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              {tcrc('childRightsFocus')}
            </CardTitle>
            <CardDescription>
              Priority articles from the UN Convention on the Rights of the Child.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {childRightsEntries.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {childRightsEntries.map((entry) => (
                  <div key={entry.article} className="flex flex-col items-center gap-2">
                    <div className="relative h-20 w-20">
                      <Image
                        src={entry.iconSrc}
                        alt={entry.title}
                        fill
                        sizes="80px"
                        className="rounded object-contain"
                      />
                    </div>
                    <p className="text-center text-xs leading-tight text-gray-900">
                      {entry.title}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Add your Convention on the Rights of the Child focus areas.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
