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
import { NetworkTab } from '@/components/school/dashboard-tabs/network-tab'
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
  initialTab?: 'overview' | 'programs' | 'projects' | 'network' | 'resources' | 'analytics'
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
  const [showInviteTeacherDialog, setShowInviteTeacherDialog] = useState(false)
  const [showInviteSchoolDialog, setShowInviteSchoolDialog] = useState(false)
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

    if (seen.size > 0) {
      return Array.from(seen.values())
    }

    return [
      {
        id: 'demo-teacher-1',
        name: 'Maria Hansen',
        email: 'maria@school.dk',
        subject: 'Social Studies',
        status: 'active',
        programName: 'Build the Change',
      },
      {
        id: 'demo-teacher-2',
        name: 'Peter Nielsen',
        email: 'peter@school.dk',
        subject: 'Science',
        status: 'active',
        programName: 'Communities in Focus',
      },
      {
        id: 'demo-teacher-3',
        name: 'Anna Larsen',
        email: 'anna@school.dk',
        subject: 'Languages',
        status: 'invited',
        programName: 'Build the Change',
      },
    ]
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

    if (entries.size > 0) {
      return Array.from(entries.values())
    }

    return [
      {
        id: 'demo-partner-school-berlin',
        name: 'Berlin International School',
        country: 'Germany',
        programName: 'Build the Change',
      },
      {
        id: 'demo-partner-school-sao-paulo',
        name: 'São Paulo Academy',
        country: 'Brazil',
        programName: 'Communities in Focus',
      },
    ]
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

    if (derived.length > 0) {
      return derived
    }

    return [
      {
        id: 'resource-1',
        title: 'Human Rights Education Toolkit',
        description: 'Comprehensive guide for teaching human rights concepts and promoting global citizenship through interactive activities.',
        type: 'Document',
        category: 'Teaching Guide',
        ageRange: '13-19 years old',
        sdgAlignment: [16],
        language: 'English',
        heroImageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=480&fit=crop',
        updatedAt: '2025-01-10T10:00:00Z',
        programName: 'Communities in Focus',
      },
      {
        id: 'resource-2',
        title: 'Climate Action Project Templates',
        description: 'Ready-to-use templates for climate projects that engage students in hands-on sustainability initiatives.',
        type: 'Project Template',
        category: 'Science',
        ageRange: '9-13 years old',
        sdgAlignment: [13],
        language: 'English',
        heroImageUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=480&fit=crop',
        updatedAt: '2025-01-15T10:00:00Z',
        programName: 'Build the Change',
      },
    ]
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

    if (entries.length > 0) {
      return entries.sort((a, b) => {
        const dateA = a.updatedAt ?? a.createdAt ?? ''
        const dateB = b.updatedAt ?? b.createdAt ?? ''
        return new Date(dateB).valueOf() - new Date(dateA).valueOf()
      })
    }

    return [
      {
        id: 'demo-project-1',
        title: 'City Guardians Story Maps',
        status: 'active',
        programId: 'program-build-the-change-2025',
        programName: 'Build the Change',
        templateTitle: 'City Guardians Story Maps',
        estimatedWeeks: 4,
        sdgAlignment: [4, 11, 13],
        teacherName: 'Maria Hansen',
        teacherEmail: 'maria@school.dk',
        updatedAt: '2025-02-20T12:30:00.000Z',
        coverImageUrl:
          'https://images.unsplash.com/photo-1529101091764-c3526daf38fe?w=800&h=480&fit=crop',
      },
      {
        id: 'demo-project-2',
        title: 'Community Story Circles',
        status: 'draft',
        programId: 'program-communities-2025',
        programName: 'Communities in Focus',
        templateTitle: 'Community Story Circles',
        estimatedWeeks: 3,
        sdgAlignment: [3, 4, 11],
        teacherName: 'Peter Nielsen',
        teacherEmail: 'peter@school.dk',
        updatedAt: '2025-02-18T09:10:00.000Z',
        coverImageUrl:
          'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=480&fit=crop',
      },
    ]
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
              <Link href="/partner/login">
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
          {isOwnProfile && <TabsTrigger value="network">Network</TabsTrigger>}
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

        {isOwnProfile && (
          <NetworkTab
            teachers={teachers}
            partnerSchools={partnerSchools}
            programSummaries={programSummaries}
            showInviteTeacherDialog={showInviteTeacherDialog}
            setShowInviteTeacherDialog={setShowInviteTeacherDialog}
            showInviteSchoolDialog={showInviteSchoolDialog}
            setShowInviteSchoolDialog={setShowInviteSchoolDialog}
          />
        )}

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
