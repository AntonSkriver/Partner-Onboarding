'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  GraduationCap,
  Layers,
  MapPin,
  School,
  Users,
  FolderOpen,
  FileText,
} from 'lucide-react'

import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { getCurrentSession } from '@/lib/auth/session'
import { findProgramSummaryById, type ProgramSummary } from '@/lib/programs/selectors'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const statusStyles: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  archived: 'bg-gray-100 text-gray-600',
}

const metricItems = (summary: ProgramSummary) => [
  {
    label: 'Active projects',
    value: summary.metrics.activeProjectCount,
    icon: <Layers className="h-4 w-4 text-purple-500" />,
  },
  {
    label: 'Finished projects',
    value: summary.metrics.completedProjectCount,
    icon: <CheckCircle className="h-4 w-4 text-purple-500" />,
  },
  {
    label: 'Teachers',
    value: summary.metrics.teacherCount,
    icon: <Users className="h-4 w-4 text-purple-500" />,
  },
  {
    label: 'Students',
    value: summary.metrics.studentCount.toLocaleString(),
    icon: <GraduationCap className="h-4 w-4 text-purple-500" />,
  },
  {
    label: 'Institutions',
    value: summary.metrics.institutionCount,
    icon: <School className="h-4 w-4 text-purple-500" />,
  },
  {
    label: 'Countries',
    value: summary.metrics.countries.length,
    icon: <MapPin className="h-4 w-4 text-purple-500" />,
  },
]

export default function PartnerProgramDetailPage() {
  const router = useRouter()
  const params = useParams<{ programId: string }>()
  const [session, setSession] = useState(() => getCurrentSession())
  const { ready, database } = usePrototypeDb()

  useEffect(() => {
    setSession(getCurrentSession())
  }, [])

  useEffect(() => {
    if (!session || session.role !== 'partner') {
      router.push('/partner/login')
    }
  }, [router, session])

  const summary = useMemo(() => {
    if (!database || !params?.programId) return null
    return findProgramSummaryById(database, params.programId)
  }, [database, params?.programId])

  if (!session || !ready) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">
              Loading program experience…
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6 text-sm text-gray-600">
            Please wait while we prepare your program overview.
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-lg text-center space-y-4">
          <CardHeader>
            <CardTitle className="text-2xl">Program not found</CardTitle>
            <CardDescription>
              The requested program isn&apos;t available in the prototype data. It may have been
              removed or you may have followed an outdated link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/partner/profile?tab=programs">Back to programs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusBadgeClass = statusStyles[summary.program.status] ?? 'bg-gray-100 text-gray-600'

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="px-0 text-purple-600 hover:text-purple-700">
            <Link href="/partner/profile?tab=programs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to programs
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/partner/programs/${summary.program.id}/edit`}>Edit program</Link>
            </Button>
          </div>
        </div>

        <Card className="mb-8 border border-gray-200 shadow-sm">
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-2xl text-gray-900">
                    {summary.program.displayTitle ?? summary.program.name}
                  </CardTitle>
                  <Badge className={statusBadgeClass}>
                    {summary.program.status.replace('-', ' ')}
                  </Badge>
                </div>
                {summary.program.displayTitle && summary.program.displayTitle !== summary.program.name && (
                  <p className="text-xs text-gray-500">{summary.program.name}</p>
                )}
                <p className="max-w-2xl text-sm text-gray-600">
                  {summary.program.marketingTagline ?? summary.program.description}
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5 text-purple-500" />
                    {formatDate(summary.program.startDate)} – {formatDate(summary.program.endDate)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-purple-500" />
                    {summary.metrics.countries.length}{' '}
                    {summary.metrics.countries.length === 1 ? 'country' : 'countries'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {metricItems(summary).map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-gray-200 bg-white p-3 text-center"
                >
                  <div className="mb-1 flex items-center justify-center gap-1 text-xs text-gray-500 uppercase tracking-wide">
                    {item.icon}
                    {item.label}
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <ProgramTabs summary={summary} />
      </div>
    </div>
  )
}

function ProgramTabs({ summary }: { summary: ProgramSummary }) {
  const [tab, setTab] = useState<'overview' | 'participants' | 'projects' | 'resources'>('overview')
  const hostPartner = summary.coPartners.find(({ relationship }) => relationship.role === 'host')
  const supportingPartner = summary.program.supportingPartnerId
    ? summary.coPartners.find(({ relationship }) => relationship.partnerId === summary.program.supportingPartnerId)
    : undefined

  const hostName = hostPartner?.partner?.organizationName ?? 'Host organisation'
  const supportingName = supportingPartner?.partner?.organizationName ?? '—'

  return (
    <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)} className="space-y-6">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="participants">Participants</TabsTrigger>
        <TabsTrigger value="projects">Projects</TabsTrigger>
        <TabsTrigger value="resources">Resources</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Program snapshot</CardTitle>
            <CardDescription>
              Key context your partner team shares with coordinators and invited schools.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600">
            <p>{summary.program.description}</p>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
              <OverviewField label="Host organisation" value={hostName} />
              <OverviewField label="Supporting partner" value={supportingName} />
              <OverviewField label="Pedagogical frameworks" value={summary.program.pedagogicalFramework.map((item) => item.replace(/_/g, ' ')).join(', ')} />
              <OverviewField label="Age focus" value={summary.program.targetAgeRanges.join(', ')} />
              <OverviewField label="SDG focus" value={summary.program.sdgFocus.map((sdg) => `SDG ${sdg}`).join(', ')} />
              <OverviewField label="Countries" value={summary.metrics.countries.join(', ')} />
            </div>
          </CardContent>
        </Card>

        {summary.institutions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Highlighted institutions</CardTitle>
              <CardDescription>
                A quick look at schools currently participating in this program. View the Network tab for full details.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {summary.institutions.slice(0, 4).map((institution) => (
                <div key={institution.id} className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{institution.name}</p>
                    <Badge variant="outline" className="capitalize">{institution.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {institution.country}{institution.region ? ` • ${institution.region}` : ''}
                  </p>
                  <p className="mt-3 text-xs text-gray-500">
                    {institution.studentCount.toLocaleString()} students
                    {institution.teacherCount ? ` • ${institution.teacherCount} teachers` : ''}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="participants" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Institutions</CardTitle>
            <CardDescription>{summary.institutions.length} institutions are connected to this program.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.institutions.length === 0 ? (
              <EmptyState icon={<School className="h-6 w-6 text-purple-500" />} title="No institutions yet" description="Invite schools from the Network tab to populate this list." />
            ) : (
              summary.institutions.map((institution) => (
                <div key={institution.id} className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{institution.name}</p>
                      <p className="text-xs text-gray-500">
                        {institution.country}{institution.region ? ` • ${institution.region}` : ''}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">{institution.status}</Badge>
                  </div>
                  <div className="mt-3 grid gap-3 text-xs text-gray-500 sm:grid-cols-3">
                    <span>{institution.studentCount.toLocaleString()} students</span>
                    <span>{institution.educationLevels.join(', ')}</span>
                    <span>{institution.languages.join(', ')}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Country coordinators</CardTitle>
            <CardDescription>{summary.coordinators.length} coordinators manage onboarding and support.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.coordinators.length === 0 ? (
              <EmptyState icon={<Users className="h-6 w-6 text-purple-500" />} title="No coordinators yet" description="Assign coordinators from the Network tab when you&apos;re ready." />
            ) : (
              summary.coordinators.map((coordinator) => (
                <div key={coordinator.id} className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">
                      {coordinator.firstName} {coordinator.lastName}
                    </p>
                    <Badge variant="outline" className="capitalize">{coordinator.status}</Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    {coordinator.country}{coordinator.region ? ` • ${coordinator.region}` : ''}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">{coordinator.email}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="projects" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Program projects</CardTitle>
            <CardDescription>
              Track active and completed classroom collaborations within this program.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.projects.length === 0 ? (
              <EmptyState icon={<Layers className="h-6 w-6 text-purple-500" />} title="No projects yet" description="Once teachers launch projects they will appear here." />
            ) : (
              summary.projects.map((project) => {
                const template = project.templateId
                  ? summary.templates.find((entry) => entry.id === project.templateId)
                  : undefined
                const status = project.status
                const statusClass = status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : status === 'completed'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'

                return (
                  <div key={project.id} className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {template?.title ?? project.projectId.replaceAll('-', ' ')}
                        </p>
                        <p className="text-xs text-gray-500">Created {new Date(project.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge className={statusClass}>{status}</Badge>
                    </div>
                    <p className="mt-3 text-sm text-gray-600">
                      {template?.summary ?? 'Teacher-defined project aligned to the program approach.'}
                    </p>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="resources" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Program resources</CardTitle>
            <CardDescription>
              Templates and materials available to teachers running this program.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.templates.length === 0 ? (
              <EmptyState icon={<FolderOpen className="h-6 w-6 text-purple-500" />} title="No templates yet" description="Upload learning resources or guided templates from the Resources tab." />
            ) : (
              summary.templates.map((template) => (
                <div key={template.id} className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{template.title}</p>
                      <p className="text-xs text-gray-500">Estimated {template.estimatedDurationWeeks} week(s) • {template.languageSupport.join(', ').toUpperCase()}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">{template.summary}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

function OverviewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-sm text-gray-700">{value || '—'}</p>
    </div>
  )
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
      <div className="rounded-full bg-white p-2 shadow-sm">{icon}</div>
      <p className="font-medium text-gray-900">{title}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  )
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return value
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
