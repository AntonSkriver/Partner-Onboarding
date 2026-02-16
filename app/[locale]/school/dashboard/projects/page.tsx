'use client'

import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Globe2, Users2, Clock, Languages } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { getCountryDisplay } from '@/lib/countries'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { getCurrentSession } from '@/lib/auth/session'

// Helper for consistent age group calculation based on project name hash
function getProjectAgeGroup(projectName: string): string {
  const ageGroups = ['12-14', '14-16', '16-18']
  const hash = projectName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return ageGroups[hash % ageGroups.length]
}

// Demo projects (UI-focused)
const projects = [
  {
    id: 'demo-project-1',
    title: 'City Guardians Story Maps',
    description:
      'In this project, students collaborate with peers from another country to explore the diverse...',
    startingMonth: 'November',
    status: 'active' as const,
    programName: 'Build the Change',
    teacherName: 'Anne Holm',
    teacherCountry: 'Denmark',
    teacherInitials: 'AH',
    teacherPhoto: '/images/avatars/anne-holm.png',
    projectType: 'Explore Global Challenges',
    ageRange: 'Ages 11 - 15 years',
    timezone: '+2 hours from you',
    language: 'English',
    createdAt: 'Created 2 days ago',
    coverImageUrl:
      'https://images.unsplash.com/photo-1529101091764-c3526daf38fe?w=800&h=480&fit=crop',
  },
  {
    id: 'demo-project-2',
    title: 'Community Story Circles',
    description:
      'Hello! We are a small group of five students in the subject: International Studies. We a...',
    startingMonth: 'December',
    status: 'draft' as const,
    programName: 'Communities in Focus',
    teacherName: 'Anne Holm',
    teacherCountry: 'Denmark',
    teacherInitials: 'AH',
    teacherPhoto: '/images/avatars/anne-holm.png',
    projectType: 'Cultural Exchange',
    ageRange: 'Ages 6 - 13 years',
    timezone: '+1 hour from you',
    language: 'German, English',
    createdAt: 'Created 5 hours ago',
    coverImageUrl:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=480&fit=crop',
  },
]

function ProjectCard({ project }: { project: typeof projects[0] }) {
  const tc = useTranslations('common')
  const [isExpanded, setIsExpanded] = useState(false)
  const { flag: countryFlag, name: countryName } = getCountryDisplay(project.teacherCountry)
  const ageGroup = getProjectAgeGroup(project.title)

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative h-44 overflow-hidden">
        <Image
          src={project.coverImageUrl}
          alt={project.title}
          width={500}
          height={300}
          className="h-full w-full object-cover"
        />
      </div>

      <CardContent className="flex flex-1 flex-col space-y-4 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-purple-600">
          Starting Month: {project.startingMonth}
        </p>

        <h3 className="text-lg font-semibold leading-tight text-gray-900">{project.title}</h3>

        <div className="text-sm text-gray-600">
          <p className={cn(!isExpanded && 'line-clamp-2')}>{project.description}</p>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 text-sm font-medium text-purple-600 hover:text-purple-700"
          >
            {isExpanded ? tc('readLess') : tc('readMore')}
          </button>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-gray-400" />
            <span>{project.projectType}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users2 className="h-4 w-4 text-gray-400" />
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
              Ages {ageGroup} years
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>{project.timezone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-gray-400" />
            <span>{project.language}</span>
          </div>
        </div>

        <div className="flex flex-1" />

        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2">
            {project.teacherPhoto ? (
              <Image
                src={project.teacherPhoto}
                alt={project.teacherName}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-xs font-semibold text-white">
                {project.teacherInitials}
              </div>
            )}
            <div className="text-xs">
              <p className="font-medium text-gray-900">{project.teacherName}</p>
              <Badge
                variant="outline"
                className="mt-1 flex items-center gap-1 border-purple-200 text-gray-600"
              >
                <span className="text-base leading-none">{countryFlag}</span>
                <span>{countryName}</span>
              </Badge>
              <p className="mt-1 text-gray-500">{project.createdAt}</p>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-auto border-purple-600 text-purple-600 hover:bg-purple-50"
            asChild
          >
            <Link href={`/teacher/projects?project=${project.id}`}>{tc('viewDetails')}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SchoolProjectsPage() {
  const t = useTranslations('projects')
  const tn = useTranslations('nav')
  const { ready: prototypeReady, database } = usePrototypeDb()
  const session = getCurrentSession()
  const [hasTeachers, setHasTeachers] = useState<boolean | null>(null)

  const matchingInstitutionIds = useMemo(() => {
    if (!prototypeReady || !database) return []
    const activeInstitutionId =
      typeof window !== 'undefined' ? window.localStorage.getItem('activeInstitutionId') : null
    const normalizedEmail = session?.email?.toLowerCase()
    const normalizedName = session?.organization?.trim().toLowerCase()

    const matchesCurrentSchool = (institution: { id?: string; name?: string | null; contactEmail?: string | null }) => {
      if (activeInstitutionId && institution.id === activeInstitutionId) return true
      const name = institution.name?.trim().toLowerCase()
      const email = institution.contactEmail?.toLowerCase()
      const nameMatch = normalizedName && name === normalizedName
      const emailMatch = normalizedEmail && email === normalizedEmail
      return nameMatch || emailMatch
    }

    return database.institutions.filter((institution) => matchesCurrentSchool(institution)).map((inst) => inst.id)
  }, [prototypeReady, database, session])

  useEffect(() => {
    if (!prototypeReady || !database) return
    if (matchingInstitutionIds.length === 0) {
      setHasTeachers(false)
      return
    }
    const teacherCount = database.institutionTeachers.filter((teacher) =>
      matchingInstitutionIds.includes(teacher.institutionId),
    ).length
    setHasTeachers(teacherCount > 0)
  }, [prototypeReady, database, matchingInstitutionIds])

  if (!prototypeReady || hasTeachers === null) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">{tn('projects')}</h1>
          <p className="text-sm text-gray-600">
            {t('subtitle')}
          </p>
        </div>
        <Card>
          <CardContent className="p-6 text-sm text-gray-600">Loading projects…</CardContent>
        </Card>
      </div>
    )
  }

  if (!hasTeachers) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">{tn('projects')}</h1>
          <p className="text-sm text-gray-600">
            {t('subtitle')}
          </p>
        </div>
        <Card className="border-dashed border-purple-200">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="rounded-full bg-purple-50 px-4 py-1 text-xs font-semibold text-purple-700">
              No teachers connected yet
            </div>
            <p className="max-w-md text-sm text-gray-600">
              Invite teachers to your school workspace so projects show up here automatically.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/school/dashboard/network">Invite teachers</Link>
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                <Link href="/school/dashboard/programs">{tn('programs')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Projects</h1>
        <p className="text-sm text-gray-600">
          Projects created by teachers at your school across all programs.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}
