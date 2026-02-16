'use client'

import { Link } from '@/i18n/navigation'
import { useParams } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
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
  Globe2,
  Users2,
  Clock,
  Languages,
} from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { getCountryDisplay } from '@/lib/countries'

import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { SDG_DATA, SDGIconsGrid } from '@/components/sdg-icons'
import { findProgramSummaryById, type ProgramSummary } from '@/lib/programs/selectors'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
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

// Helper for consistent age group calculation based on project name hash
function getProjectAgeGroup(projectName: string): string {
  const ageGroups = ['12-14', '14-16', '16-18']
  const hash = projectName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return ageGroups[hash % ageGroups.length]
}

// Teacher avatar mappings
const TEACHER_AVATARS: Record<string, string> = {
  'Karin Albrectsen': '/images/avatars/karin-new.jpg',
  'Ulla Jensen': '/images/avatars/ulla-new.jpg',
  'Anne Holm': '/images/avatars/anne-holm.png',
  'Sofie Larsen': '/images/avatars/sofie-larsen.png',
  'Sara Ricci': '/images/avatars/sara-ricci.png',
  'Lucas Souza': '/images/avatars/lucas-souza.png',
  'Peter Andersen': '/images/avatars/peter-andersen.png',
}

function getTeacherAvatar(teacherName: string): string | null {
  return TEACHER_AVATARS[teacherName] || null
}

const COUNTRY_LABELS: Record<string, string> = {
  DK: 'Denmark',
  UK: 'United Kingdom',
  MX: 'Mexico',
  IT: 'Italy',
  BD: 'Bangladesh',
  KE: 'Kenya',
  BR: 'Brazil',
  US: 'United States',
  CA: 'Canada',
  FI: 'Finland',
  JP: 'Japan',
  ZA: 'South Africa',
  IN: 'India',
}

export default function TeacherDiscoverProgramDetailPage() {
  const router = useRouter()
  const params = useParams<{ programId: string }>()
  const { ready, database } = usePrototypeDb()

  const summary = useMemo(() => {
    if (!database || !params?.programId) return null
    return findProgramSummaryById(database, params.programId)
  }, [database, params?.programId])

  if (!ready) {
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
              The requested program isn&apos;t available. It may have been
              removed or you may have followed an outdated link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/teacher/discover">Back to Discover</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusBadgeClass = statusStyles[summary.program.status] ?? 'bg-gray-100 text-gray-600'

  return (
    <div className="pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="w-full">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="px-0 text-purple-600 hover:text-purple-700">
            <Link href="/teacher/discover">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Discover
            </Link>
          </Button>
          {/* Teacher Actions could go here, e.g. "Join Program" if not joined */}
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
  const hostId = hostPartner?.partner?.id
  const supportingName = supportingPartner?.partner?.organizationName ?? '—'
  const supportingId = supportingPartner?.partner?.id

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
              Key context and details about this program.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600">
            <p>{summary.program.description}</p>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <OverviewField label="Host organisation" value={hostName} />
                {hostId && (
                  <Link href={`/teacher/partners/${hostId}`} className="text-xs text-purple-600 hover:underline mt-1 block">
                    View Partner Profile
                  </Link>
                )}
              </div>
              <div>
                <OverviewField label="Supporting partner" value={supportingName} />
                {supportingId && (
                  <Link href={`/teacher/partners/${supportingId}`} className="text-xs text-purple-600 hover:underline mt-1 block">
                    View Partner Profile
                  </Link>
                )}
              </div>
              <OverviewField label="Age focus" value={summary.program.targetAgeRanges.join(', ')} />
              <div className="md:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-3">SDG focus</p>
                <div className="flex flex-wrap gap-4">
                  <SDGIconsGrid
                    sdgNumbers={summary.program.sdgFocus}
                    size="sm"
                    showTitles={true}
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-3">CRC focus</p>
                {summary.program.crcFocus?.length ? (
                  <div className="flex flex-wrap gap-4">
                    {summary.program.crcFocus.map((article) => {
                      // Format: "12" -> "12", "3" -> "03"
                      const paddedNum = article.toString().padStart(2, '0')
                      const imageUrl = `/crc/icons/article-${paddedNum}.png`

                      return (
                        <div key={article} className="flex flex-col items-center gap-1">
                          <div className="w-12 h-12 overflow-hidden hover:scale-110 transition-transform duration-200">
                            <Image
                              src={imageUrl}
                              alt={`CRC Article ${article}`}
                              width={48}
                              height={48}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                // Fallback handled by parent or CSS usually, or simple replacement
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-700">—</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="participants" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Participating Institutions</CardTitle>
            <CardDescription>{summary.institutions.length} institutions are connected to this program.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.institutions.length === 0 ? (
              <EmptyState icon={<School className="h-6 w-6 text-purple-500" />} title="No institutions yet" description="Schools participating in the program will appear here." />
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
      </TabsContent>

      <TabsContent value="projects" className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Program projects</h2>
            <p className="text-sm text-gray-600">
              Explore active projects within this program.
            </p>
          </div>
        </div>
        {summary.projects.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <EmptyState icon={<Layers className="h-6 w-6 text-purple-500" />} title="No projects yet" description="Active projects will appear here." />
            </CardContent>
          </Card>
        ) : (

          <div className="grid gap-6 md:grid-cols-3">
            {summary.projects.map((project) => {
              const template = project.templateId
                ? summary.templates.find((entry) => entry.id === project.templateId)
                : undefined

              const title = template?.title ?? project.projectId.replaceAll('-', ' ')
              const image = project.coverImageUrl ?? template?.heroImageUrl ?? 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&h=300&fit=crop'
              const description = template?.summary ?? 'Teacher-defined project aligned to the program approach.'

              const projectType = template?.projectType ?? 'Collaboration'
              const ageRange = `Ages ${getProjectAgeGroup(title)} years`
              const dateLabel = formatMonthFromDate(project.createdAt) ?? 'Flexible'

              const teachers = summary.teachers.filter((t) => t.programId === project.programId)
              const projectTeacher =
                project.createdByType === 'teacher'
                  ? teachers.find((t) => t.id === project.createdById)
                  : undefined
              const primaryTeacher = projectTeacher ?? teachers[0]

              const teacherInstitution = primaryTeacher
                ? summary.institutions.find(i => i.id === primaryTeacher.institutionId)
                : undefined

              const isCommunitiesProgram = project.programId.includes('communities')
              const teacherName = primaryTeacher
                ? `${primaryTeacher.firstName} ${primaryTeacher.lastName}`
                : (isCommunitiesProgram ? 'Sarah Jensen' : 'Teresa Miller')

              const teacherCountry = teacherInstitution?.country
                ?? (isCommunitiesProgram ? 'DK' : 'US')
              const { flag: countryFlag, name: countryName } = getCountryDisplay(teacherCountry)

              return (
                <Card key={project.id} className="flex h-full flex-col overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 group">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <CardContent className="flex flex-1 flex-col p-6 space-y-3">
                    <p className="text-sm font-medium text-[#7F56D9]">
                      Starting Month: {dateLabel}
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 leading-snug">
                      {title}
                    </h3>

                    <div className="text-base text-gray-500 leading-relaxed">
                      <p className="line-clamp-3">{description}</p>
                    </div>

                    <div className="space-y-3 text-sm text-gray-500 mt-2">
                      <div className="flex items-center gap-2.5">
                        <Globe2 className="h-4 w-4" />
                        <span>{projectType}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Users2 className="h-4 w-4" />
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                          {ageRange}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Clock className="h-4 w-4" />
                        <span>Flexible timezone</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Languages className="h-4 w-4" />
                        <span>English</span>
                      </div>
                    </div>

                    <div className="flex-1" />

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-200 bg-gray-100">
                          {getTeacherAvatar(teacherName) ? (
                            <img
                              src={getTeacherAvatar(teacherName)!}
                              alt={teacherName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="w-6 h-6 m-2 text-gray-400" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-0.5">Created by</span>
                          <p className="text-sm font-bold text-gray-900 leading-none mb-1.5">{teacherName}</p>

                          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-full w-fit">
                            <span className="text-sm shadow-sm">{countryFlag}</span>
                            <span className="text-xs font-medium text-purple-600">{countryName}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full mt-4 bg-[#7F56D9] hover:bg-[#6941C6] text-white font-medium shadow-sm" asChild>
                      <Link href={`/teacher/discover/projects/${project.id}`}>
                        View Details
                      </Link>
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
              Educational materials available to teachers in this program.
            </p>
          </div>
        </div>
        {(() => {
          const programResources = summary.program.id === 'program-communities-2025' ? [
            {
              id: 'cultural-exchange-framework',
              title: 'Cultural Exchange Learning Framework',
              description: 'Structured approach to facilitating cross-cultural learning experiences.',
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
              description: 'Comprehensive guide for teaching children\'s rights concepts across cultures.',
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
                <EmptyState icon={<FolderOpen className="h-6 w-6 text-purple-500" />} title="No resources yet" description="Resources will appear here." />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {programResources.map((resource) => {
                const sdgTitles = resource.sdgAlignment?.map((num: number) => {
                  const sdgData = SDG_DATA[num]
                  return sdgData ? `SDG #${num}: ${sdgData.title}` : `SDG ${num}`
                }) || []

                return (
                  <Card key={resource.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row gap-0">
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

                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <h3 className="text-xl font-semibold text-gray-900 leading-tight">
                              {resource.title}
                            </h3>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge className="bg-purple-600 hover:bg-purple-700 text-white">
                              {resource.type}
                            </Badge>
                            {resource.category && (
                              <Badge variant="outline" className="capitalize">
                                {resource.category}
                              </Badge>
                            )}
                            {sdgTitles.length > 0 && (
                              <Badge variant="outline" className="text-orange-700 border-orange-300">
                                {sdgTitles[0]}
                              </Badge>
                            )}
                          </div>

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
    </Tabs >
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

function formatMonthFromDate(isoDate?: string): string | undefined {
  if (!isoDate) {
    return undefined
  }
  const date = new Date(isoDate)
  if (Number.isNaN(date.valueOf())) {
    return undefined
  }
  return new Intl.DateTimeFormat(undefined, { month: 'long' }).format(date)
}
