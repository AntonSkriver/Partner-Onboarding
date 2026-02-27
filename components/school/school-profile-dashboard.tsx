'use client'

import { Link } from '@/i18n/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Edit,
  Globe,
  LogOut,
  MapPin,
  School,
} from 'lucide-react'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import {
  aggregateProgramMetrics,
  buildProgramSummary,
  buildProgramCatalog,
  type ProgramSummary,
} from '@/lib/programs/selectors'
import type { ProgramProject } from '@/lib/types/program'

import { OverviewTab } from '@/components/school/dashboard-tabs/overview-tab'
import { ProgramsTab } from '@/components/school/dashboard-tabs/programs-tab'
import { ProjectsTab } from '@/components/school/dashboard-tabs/projects-tab'
import { ResourcesTab } from '@/components/school/dashboard-tabs/resources-tab'
import { AnalyticsTab } from '@/components/school/dashboard-tabs/analytics-tab'

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
  description?: string
}

interface SchoolProfileDashboardProps {
  school: SchoolProfile
  onEdit?: () => void
  isOwnProfile?: boolean
  initialTab?: 'overview' | 'programs' | 'projects' | 'resources' | 'analytics'
}

type TeacherEntry = {
  id: string
  name: string
  email: string
  subject: string
  status: string
  programName: string
}

type PartnerSchoolEntry = {
  id: string
  name: string
  country?: string
  programName: string
}

type ResourceEntry = {
  id: string
  title: string
  description: string
  type: string
  category?: string
  ageRange?: string
  sdgAlignment?: number[]
  language: string
  heroImageUrl?: string
  updatedAt: string
  programName: string
}

type ProjectStatus = ProgramProject['status']

type SchoolProjectEntry = {
  id: string
  title: string
  status: ProjectStatus
  programId: string
  programName: string
  templateTitle?: string
  estimatedWeeks?: number
  sdgAlignment?: number[]
  teacherName: string
  teacherEmail?: string
  updatedAt?: string
  createdAt?: string
  coverImageUrl?: string
}

export function SchoolProfileDashboard({
  school,
  onEdit,
  isOwnProfile = false,
  initialTab = 'overview',
}: SchoolProfileDashboardProps) {
  const [activeTab, setActiveTab] = useState(initialTab)
  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  const { ready: prototypeReady, database } = usePrototypeDb()

  const normalizedSchoolName = school.name?.trim().toLowerCase()
  const normalizedCity = school.city?.trim().toLowerCase()
  const normalizedCountry = school.country?.trim().toLowerCase()

  const programSummaries = useMemo<ProgramSummary[]>(() => {
    if (!prototypeReady || !database) {
      return []
    }

    const matchingInstitutions = database.institutions.filter((institution) => {
      const name = institution.name?.trim().toLowerCase()
      const city = institution.city?.trim().toLowerCase()
      const country = institution.country?.trim().toLowerCase()

      const nameMatch = normalizedSchoolName && name === normalizedSchoolName
      const cityMatch =
        normalizedCity &&
        city === normalizedCity &&
        (!normalizedCountry || country === normalizedCountry)

      return nameMatch || cityMatch
    })

    const programIds = new Set(matchingInstitutions.map((institution) => institution.programId))

    const targetPrograms =
      programIds.size > 0
        ? database.programs.filter((program) => programIds.has(program.id))
        : database.programs.filter((program) => program.isPublic).slice(0, 3)

    return targetPrograms.map((program) => buildProgramSummary(database, program))
  }, [prototypeReady, database, normalizedSchoolName, normalizedCity, normalizedCountry])

  const programMetrics = useMemo(() => aggregateProgramMetrics(programSummaries), [programSummaries])

  const programCatalog = useMemo(() => {
    if (!prototypeReady || !database) return []
    const allCatalog = buildProgramCatalog(database)
    // Filter to only show programs the school is part of, or public programs
    const matchingInstitutions = database.institutions.filter((institution) => {
      const name = institution.name?.trim().toLowerCase()
      const city = institution.city?.trim().toLowerCase()
      const country = institution.country?.trim().toLowerCase()

      const nameMatch = normalizedSchoolName && name === normalizedSchoolName
      const cityMatch =
        normalizedCity &&
        city === normalizedCity &&
        (!normalizedCountry || country === normalizedCountry)

      return nameMatch || cityMatch
    })

    const programIds = new Set(matchingInstitutions.map((institution) => institution.programId))

    return allCatalog.filter((item) =>
      programIds.has(item.programId) || item.isPublic
    )
  }, [prototypeReady, database, normalizedSchoolName, normalizedCity, normalizedCountry])

  const teachers = useMemo<TeacherEntry[]>(() => {
    const seen = new Map<string, TeacherEntry>()

    programSummaries.forEach((summary) => {
      summary.teachers.forEach((teacher) => {
        const key = teacher.id
        if (seen.has(key)) return

        seen.set(key, {
          id: teacher.id,
          name: `${teacher.firstName} ${teacher.lastName ?? ''}`.trim(),
          email: teacher.email,
          subject: teacher.subject ?? 'Program Teacher',
          status: teacher.status ?? 'invited',
          programName: summary.program.displayTitle ?? summary.program.name,
        })
      })
    })

    return Array.from(seen.values())
  }, [programSummaries])

  const partnerSchools = useMemo<PartnerSchoolEntry[]>(() => {
    const entries = new Map<string, PartnerSchoolEntry>()

    programSummaries.forEach((summary) => {
      summary.institutions.forEach((institution) => {
        const normalizedName = institution.name?.trim().toLowerCase()
        if (normalizedName === normalizedSchoolName) return

        entries.set(institution.id, {
          id: institution.id,
          name: institution.name,
          country: institution.country,
          programName: summary.program.displayTitle ?? summary.program.name,
        })
      })
    })

    return Array.from(entries.values())
  }, [programSummaries, normalizedSchoolName])

  const resources = useMemo<ResourceEntry[]>(() => {
    const derived: ResourceEntry[] = []

    programSummaries.forEach((summary) => {
      summary.templates.forEach((template) => {
        // Get age range from program
        const ageRange = summary.program.targetAgeRanges.length > 0
          ? summary.program.targetAgeRanges.join(', ')
          : undefined

        derived.push({
          id: template.id,
          title: template.title,
          description: template.summary,
          type: 'Project Template',
          category: template.subjectFocus?.[0]?.replace('_', ' ') || undefined,
          ageRange,
          sdgAlignment: template.sdgAlignment,
          language: template.languageSupport?.join(', ') || 'English',
          heroImageUrl: template.heroImageUrl,
          updatedAt: template.updatedAt,
          programName: summary.program.displayTitle ?? summary.program.name,
        })
      })
    })

    return derived
  }, [programSummaries])

  const projects = useMemo<SchoolProjectEntry[]>(() => {
    if (!prototypeReady || !database) {
      return []
    }

    const teacherById = new Map(
      database.institutionTeachers.map((teacher) => [teacher.id, teacher]),
    )
    const templateById = new Map(
      database.programTemplates.map((template) => [template.id, template]),
    )

    const entries: SchoolProjectEntry[] = []

    programSummaries.forEach((summary) => {
      summary.projects.forEach((project) => {
        const template = project.templateId ? templateById.get(project.templateId) : undefined
        const teacher =
          project.createdByType === 'teacher' ? teacherById.get(project.createdById) : undefined

        const teacherName = teacher
          ? `${teacher.firstName} ${teacher.lastName ?? ''}`.trim()
          : project.createdByType === 'partner'
            ? 'Partner team'
            : project.createdByType === 'coordinator'
              ? 'Country coordinator'
              : 'Classroom teacher'

        entries.push({
          id: project.id,
          title: template?.title ?? project.projectId,
          status: project.status,
          programId: summary.program.id,
          programName: summary.program.displayTitle ?? summary.program.name,
          templateTitle: template?.title,
          estimatedWeeks: template?.estimatedDurationWeeks,
          sdgAlignment: template?.sdgAlignment ?? summary.program.sdgFocus,
          teacherName,
          teacherEmail: teacher?.email,
          updatedAt: project.updatedAt,
          createdAt: project.createdAt,
          coverImageUrl: project.coverImageUrl ?? template?.heroImageUrl,
        })
      })
    })

    return entries.sort((a, b) => {
      const dateA = a.updatedAt ?? a.createdAt ?? ''
      const dateB = b.updatedAt ?? b.createdAt ?? ''
      return new Date(dateB).valueOf() - new Date(dateA).valueOf()
    })
  }, [prototypeReady, database, programSummaries])

  const handleTabChange = (value: string) => {
    setActiveTab(value as typeof activeTab)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('tab', value)
      window.history.pushState({}, '', url.toString())
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold">{school.name}</h1>
              <Badge className="bg-purple-100 text-purple-700">
                <School className="w-4 h-4 mr-1" />
                School Profile
              </Badge>
            </div>
            <p className="text-gray-600 max-w-2xl">
              {school.description || `${school.type} in ${school.location}`}
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{school.city}, {school.country}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Globe className="w-4 h-4" />
                <span>{school.languages.join(', ')}</span>
              </span>
            </div>
          </div>
        </div>

        {isOwnProfile && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button variant="outline" asChild>
              <Link href="/login">
                <LogOut className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </Button>
            {onEdit && (
              <Button onClick={onEdit} variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          {isOwnProfile && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
        </TabsList>

        <OverviewTab school={school} programMetrics={programMetrics} />

        <ProgramsTab
          prototypeReady={prototypeReady}
          programCatalog={programCatalog}
          programSummaries={programSummaries}
        />

        <ProjectsTab projects={projects} />

        <ResourcesTab resources={resources} />

        {isOwnProfile && (
          <AnalyticsTab
            programSummaries={programSummaries}
            programMetrics={programMetrics}
          />
        )}
      </Tabs>
    </div>
  )
}
