'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CalendarDays,
  Globe2,
  Layers,
  MapPin,
  Users,
  Sparkles,
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

const DEFAULT_PROJECT_IMAGE =
  'https://images.unsplash.com/photo-1585366119957-e9730b6d0f05?w=800&h=480&fit=crop'

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
  const [activeTab, setActiveTab] = useState<'overview' | 'templates' | 'projects'>('overview')

  const summary = useMemo(() => {
    if (!database || !params?.programId) return null
    return findProgramSummaryById(database, params.programId)
  }, [database, params?.programId])

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

  const { program, templates, projects, institutions } = summary
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
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="projects">Teacher projects</TabsTrigger>
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
          </TabsContent>

          <TabsContent value="templates" className="space-y-6 pt-6">
            {templates.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-sm text-gray-600">
                  This program hasn&apos;t published reusable templates yet. Once partners add them, they&apos;ll show up here.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {templates.map((template) => (
                  <Card key={template.id} className="flex h-full flex-col border border-purple-100 shadow-sm">
                    {template.heroImageUrl && (
                      <div className="relative h-40 w-full overflow-hidden rounded-t-xl">
                        <Image
                          src={template.heroImageUrl}
                          alt={template.title}
                          fill
                          sizes="(min-width: 768px) 320px, 100vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-gray-900">{template.title}</CardTitle>
                        {template.estimatedDurationWeeks && (
                          <Badge variant="secondary" className="text-xs">
                            {template.estimatedDurationWeeks} week{template.estimatedDurationWeeks > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm text-gray-600">
                        {template.summary}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto space-y-3 text-sm text-gray-600">
                      {template.recommendedStartMonth && (
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-purple-500" />
                          Starts best in {friendlyLabel(template.recommendedStartMonth)}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {template.subjectFocus.map((subject) => (
                          <Badge key={subject} variant="outline">
                            {friendlyLabel(subject)}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {template.languageSupport.map((language) => (
                          <Badge key={language} variant="secondary" className="bg-purple-50 text-purple-700">
                            {language.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                      {template.requiredMaterials && template.requiredMaterials.length > 0 && (
                        <div className="text-xs text-gray-500">
                          <span className="font-medium text-gray-600">Materials: </span>
                          {template.requiredMaterials.join(', ')}
                        </div>
                      )}
                      <Button variant="outline" className="w-full">
                        Preview template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="projects" className="space-y-6 pt-6">
            {projects.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-sm text-gray-600">
                  No classrooms have launched this program yet in the prototype. Once teachers activate a template, you&apos;ll see their projects here.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {projects.map((project) => {
                  const template = project.templateId
                    ? templates.find((entry) => entry.id === project.templateId)
                    : undefined
                  const projectImage = project.coverImageUrl ?? template?.heroImageUrl ?? DEFAULT_PROJECT_IMAGE
                  const startLabel = template?.recommendedStartMonth
                    ? friendlyLabel(template.recommendedStartMonth)
                    : launchMonth ?? 'Ongoing'
                  const createdAt = formatRelative(project.createdAt)
                  const description =
                    template?.summary ??
                    'Classroom collaboration inspired by this partner template. Teachers can reuse the structure or remix it for their learners.'
                  const title =
                    template?.title ??
                    `Teacher project (${friendlyLabel(project.createdByType)})`

                  return (
                    <Card key={project.id} className="flex h-full flex-col overflow-hidden border border-gray-200 shadow-sm">
                      <div className="relative h-40 w-full">
                        <Image
                          src={projectImage}
                          alt={title}
                          fill
                          sizes="(min-width: 1024px) 320px, 100vw"
                          className="object-cover"
                        />
                      </div>
                      <CardHeader className="space-y-2">
                        <p className="text-xs font-medium text-purple-600">Starting Month: {startLabel}</p>
                        <CardTitle className="text-lg text-gray-900">{title}</CardTitle>
                        <CardDescription className="line-clamp-2 text-sm text-gray-600">
                          {description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="mt-auto space-y-3 text-sm text-gray-600">
                        <p>
                          Created by {friendlyLabel(project.createdByType)}
                          {createdAt ? ` • ${createdAt}` : ''}
                        </p>
                        <Button variant="outline" className="w-full">
                          View details
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
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
