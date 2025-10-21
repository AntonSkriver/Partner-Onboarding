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
  MoreVertical,
  Plus,
} from 'lucide-react'

import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { SDG_DATA } from '@/components/sdg-icons'
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Program projects</h2>
            <p className="text-sm text-gray-600">
              Track active and completed classroom collaborations within this program.
            </p>
          </div>
        </div>
        {summary.projects.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <EmptyState icon={<Layers className="h-6 w-6 text-purple-500" />} title="No projects yet" description="Once teachers launch projects they will appear here." />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {summary.projects.map((project) => {
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
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  {project.coverImageUrl && (
                    <div className="relative h-40 overflow-hidden rounded-t-lg">
                      <img
                        src={project.coverImageUrl}
                        alt={template?.title ?? project.projectId}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="text-sm text-purple-600 font-medium mb-1">
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg leading-tight">
                        {template?.title ?? project.projectId.replaceAll('-', ' ')}
                      </CardTitle>
                      <Badge className={statusClass}>{status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-4">
                      {template?.summary ?? 'Teacher-defined project aligned to the program approach.'}
                    </p>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </TabsContent>

      <TabsContent value="resources" className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Program resources</h2>
            <p className="text-sm text-gray-600">
              Educational materials and resources available to teachers in this program.
            </p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Resources
          </Button>
        </div>
        {(() => {
          // Mock program resources - in real implementation, these would be resources assigned to this program
          const programResources = summary.program.id === 'program-communities-2025' ? [
            {
              id: 'cultural-exchange-framework',
              title: 'Cultural Exchange Learning Framework',
              description: 'Structured approach to facilitating cross-cultural learning experiences. Includes activities, discussion prompts, and assessment tools for virtual exchange programs.',
              type: 'Video',
              category: 'Framework',
              ageRange: '9-13 years old',
              sdgAlignment: [4],
              language: 'English',
              heroImageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=480&fit=crop',
            },
            {
              id: 'children-rights-toolkit',
              title: 'Children\'s Rights Education Toolkit',
              description: 'Comprehensive guide for teaching children\'s rights concepts across cultures. Perfect for middle and high school students exploring global citizenship and human rights.',
              type: 'Document',
              category: 'Teaching Guide',
              ageRange: '13-19 years old',
              sdgAlignment: [16],
              language: 'English',
              heroImageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=480&fit=crop',
            }
          ] : []

          return programResources.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <EmptyState icon={<FolderOpen className="h-6 w-6 text-purple-500" />} title="No resources yet" description="Add resources from your library to make them available to teachers in this program." />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {programResources.map((resource) => {
                // Get SDG data
                const sdgTitles = resource.sdgAlignment?.map((num: number) => {
                  const sdgData = SDG_DATA[num]
                  return sdgData ? `SDG #${num}: ${sdgData.title}` : `SDG ${num}`
                }) || []

                return (
                  <Card key={resource.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row gap-0">
                        {/* Thumbnail */}
                        <div className="sm:w-48 sm:h-48 h-40 flex-shrink-0 bg-gray-100 relative overflow-hidden">
                          {resource.heroImageUrl ? (
                            <img
                              src={resource.heroImageUrl}
                              alt={resource.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-50">
                              <FileText className="w-12 h-12 text-purple-300" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <h3 className="text-xl font-semibold text-gray-900 leading-tight">
                              {resource.title}
                            </h3>
                            <Button variant="ghost" size="sm" className="flex-shrink-0">
                              <MoreVertical className="h-4 w-4 text-gray-400" />
                            </Button>
                          </div>

                          {/* Metadata badges */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge className="bg-purple-600 hover:bg-purple-700 text-white">
                              {resource.type}
                            </Badge>

                            {resource.category && (
                              <Badge variant="outline" className="capitalize">
                                {resource.category}
                              </Badge>
                            )}

                            {resource.ageRange && (
                              <Badge variant="outline">
                                {resource.ageRange}
                              </Badge>
                            )}

                            {sdgTitles.length > 0 && (
                              <Badge variant="outline" className="text-orange-700 border-orange-300">
                                {sdgTitles[0]}
                              </Badge>
                            )}

                            <Badge className="bg-purple-600 hover:bg-purple-700 text-white">
                              {resource.language}
                            </Badge>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {resource.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )
        })()}
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
