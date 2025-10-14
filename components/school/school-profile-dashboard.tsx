'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle,
  Download,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  Plus,
  School,
  Tag,
  Target,
  TrendingUp,
  Users,
  UserPlus,
  ChevronDown,
  ChevronUp,
  GraduationCap,
} from 'lucide-react'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import {
  aggregateProgramMetrics,
  buildProgramSummary,
  type ProgramSummary,
} from '@/lib/programs/selectors'
import type { ProgramProject } from '@/lib/types/program'

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
  language: string
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

const monthFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  year: 'numeric',
})

const formatDateRange = (start?: string, end?: string) => {
  if (!start && !end) return 'Timeline coming soon'
  if (start && !end) return `${monthFormatter.format(new Date(start))} onwards`
  if (!start && end) return `Ends ${monthFormatter.format(new Date(end))}`
  try {
    return `${monthFormatter.format(new Date(start!))} – ${monthFormatter.format(new Date(end!))}`
  } catch {
    return `${start} – ${end}`
  }
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
  const [expandedPrograms, setExpandedPrograms] = useState<Set<string>>(new Set())

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
        derived.push({
          id: template.id,
          title: template.title,
          description: template.summary,
          type: 'template',
          language: template.languageSupport?.join(', ') || 'English',
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
        description: 'Comprehensive guide for teaching human rights concepts',
        type: 'teaching_guide',
        language: 'English',
        updatedAt: '2025-01-10T10:00:00Z',
        programName: 'Communities in Focus',
      },
      {
        id: 'resource-2',
        title: 'Climate Action Project Templates',
        description: 'Ready-to-use templates for climate projects',
        type: 'template',
        language: 'English',
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

  const projectStats = useMemo(() => {
    const stats: Record<ProjectStatus, number> = {
      draft: 0,
      active: 0,
      completed: 0,
      archived: 0,
    }

    projects.forEach((project) => {
      stats[project.status] = (stats[project.status] ?? 0) + 1
    })

    return stats
  }, [projects])

  const projectStatusClasses: Record<ProjectStatus, string> = {
    draft: 'bg-yellow-100 text-yellow-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    archived: 'bg-gray-200 text-gray-700',
  }

  const projectStatusLabels: Record<ProjectStatus, string> = {
    draft: 'Draft',
    active: 'Active',
    completed: 'Completed',
    archived: 'Archived',
  }

  const finishedProjectCount = projectStats.completed + projectStats.archived
  const totalProjects = projects.length

  const handleTabChange = (value: string) => {
    setActiveTab(value as typeof activeTab)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('tab', value)
      window.history.pushState({}, '', url.toString())
    }
  }

  const toggleProgramExpansion = (programId: string) => {
    setExpandedPrograms((prev) => {
      const next = new Set(prev)
      if (next.has(programId)) {
        next.delete(programId)
      } else {
        next.add(programId)
      }
      return next
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 via-purple-400/10 to-purple-600/30 text-purple-700">
            <School className="h-8 w-8" />
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{school.name}</h1>
              <Badge className="bg-purple-100 text-purple-700">
                <School className="mr-1 h-3 w-3" />
                School Profile
              </Badge>
            </div>
            <p className="max-w-2xl text-sm text-gray-600">
              {school.description || `${school.type} in ${school.location}`}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>
                  {school.city}, {school.country}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <span>{school.languages.join(', ')}</span>
              </span>
            </div>
          </div>
        </div>

        {isOwnProfile && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button onClick={onEdit} variant="outline">
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

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-900">{school.contactName}</p>
                  <p className="text-gray-500">Primary contact</p>
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-4 w-4" />
                  School Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs uppercase text-gray-500">Type</p>
                  <p className="font-semibold text-gray-900">{school.type}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">Students</p>
                  <p className="font-semibold text-gray-900">{school.studentCount}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">Teachers</p>
                  <p className="font-semibold text-gray-900">{school.teacherCount}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">Languages</p>
                  <div className="flex flex-wrap gap-1">
                    {school.languages.map((language) => (
                      <Badge key={language} variant="secondary" className="text-xs">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Impact Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-md border border-purple-100 bg-purple-50/60 p-3">
                  <p className="text-2xl font-bold text-purple-700">{programMetrics.totalPrograms}</p>
                  <p className="text-xs text-gray-600">Programs</p>
                </div>
                <div className="rounded-md border border-purple-100 bg-purple-50/60 p-3">
                  <p className="text-2xl font-bold text-purple-700">{programMetrics.activeProjects}</p>
                  <p className="text-xs text-gray-600">Active Projects</p>
                </div>
                <div className="rounded-md border border-purple-100 bg-purple-50/60 p-3">
                  <p className="text-2xl font-bold text-purple-700">{programMetrics.countryCount}</p>
                  <p className="text-xs text-gray-600">Countries</p>
                </div>
                <div className="rounded-md border border-purple-100 bg-purple-50/60 p-3">
                  <p className="text-2xl font-bold text-purple-700">{school.sdgFocus.length}</p>
                  <p className="text-xs text-gray-600">SDGs</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-purple-600" />
                  Learning Interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {school.interests.map((interest) => (
                    <Badge key={interest} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  SDG Focus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {school.sdgFocus.map((sdg) => (
                    <Badge key={sdg} className="bg-purple-100 text-purple-700">
                      SDG {sdg}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="programs" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Programs your school joins</h3>
              <p className="text-sm text-gray-600">
                Stay aligned with the partner profile experience while tracking your collaborations.
              </p>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700" asChild>
              <Link href="/discover">
                <Plus className="mr-2 h-4 w-4" />
                Join another program
              </Link>
            </Button>
          </div>

          {!prototypeReady ? (
            <Card>
              <CardContent className="p-10 text-center text-sm text-gray-500">
                Loading programs…
              </CardContent>
            </Card>
          ) : programSummaries.length === 0 ? (
            <Card className="border-dashed border-purple-200">
              <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                <BookOpen className="h-12 w-12 text-purple-300" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">You haven&apos;t joined a program yet</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Browse the catalog and connect your classrooms with partners worldwide.
                  </p>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                  <Link href="/discover">Explore programs</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {programSummaries.map((summary) => {
                const { program, metrics } = summary
                const isExpanded = expandedPrograms.has(program.id)
                const heroTemplate = summary.templates.find((template) => Boolean(template.heroImageUrl))
                const programVisual = program.logo ?? heroTemplate?.heroImageUrl ?? null

                return (
                  <Card key={program.id} className="overflow-hidden border border-purple-100 transition-shadow hover:shadow-md">
                    {heroTemplate?.heroImageUrl && (
                      <div className="relative h-32 w-full">
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(${heroTemplate.heroImageUrl})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-purple-700/20 to-black/30" />
                        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs font-medium text-white drop-shadow">
                          <Badge className="bg-white/20 text-white backdrop-blur-sm">Program spotlight</Badge>
                          <span>{program.displayTitle ?? program.name}</span>
                        </div>
                      </div>
                    )}
                    <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex flex-1 gap-4">
                        {programVisual && (
                          <div className="flex-shrink-0">
                            <Image
                              src={programVisual}
                              alt={program.displayTitle ?? program.name}
                              width={80}
                              height={80}
                              className="h-16 w-16 rounded-lg border border-purple-100 object-cover shadow-sm"
                            />
                          </div>
                        )}
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="text-xl">
                              {program.displayTitle ?? program.name}
                            </CardTitle>
                            <Badge variant="outline" className="capitalize">
                              {program.status}
                            </Badge>
                          </div>
                          {program.displayTitle && program.displayTitle !== program.name && (
                            <p className="text-xs text-gray-500">{program.name}</p>
                          )}
                          <CardDescription>
                            {program.marketingTagline ?? program.description}
                          </CardDescription>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-3 w-3 text-purple-500" />
                              {formatDateRange(program.startDate, program.endDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3 text-purple-500" />
                              {metrics.teacherCount} teachers
                            </span>
                            <span className="flex items-center gap-1">
                              <School className="h-3 w-3 text-purple-500" />
                              {metrics.institutionCount} schools
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/discover/programs/${program.id}`}>View program</Link>
                        </Button>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700" asChild>
                          <Link href={`/discover/programs/${program.id}?join=1`}>Go to program workspace</Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div className="rounded-md border border-gray-200 bg-white p-3 text-center hover:shadow-sm transition-shadow">
                          <div className="mb-1 flex items-center justify-center gap-1">
                            <Target className="h-3 w-3 text-purple-500" />
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                              Active Projects
                            </p>
                          </div>
                          <p className="text-xl font-bold text-gray-900">{metrics.activeProjectCount}</p>
                        </div>
                        <div className="rounded-md border border-gray-200 bg-white p-3 text-center hover:shadow-sm transition-shadow">
                          <div className="mb-1 flex items-center justify-center gap-1">
                            <GraduationCap className="h-3 w-3 text-purple-500" />
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                              Students
                            </p>
                          </div>
                          <p className="text-xl font-bold text-gray-900">
                            {metrics.studentCount.toLocaleString()}
                          </p>
                        </div>
                        <div className="rounded-md border border-gray-200 bg-white p-3 text-center hover:shadow-sm transition-shadow">
                          <div className="mb-1 flex items-center justify-center gap-1">
                            <Globe className="h-3 w-3 text-purple-500" />
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                              Countries
                            </p>
                          </div>
                          <p className="text-xl font-bold text-gray-900">{metrics.countries.length}</p>
                        </div>
                        <div className="rounded-md border border-gray-200 bg-white p-3 text-center hover:shadow-sm transition-shadow">
                          <div className="mb-1 flex items-center justify-center gap-1">
                            <BookOpen className="h-3 w-3 text-purple-500" />
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                              Templates
                            </p>
                          </div>
                          <p className="text-xl font-bold text-gray-900">{metrics.templateCount}</p>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex flex-wrap items-center gap-2">
                        {program.sdgFocus.slice(0, 4).map((sdg) => (
                          <Badge key={sdg} className="bg-purple-100 text-purple-700">
                            SDG {sdg}
                          </Badge>
                        ))}
                      </div>

                      <div className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => toggleProgramExpansion(program.id)}>
                          {isExpanded ? (
                            <>
                              Hide details
                              <ChevronUp className="ml-1 h-4 w-4" />
                            </>
                          ) : (
                            <>
                              Show participation details
                              <ChevronDown className="ml-1 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>

                      {isExpanded && (
                        <div className="space-y-6 rounded-lg border border-purple-100 bg-purple-50/40 p-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900">
                                Your teachers in this program
                              </h4>
                              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                                {summary.teachers.slice(0, 4).map((teacher) => (
                                  <li key={teacher.id}>
                                    {teacher.firstName} {teacher.lastName ?? ''} ·{' '}
                                    {teacher.subject ?? 'Teacher'} ({teacher.status})
                                  </li>
                                ))}
                                {summary.teachers.length === 0 && (
                                  <li>No teachers connected yet.</li>
                                )}
                              </ul>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900">
                                Partner schools you collaborate with
                              </h4>
                              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                                {summary.institutions.slice(0, 4).map((institution) => (
                                  <li key={institution.id}>
                                    {institution.name} · {institution.country}
                                  </li>
                                ))}
                                {summary.institutions.length === 0 && (
                                  <li>Invite partner schools to unlock shared projects.</li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs uppercase text-gray-500">Total projects</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{totalProjects}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs uppercase text-gray-500">Active</p>
                <p className="mt-1 text-2xl font-semibold text-green-600">
                  {projectStats.active}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs uppercase text-gray-500">Drafts</p>
                <p className="mt-1 text-2xl font-semibold text-yellow-600">
                  {projectStats.draft}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs uppercase text-gray-500">Finished</p>
                <p className="mt-1 text-2xl font-semibold text-blue-600">
                  {finishedProjectCount}
                </p>
              </CardContent>
            </Card>
          </div>

          {projects.length === 0 ? (
            <Card className="border-dashed border-purple-200 bg-purple-50/50">
              <CardContent className="p-8 text-center text-sm text-purple-700">
                No classroom projects yet. Encourage teachers to start a project from a shared template
                or create their own inside a partner program.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="overflow-hidden border border-purple-100">
                  {project.coverImageUrl && (
                    <div className="relative h-32 w-full overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${project.coverImageUrl})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-purple-700/10" />
                    </div>
                  )}
                  <CardContent className="space-y-4 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-lg font-semibold text-gray-900">{project.title}</h4>
                          <Badge className={projectStatusClasses[project.status]}>
                            {projectStatusLabels[project.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{project.programName}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/teacher/projects?project=${project.id}`}>View project</Link>
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-purple-500" />
                        {project.teacherName}
                      </span>
                      {project.teacherEmail && (
                        <span className="text-xs text-gray-500">{project.teacherEmail}</span>
                      )}
                      {project.estimatedWeeks && project.estimatedWeeks > 0 && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4 text-purple-500" />
                          {project.estimatedWeeks} week
                          {project.estimatedWeeks > 1 ? 's' : ''}
                        </span>
                      )}
                      {project.templateTitle && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4 text-purple-500" />
                          Based on {project.templateTitle}
                        </span>
                      )}
                    </div>

                    {project.sdgAlignment && project.sdgAlignment.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.sdgAlignment.slice(0, 4).map((sdg) => (
                          <Badge
                            key={`${project.id}-sdg-${sdg}`}
                            className="bg-purple-100 text-purple-700"
                          >
                            SDG {sdg}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {project.updatedAt && (
                      <p className="text-xs text-gray-500">
                        Updated {new Date(project.updatedAt).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {isOwnProfile && (
          <TabsContent value="network" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      Teachers
                    </CardTitle>
                    <CardDescription>
                      Manage the educators from your school who collaborate across programs.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowInviteTeacherDialog(true)}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite teacher
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 p-4"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {teacher.name}{' '}
                        <span className="text-xs text-gray-500">· {teacher.programName}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        {teacher.subject} • {teacher.email}
                      </p>
                    </div>
                    <Badge variant={teacher.status === 'active' ? 'default' : 'secondary'}>
                      {teacher.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <School className="h-5 w-5 text-purple-600" />
                      Partner schools
                    </CardTitle>
                    <CardDescription>
                      Schools you collaborate with inside your shared programs.
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowInviteSchoolDialog(true)}>
                    Invite school
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {partnerSchools.map((partnerSchool) => (
                  <div
                    key={partnerSchool.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 p-4"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {partnerSchool.name}{' '}
                        <span className="text-xs text-gray-500">· {partnerSchool.programName}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        {partnerSchool.country ?? 'Country coming soon'}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      View profile
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {showInviteTeacherDialog && (
              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Invite teacher</h3>
                      <p className="text-sm text-gray-600">
                        Send an invitation to bring a new teacher into your programs.
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowInviteTeacherDialog(false)}>
                      Close
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Name</label>
                      <input
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Teacher name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        placeholder="teacher@email.com"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Program</label>
                      <select className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                        {programSummaries.map((summary) => (
                          <option key={summary.program.id}>{summary.program.displayTitle ?? summary.program.name}</option>
                        ))}
                        {programSummaries.length === 0 && <option>Program selection coming soon</option>}
                      </select>
                    </div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Send invite
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {showInviteSchoolDialog && (
              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Invite partner school</h3>
                      <p className="text-sm text-gray-600">
                        Share your program workspace with another school you want to collaborate with.
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowInviteSchoolDialog(false)}>
                      Close
                    </Button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">School name</label>
                      <input
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        placeholder="International School Name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Country</label>
                      <input
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Country"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Primary contact email</label>
                      <input
                        type="email"
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        placeholder="contact@school.org"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Program</label>
                      <select className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                        {programSummaries.map((summary) => (
                          <option key={summary.program.id}>{summary.program.displayTitle ?? summary.program.name}</option>
                        ))}
                        {programSummaries.length === 0 && <option>Program selection coming soon</option>}
                      </select>
                    </div>
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Send invite
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        <TabsContent value="resources" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Program resources</h3>
              <p className="text-sm text-gray-600">
                Aligned with the partner profile look-and-feel, these are ready for classrooms.
              </p>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Upload resource
            </Button>
          </div>

          {resources.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-gray-500">
                No resources yet. Add materials to support your program participation.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {resources.map((resource) => (
                <Card key={resource.id} className="border border-purple-100">
                  <CardContent className="flex flex-wrap items-start justify-between gap-4 p-6">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <FileText className="h-4 w-4 text-purple-600" />
                        <h4 className="font-semibold text-gray-900">{resource.title}</h4>
                        <Badge variant="outline">{resource.type}</Badge>
                        <Badge variant="secondary" className="text-xs">
                          {resource.programName}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{resource.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span>{resource.language}</span>
                        <span>
                          Updated {new Date(resource.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {isOwnProfile && (
          <TabsContent value="analytics" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Analytics & impact</h3>
              <p className="text-sm text-gray-600">
                Mirrors the partner profile analytics so your team sees the same insights.
              </p>
            </div>

            {programSummaries.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-sm text-gray-500">
                  Join a program to unlock analytics.
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Target className="mx-auto mb-2 h-6 w-6 text-blue-600" />
                      <p className="text-2xl font-bold text-gray-900">
                        {programMetrics.activeProjects}
                      </p>
                      <p className="text-xs text-gray-600">Active projects</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="mx-auto mb-2 h-6 w-6 text-green-600" />
                      <p className="text-2xl font-bold text-gray-900">
                        {programMetrics.completedProjects}
                      </p>
                      <p className="text-xs text-gray-600">Finished projects</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Users className="mx-auto mb-2 h-6 w-6 text-purple-600" />
                      <p className="text-2xl font-bold text-gray-900">
                        {programMetrics.teachers}
                      </p>
                      <p className="text-xs text-gray-600">Teachers engaged</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <GraduationCap className="mx-auto mb-2 h-6 w-6 text-orange-500" />
                      <p className="text-2xl font-bold text-gray-900">
                        {programMetrics.students.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600">Students reached</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <School className="mx-auto mb-2 h-6 w-6 text-indigo-600" />
                      <p className="text-2xl font-bold text-gray-900">
                        {programMetrics.institutions}
                      </p>
                      <p className="text-xs text-gray-600">Institutions connected</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <BookOpen className="mx-auto mb-2 h-6 w-6 text-pink-600" />
                      <p className="text-2xl font-bold text-gray-900">
                        {programSummaries.length}
                      </p>
                      <p className="text-xs text-gray-600">Programs joined</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Globe className="mx-auto mb-2 h-6 w-6 text-teal-600" />
                      <p className="text-2xl font-bold text-gray-900">
                        {programMetrics.countryCount}
                      </p>
                      <p className="text-xs text-gray-600">Countries</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Program performance
                      </CardTitle>
                      <CardDescription>
                        Top programs ranked by student engagement.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {programSummaries
                        .slice()
                        .sort((a, b) => b.metrics.studentCount - a.metrics.studentCount)
                        .slice(0, 4)
                        .map((summary, index) => (
                          <div key={summary.program.id} className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 font-semibold text-purple-700">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900">
                                {summary.program.displayTitle ?? summary.program.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {summary.metrics.studentCount.toLocaleString()} students ·{' '}
                                {summary.metrics.institutionCount} schools
                              </p>
                            </div>
                          </div>
                        ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Export data</CardTitle>
                      <CardDescription>
                        Share aligned reports with administrators and partners.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Export participation summary
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Export student impact (CSV)
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Export teacher engagement report
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      Engagement trends
                    </CardTitle>
                    <CardDescription>
                      Quick-glance percentages to match the partner analytics vibe.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: 'Student participation', value: '85%' },
                      { label: 'Teacher engagement', value: '92%' },
                      { label: 'Project completion', value: '78%' },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-gray-600">{item.label}</span>
                          <span className="font-semibold text-gray-900">{item.value}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-purple-600"
                            style={{ width: item.value }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
