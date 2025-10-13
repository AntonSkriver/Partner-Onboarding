'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CalendarDays,
  Globe2,
  Layers,
  MapPin,
  Users,
  Sparkles,
  School,
  UserCheck,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import {
  findProgramSummaryById,
  type ProgramSummary,
} from '@/lib/programs/selectors'
import {
  getCurrentSession,
  type UserSession,
} from '@/lib/auth/session'

const friendlyLabel = (value: string): string =>
  value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')

const formatDateRange = (startDate?: string, endDate?: string): string => {
  if (!startDate && !endDate) return 'TBD'
  const start = startDate ? new Date(startDate) : null
  const end = endDate ? new Date(endDate) : null
  const format = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    year: 'numeric',
  })
  if (start && end) {
    return `${format.format(start)} – ${format.format(end)}`
  }
  if (start) {
    return `${format.format(start)} onward`
  }
  return `Until ${format.format(end as Date)}`
}

const formatRelative = (isoDate: string | undefined): string | null => {
  if (!isoDate) return null
  const date = new Date(isoDate)
  if (Number.isNaN(date.valueOf())) return null
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

const getStartMonthLabel = (summary: ProgramSummary): string | undefined => {
  const templateWithMonth = summary.templates.find(
    (template) => template.recommendedStartMonth && template.recommendedStartMonth.trim().length > 0,
  )
  if (templateWithMonth) {
    return friendlyLabel(templateWithMonth.recommendedStartMonth as string)
  }

  if (!summary.program.startDate) {
    return undefined
  }

  const start = new Date(summary.program.startDate)
  if (Number.isNaN(start.valueOf())) {
    return undefined
  }

  return new Intl.DateTimeFormat(undefined, { month: 'long' }).format(start)
}

export default function DiscoverProgramDetailPage() {
  const params = useParams<{ programId: string }>()
  const router = useRouter()
  const { ready, database } = usePrototypeDb()
  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'projects'>('overview')

  const summary = useMemo(() => {
    if (!database || !params?.programId) return null
    return findProgramSummaryById(database, params.programId)
  }, [database, params?.programId])

  const [session, setSession] = useState<UserSession | null>(null)

  useEffect(() => {
    setSession(getCurrentSession())
  }, [])

  const viewerEmail = session?.email?.toLowerCase() ?? ''

  const viewerTeacherMemberships = useMemo(() => {
    if (!database || !viewerEmail) return []
    return database.institutionTeachers.filter(
      (teacher) => teacher.email.toLowerCase() === viewerEmail,
    )
  }, [database, viewerEmail])

  const viewerTeacherIdSet = useMemo(
    () => new Set(viewerTeacherMemberships.map((teacher) => teacher.id)),
    [viewerTeacherMemberships],
  )

  const viewerProgramIds = useMemo(
    () => new Set(viewerTeacherMemberships.map((teacher) => teacher.programId)),
    [viewerTeacherMemberships],
  )

  const myProjects = useMemo(() => {
    if (!summary) return []
    return summary.projects.filter((project) => viewerTeacherIdSet.has(project.createdById))
  }, [summary, viewerTeacherIdSet])

  if (!params?.programId) {
    return null
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="space-y-3 text-center text-gray-600">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600" />
          <p>Loading program experience…</p>
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Program not found</h1>
          <p className="mt-2 text-sm text-gray-600">
            This program isn&apos;t available in the prototype catalogue. It may be unpublished or renamed.
          </p>
          <Button className="mt-6" onClick={() => router.push('/discover')}>
            Back to Discover
          </Button>
        </div>
      </div>
    )
  }
  const { program, templates, institutions } = summary
  const isMember = viewerProgramIds.has(program.id)
  const canViewParticipants = program.isPublic || isMember
  const hostPartner = summary.coPartners.find(
    ({ relationship }) => relationship.role === 'host',
  )?.partner
  const supportingPartner = program.supportingPartnerId
    ? summary.coPartners.find(
        ({ relationship }) => relationship.partnerId === program.supportingPartnerId,
      )?.partner
    : undefined
  const launchMonth = getStartMonthLabel(summary)

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="mx-auto w-full max-w-5xl px-4 pt-8">
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" className="text-sm text-gray-600 hover:text-purple-600" asChild>
            <Link href="/discover" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Discover
            </Link>
          </Button>
        </div>

        <Card className="mt-6 border-none bg-gradient-to-br from-purple-50 to-white shadow-sm">
          <CardContent className="space-y-6 p-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                <Sparkles className="h-3.5 w-3.5" />
                Program Experience
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-gray-900">
                  {program.displayTitle ?? program.name}
                </h1>
                {program.displayTitle && program.displayTitle !== program.name && (
                  <p className="text-sm text-gray-500">{program.name}</p>
                )}
                <p className="text-base text-gray-700">
                  {program.marketingTagline ?? program.description}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                {hostPartner && (
                  <span className="flex items-center gap-1">
                    <Layers className="h-4 w-4 text-purple-500" />
                    Hosted by {hostPartner.organizationName}
                  </span>
                )}
                {supportingPartner && (
                  <span className="flex items-center gap-1">
                    <Globe2 className="h-4 w-4 text-purple-500" />
                    {program.supportingPartnerRole === 'sponsor' ? 'Sponsored by' : 'Co-hosted with'}{' '}
                    {supportingPartner.organizationName}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4 text-purple-500" />
                  {formatDateRange(program.startDate, program.endDate)}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-purple-500" />
                  {summary.metrics.teacherCount} teacher{summary.metrics.teacherCount === 1 ? '' : 's'}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-purple-500" />
                  {summary.metrics.countries.length} countr{summary.metrics.countries.length === 1 ? 'y' : 'ies'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {program.sdgFocus.map((sdg) => (
                  <Badge key={sdg} variant="secondary" className="bg-purple-100 text-purple-700">
                    SDG {sdg}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-purple-100 bg-white/70 p-5 shadow-sm backdrop-blur">
              <div className="space-y-3">
                {launchMonth && (
                  <div className="inline-flex rounded-lg bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700">
                    Suggested start: {launchMonth}
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-4">
                  <QuickFact label="Templates" value={templates.length} />
                  <QuickFact label="Active projects" value={summary.metrics.activeProjectCount} />
                  <QuickFact label="Institutions" value={summary.metrics.institutionCount} />
                  <QuickFact label="Learners (est.)" value={summary.metrics.studentCount.toLocaleString()} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="mt-10">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Program overview</CardTitle>
                <CardDescription>
                  High-level summary partners share with teachers so classrooms know what to expect.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose max-w-none text-sm text-gray-700">
                  <p>{program.description}</p>
                </div>
                <Separator />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Learning goals</h4>
                    <p className="text-sm text-gray-600">{program.learningGoals}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Pedagogical frameworks</h4>
                    <div className="flex flex-wrap gap-2">
                      {program.pedagogicalFramework.map((framework) => (
                        <Badge key={framework} variant="outline">
                          {friendlyLabel(framework)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Age focus</h4>
                    <div className="flex flex-wrap gap-2">
                      {program.targetAgeRanges.map((range) => (
                        <Badge key={range} variant="secondary">
                          {range.replace('-', '–')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Countries involved</h4>
                    <div className="flex flex-wrap gap-2">
                      {program.countriesInScope.map((country) => (
                        <Badge key={country} variant="outline">
                          {country}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </TabsContent>

          <TabsContent value="participants" className="space-y-6 pt-6">
            {canViewParticipants ? (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="border-purple-100 bg-purple-50/60">
                    <CardContent className="space-y-1 p-4">
                      <div className="flex items-center gap-2 text-purple-600">
                        <Users className="h-4 w-4" />
                        <span className="text-sm font-semibold">Teachers</span>
                      </div>
                      <p className="text-2xl font-semibold text-gray-900">
                        {summary.metrics.teacherCount}
                      </p>
                      <p className="text-xs text-gray-500">
                        Classroom leads active in this program.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-purple-100 bg-purple-50/60">
                    <CardContent className="space-y-1 p-4">
                      <div className="flex items-center gap-2 text-purple-600">
                        <School className="h-4 w-4" />
                        <span className="text-sm font-semibold">Schools</span>
                      </div>
                      <p className="text-2xl font-semibold text-gray-900">
                        {summary.metrics.institutionCount}
                      </p>
                      <p className="text-xs text-gray-500">
                        Partner schools collaborating across the network.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-purple-100 bg-purple-50/60">
                    <CardContent className="space-y-1 p-4">
                      <div className="flex items-center gap-2 text-purple-600">
                        <UserCheck className="h-4 w-4" />
                        <span className="text-sm font-semibold">Coordinators</span>
                      </div>
                      <p className="text-2xl font-semibold text-gray-900">
                        {summary.metrics.coordinatorCount}
                      </p>
                      <p className="text-xs text-gray-500">
                        Country coordinators supporting onboarding and facilitation.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Participating institutions</CardTitle>
                    <CardDescription>
                      Schools currently connected to this program in the prototype data set.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {institutions.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-purple-200 bg-purple-50/60 p-6 text-center text-sm text-purple-800">
                        No institutions have joined yet. Once coordinators invite schools, they&apos;ll appear here.
                      </div>
                    ) : (
                      <div className="grid gap-3 md:grid-cols-2">
                        {institutions.map((institution) => (
                          <div key={institution.id} className="rounded-lg border border-gray-200 bg-white p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">{institution.name}</p>
                                <p className="text-xs text-gray-500">
                                  {institution.city ? `${institution.city}, ` : ''}
                                  {institution.country}
                                </p>
                              </div>
                              <Badge variant="outline" className="capitalize">
                                {institution.status}
                              </Badge>
                            </div>
                            <p className="mt-2 text-sm text-gray-600">
                              {institution.studentCount.toLocaleString()} students •{' '}
                              {(institution.teacherCount ?? 0).toLocaleString()} teachers
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Teacher community</CardTitle>
                    <CardDescription>
                      Snapshot of the educators collaborating in this program.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {summary.teachers.length === 0 ? (
                      <p className="text-sm text-gray-600">
                        Teachers will appear here once schools invite their classroom leads.
                      </p>
                    ) : (
                      <div className="grid gap-3 md:grid-cols-2">
                        {summary.teachers.slice(0, 6).map((teacher) => (
                          <div key={teacher.id} className="rounded-lg border border-gray-200 bg-gray-50/80 p-3">
                            <p className="text-sm font-semibold text-gray-900">
                              {teacher.firstName} {teacher.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{teacher.subject}</p>
                            <p className="text-xs text-gray-400">
                              {teacher.gradeLevel} • {teacher.status}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Want to participate? Join the program to access detailed rosters and contact information.
                    </p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-dashed border-purple-200 bg-purple-50/60">
                <CardContent className="p-6 text-sm text-purple-700">
                  Participants lists are available once you join the program. Request access or accept your invitation to see schools and teachers.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="projects" className="space-y-6 pt-6">
        {isMember && (
          <Card>
            <CardHeader>
              <CardTitle>My projects in this program</CardTitle>
              <CardDescription>
                Continue collaborating with partner classrooms or launch new activities using the guided AI flow.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {myProjects.length === 0 ? (
                <div className="rounded-lg border border-dashed border-purple-200 bg-purple-50/70 p-6 text-center text-sm text-purple-700">
                  You haven&apos;t created a project for this program yet. Use the “Create project” button on the dashboard to get started.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {myProjects.map((project) => {
                    const template = project.templateId
                      ? templates.find((entry) => entry.id === project.templateId)
                      : undefined
                    const createdAt = formatRelative(project.createdAt)
                    return (
                      <Card key={project.id} className="border border-purple-100">
                        <CardHeader className="space-y-1">
                          <CardTitle className="text-base text-gray-900">
                            {template?.title ?? project.projectId.replaceAll('-', ' ')}
                          </CardTitle>
                          <CardDescription className="text-xs text-gray-500">
                            Status: {friendlyLabel(project.status)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-gray-600">
                          <p>
                            {template?.summary ??
                              'Custom project defined with the AI assistant and aligned to partner expectations.'}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Updated {createdAt ?? 'recently'}</span>
                            <Button size="sm" variant="outline">
                              Continue
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="overflow-hidden border border-gray-200 bg-white shadow-sm">
          <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-10 -left-20 h-40 w-40 rounded-full bg-white/40 blur-3xl" />
              <div className="absolute -top-10 right-20 h-60 w-60 rounded-full bg-yellow-300/30 blur-3xl" />
              <div className="absolute bottom-0 right-10 h-40 w-40 rounded-full bg-pink-300/40 blur-2xl" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white">
              <h3 className="text-xl font-bold drop-shadow-lg">Bring this program to life in your classroom</h3>
              <p className="mt-2 max-w-xl text-sm text-white/95 drop-shadow">
                Launch your own Build the Change collaboration and help students design playful solutions for thriving communities.
              </p>
            </div>
          </div>
          <CardContent className="p-6 text-sm text-gray-600">
            <p>
              Start with your classroom&apos;s goals, choose the partners you want to collaborate with, and let students prototype ideas that matter to them.
            </p>
          </CardContent>
          <div className="flex items-center justify-end border-t border-gray-200 bg-gray-50 px-6 py-4">
            <Button className="bg-purple-600 text-white hover:bg-purple-700" asChild>
              <Link href="/teacher/projects">Create your project</Link>
            </Button>
          </div>
        </Card>
      </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

const QuickFact = ({ label, value }: { label: string; value: string | number }) => (
  <div className="space-y-1 text-sm text-gray-600">
    <p className="text-xs uppercase text-gray-500">{label}</p>
    <p className="text-lg font-semibold text-gray-900">{value}</p>
  </div>
)
