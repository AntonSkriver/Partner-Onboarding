'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Search, Sparkles, Users, Globe2, Users2, Clock, Languages } from 'lucide-react'
import { motion } from 'framer-motion'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTeacherContext } from '@/hooks/use-teacher-context'
import { cn } from '@/lib/utils'
import {
  type ProgramSummary,
} from '@/lib/programs/selectors'
import { getCountryDisplay } from '@/lib/countries'
import type {
  ProgramProject,
  ProgramProjectTemplate,
  InstitutionTeacher,
  EducationalInstitution,
  ProjectType,
} from '@/lib/types/program'

type DecoratedProject = {
  project: ProgramProject
  program: ProgramSummary | null
  template?: ProgramProjectTemplate
  creator?: {
    teacher: InstitutionTeacher | null
    institution: EducationalInstitution | null
  }
}

const finishedStatuses = new Set(['completed', 'archived'])

export default function TeacherProjectsPage() {
  const { ready, database, programSummaries, membershipIds, session } = useTeacherContext()
  const [activeTab, setActiveTab] = useState<'in-progress' | 'finished'>('in-progress')
  const [searchTerm, setSearchTerm] = useState('')

  const decoratedProjects: DecoratedProject[] = useMemo(() => {
    if (!database) return []
    return database.programProjects
      .filter((project) =>
        membershipIds.has(project.createdById) ||
        project.participantIds?.some(id => membershipIds.has(id))
      )
      .map((project) => {
        const program = programSummaries.find((summary) => summary.program.id === project.programId) ?? null
        const template = program?.templates.find((entry) => entry.id === project.templateId)
        const teacher =
          database.institutionTeachers.find((entry) => entry.id === project.createdById) ?? null
        const institution = teacher
          ? database.institutions.find((entry) => entry.id === teacher.institutionId) ?? null
          : null

        return {
          project,
          program,
          template,
          creator: {
            teacher,
            institution,
          },
        }
      })
  }, [database, membershipIds, programSummaries])

  const inProgressProjects = useMemo(
    () => decoratedProjects.filter(({ project }) => !finishedStatuses.has(project.status)),
    [decoratedProjects],
  )

  const finishedProjects = useMemo(
    () => decoratedProjects.filter(({ project }) => finishedStatuses.has(project.status)),
    [decoratedProjects],
  )

  const visibleInProgress = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return inProgressProjects
    return inProgressProjects.filter(({ project, template, program }) => {
      const projectTitle = (template?.title ?? project.projectId).toLowerCase()
      const programName =
        (program?.program.displayTitle ?? program?.program.name ?? '').toLowerCase()
      return projectTitle.includes(query) || programName.includes(query)
    })
  }, [inProgressProjects, searchTerm])

  const visibleFinished = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return finishedProjects
    return finishedProjects.filter(({ project, template, program }) => {
      const projectTitle = (template?.title ?? project.projectId).toLowerCase()
      const programName =
        (program?.program.displayTitle ?? program?.program.name ?? '').toLowerCase()
      return projectTitle.includes(query) || programName.includes(query)
    })
  }, [finishedProjects, searchTerm])

  const activeProjectsCount = decoratedProjects.filter(({ project }) => project.status === 'active').length

  if (!ready) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-sm text-gray-600">Loading your projects…</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="w-fit justify-start px-0 text-purple-600 hover:text-purple-700"
          >
            <Link href="/teacher/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">My Projects</h1>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button variant="outline" asChild>
            <Link href="/teacher/discover">Get Inspired</Link>
          </Button>
          <Button className="bg-purple-600 text-white hover:bg-purple-700">New Project</Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search projects or programs"
            className="pl-10"
          />
        </div>
        <select className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-600">
          <option>All collaboration types</option>
          <option>Active only</option>
          <option>Drafts</option>
        </select>
        <select className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-600">
          <option>All SDGs</option>
          <option>SDG 4 Quality Education</option>
          <option>SDG 10 Reduced Inequalities</option>
          <option>SDG 16 Peace & Justice</option>
        </select>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-6">
        <TabsList>
          <TabsTrigger value="in-progress">
            In progress ({inProgressProjects.length})
          </TabsTrigger>
          <TabsTrigger value="finished">
            Finished ({finishedProjects.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in-progress" className="space-y-4">
          {visibleInProgress.length === 0 ? (
            <Card className="border-dashed border-purple-200 bg-purple-50/60">
              <CardContent className="p-6 text-sm text-purple-700">
                You don&apos;t have any active projects yet. Start one from a partner program or create your own.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {visibleInProgress.map((item) => (
                <ProjectCard key={item.project.id} item={item} membershipIds={membershipIds} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="finished" className="space-y-4">
          {visibleFinished.length === 0 ? (
            <Card className="border-dashed border-gray-200 bg-gray-50">
              <CardContent className="p-6 text-sm text-gray-600">
                When you mark projects as completed they&apos;ll appear here for future reference.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {visibleFinished.map((item) => (
                <ProjectCard key={item.project.id} item={item} membershipIds={membershipIds} />
              ))}
            </div>
          )}
        </TabsContent>


      </Tabs>
    </div >
  )
}

// Avatar mapping for teachers
const TEACHER_AVATARS: Record<string, string> = {
  'Anne Holm': '/images/avatars/anne-holm.png',
  'Karin Albrectsen': '/images/avatars/karin-new.jpg',
  'Ulla Jensen': '/images/avatars/ulla-new.jpg',
  'Maria Garcia': '/images/avatars/maria-new.jpg',
  'Raj Patel': '/images/avatars/raj-new.jpg',
  'Jonas Madsen': '/images/avatars/jonas-final.jpg',
}

function ProjectCard({ item, membershipIds }: { item: DecoratedProject; membershipIds: Set<string> }) {
  const { project, template, program, creator } = item
  const [isExpanded, setIsExpanded] = useState(false)

  const createdDate = new Date(project.createdAt)
  const hoursSinceCreated = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const createdText =
    hoursSinceCreated < 24
      ? `Created ${hoursSinceCreated} hours ago`
      : `Created ${Math.floor(hoursSinceCreated / 24)} days ago`

  const teacher = creator?.teacher ?? null
  const institution = creator?.institution ?? null

  const isHost = teacher?.id ? membershipIds.has(teacher.id) : false
  const isParticipant = !isHost && project.participantIds?.some(id => membershipIds.has(id))
  const fullTeacherName = [teacher?.firstName, teacher?.lastName].filter(Boolean).join(' ') || 'Unknown teacher'
  const teacherName = isHost ? 'You (Host)' : fullTeacherName
  const roleLabel = isParticipant ? 'Joined' : null
  const teacherAvatar = TEACHER_AVATARS[fullTeacherName]

  const teacherInitials = computeInitials(teacher?.firstName, teacher?.lastName, teacherName)
  const { flag: countryFlag, name: countryName } = getCountryDisplay(institution?.country ?? '')

  // Detect partner type for ribbon banners
  const programName = program?.program.displayTitle ?? program?.program.name ?? ''
  const isUnicef = programName.toLowerCase().includes('unicef') || programName.toLowerCase().includes('communities')
  const isSaveTheChildren = programName.toLowerCase().includes('save the children') || programName.toLowerCase().includes('build the change')

  const primaryProjectTypeKey = pickPrimaryProjectType(program?.program.projectTypes ?? [])
  const projectTypeLabel = formatProjectType(primaryProjectTypeKey)

  const startingMonthLabel =
    template?.recommendedStartMonth ??
    new Intl.DateTimeFormat(undefined, { month: 'long' }).format(createdDate)

  const ageRangeLabel = formatAgeRange(program?.program.targetAgeRanges?.[0])
  const timezoneLabel = getTimezoneHint(institution?.country)
  const languageLabel = formatLanguages(institution?.languages)

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      {/* Hero Image */}
      {project.coverImageUrl && (
        <div className="relative h-44 overflow-hidden">
          <Image
            src={project.coverImageUrl}
            alt={template?.title ?? project.projectId}
            fill
            sizes="(min-width: 768px) 320px, 100vw"
            className="h-full w-full object-cover"
          />

          {/* UNICEF Ribbon Banner */}
          {isUnicef && (
            <motion.div
              className="pointer-events-none absolute top-0 right-0 z-10 overflow-hidden w-28 h-28"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="absolute top-[16px] -right-[30px] w-[140px] bg-gradient-to-r from-[#00AEEF] via-[#29B6F6] to-[#00AEEF] py-2 rotate-45 shadow-lg flex items-center justify-center"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.2 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                />
                <div className="relative z-10 flex items-center gap-1.5">
                  <Image src="/partners/unicef-logo.png" alt="UNICEF" width={26} height={26} className="drop-shadow-sm brightness-0 invert" />
                  <span className="text-white text-[10px] font-bold tracking-wider drop-shadow-sm">UNICEF</span>
                </div>
              </motion.div>
              <div className="absolute top-[42px] right-0 w-0 h-0 border-l-[6px] border-l-[#0277BD] border-b-[6px] border-b-transparent" />
              <div className="absolute top-0 right-[42px] w-0 h-0 border-t-[6px] border-t-transparent border-r-[6px] border-r-[#0277BD]" />
            </motion.div>
          )}

          {/* Save the Children Ribbon Banner */}
          {isSaveTheChildren && (
            <motion.div
              className="pointer-events-none absolute top-0 right-0 z-10 overflow-hidden w-28 h-28"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="absolute top-[16px] -right-[30px] w-[140px] bg-gradient-to-r from-[#E31B23] via-[#FF3B3B] to-[#E31B23] py-2 rotate-45 shadow-lg flex items-center justify-center"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.2 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                />
                <div className="relative z-10 flex items-center gap-1">
                  <Image src="/partners/save-the-children-logo.png" alt="Save the Children" width={24} height={24} className="drop-shadow-sm brightness-0 invert" />
                  <div className="flex flex-col leading-none">
                    <span className="text-white text-[7px] font-bold tracking-wide drop-shadow-sm">Save the</span>
                    <span className="text-white text-[7px] font-bold tracking-wide drop-shadow-sm">Children</span>
                  </div>
                </div>
              </motion.div>
              <div className="absolute top-[42px] right-0 w-0 h-0 border-l-[6px] border-l-[#B71C1C] border-b-[6px] border-b-transparent" />
              <div className="absolute top-0 right-[42px] w-0 h-0 border-t-[6px] border-t-transparent border-r-[6px] border-r-[#B71C1C]" />
            </motion.div>
          )}
        </div>
      )}

      {/* Content */}
      {/* Content */}
      <CardContent className="flex flex-1 flex-col space-y-4 p-5">

        {/* Header Tags */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            {/* Active/Status Tag */}
            <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100 gap-1.5 px-2 py-1 font-medium rounded-md">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
              Active
            </Badge>

            {/* Joined Tag (for projects user joined but didn't create) */}
            {roleLabel ? (
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 gap-1.5 px-2 py-1 font-medium rounded-md">
                <Users2 className="w-3 h-3" />
                {roleLabel}
              </Badge>
            ) : (
              /* Visibility Tag - only show when not joined */
              <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100 gap-1.5 px-2 py-1 font-medium rounded-md">
                {program?.program.isPublic ? <Globe2 className="w-3 h-3" /> : <Users2 className="w-3 h-3" />}
                {program?.program.isPublic ? 'Public' : 'Private'}
              </Badge>
            )}
          </div>

          <span className="text-xs text-gray-400 font-medium whitespace-nowrap flex-shrink-0">
            {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(createdDate)}
          </span>
        </div>

        {/* Title & Host */}
        <div className="space-y-1">
          <h3 className="text-xl font-bold leading-tight text-gray-900">
            {template?.title ?? project.projectId.replaceAll('-', ' ')}
          </h3>
          <p className="text-sm text-gray-500">
            Hosted by <span className={cn("font-medium", isHost ? "text-gray-900" : "text-gray-900")}>{teacherName}</span>
          </p>
        </div>

        {/* Description */}
        <div className="text-sm text-gray-600">
          <p className={cn(!isExpanded && 'line-clamp-2')}>
            {template?.summary ??
              'Custom project defined with the AI assistant and aligned to partner expectations.'}
          </p>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 text-sm font-medium text-purple-600 hover:text-purple-700"
          >
            {isExpanded ? 'Read less' : 'Read more'}
          </button>
        </div>

        {/* Metadata Icons */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-gray-400" />
            <span>{projectTypeLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users2 className="h-4 w-4 text-gray-400" />
            <span>{ageRangeLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>{timezoneLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-gray-400" />
            <span>{languageLabel}</span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Created By Section */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-500 text-xs font-semibold text-white overflow-hidden flex-shrink-0">
              {teacherAvatar ? (
                <img src={teacherAvatar} alt={teacherName} className="h-full w-full object-cover" />
              ) : (
                teacherInitials
              )}
            </div>
            <div className="text-xs">
              <p className="font-medium text-gray-900">{teacherName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm">{countryFlag}</span>
                <span className="text-purple-600 font-medium">{countryName}</span>
              </div>
              <p className="mt-0.5 text-gray-400 text-[10px]">{createdText}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 border-purple-600 text-purple-600 hover:bg-purple-50"
            size="sm"
          >
            Continue
          </Button>
          <Button variant="ghost" className="flex-1" size="sm">
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const PRIORITY_PROJECT_TYPES: ProjectType[] = [
  'cultural_exchange',
  'explore_global_challenges',
  'create_solutions',
]

const LANGUAGE_LABELS: Record<string, string> = {
  da: 'Danish',
  de: 'German',
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  it: 'Italian',
  no: 'Norwegian',
  pt: 'Portuguese',
  sv: 'Swedish',
}

const TIMEZONE_HINTS: Record<string, string> = {
  BR: '-4 hours from you',
  CA: '-6 hours from you',
  DE: '+0 hours from you',
  DK: 'Matches your timezone',
  ES: '+0 hours from you',
  FR: '+0 hours from you',
  GB: '-1 hour from you',
  IN: '+4.5 hours from you',
  IT: '+0 hours from you',
  MX: '-7 hours from you',
  NO: '+0 hours from you',
  PT: '-1 hour from you',
  SE: '+0 hours from you',
  US: '-6 hours from you',
}

function computeInitials(
  first?: string | null,
  last?: string | null,
  fallbackLabel?: string,
): string {
  const firstInitial = first?.trim().charAt(0) ?? ''
  const lastInitial = last?.trim().charAt(0) ?? ''
  const combined = `${firstInitial}${lastInitial}`.trim()

  if (combined) {
    return combined.toUpperCase()
  }

  if (fallbackLabel) {
    const letters = fallbackLabel
      .split(/\s+/)
      .filter(Boolean)
      .map((segment) => segment.charAt(0))
      .join('')

    if (letters) {
      return letters.slice(0, 2).toUpperCase()
    }
  }

  return '??'
}

function pickPrimaryProjectType(types: ProjectType[]): ProjectType | undefined {
  if (!types?.length) {
    return undefined
  }

  for (const desired of PRIORITY_PROJECT_TYPES) {
    if (types.includes(desired)) {
      return desired
    }
  }

  return types[0]
}

function formatProjectType(value?: string): string {
  if (!value) {
    return 'Cultural Exchange'
  }

  return value
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

function formatAgeRange(range?: string): string {
  if (!range) {
    return 'All ages'
  }

  if (range === '18+') {
    return 'Ages 18+'
  }

  const [start, end] = range.split('-')
  if (!end) {
    return `Ages ${start}`
  }

  return `Ages ${start} - ${end} years`
}

function getTimezoneHint(countryCode?: string | null): string {
  if (!countryCode) {
    return 'Flexible timezone'
  }

  const normalized = countryCode.trim().toUpperCase()
  return TIMEZONE_HINTS[normalized] ?? 'Varies by partner'
}

function formatLanguages(codes?: string[] | null): string {
  if (!codes || codes.length === 0) {
    return 'English'
  }

  const labels = codes
    .map((code) => LANGUAGE_LABELS[code.toLowerCase()] ?? code.toUpperCase())
    .filter(Boolean)

  return labels.join(', ')
}

