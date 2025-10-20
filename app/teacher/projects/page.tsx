'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CalendarDays,
  Layers,
  Search,
  Sparkles,
  Users,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTeacherContext } from '@/hooks/use-teacher-context'
import { cn } from '@/lib/utils'
import { ProgramCatalogCard } from '@/components/program/program-catalog-card'
import {
  buildProgramCatalog,
  type ProgramCatalogItem,
  type ProgramSummary,
} from '@/lib/programs/selectors'
import type { ProgramProject, ProgramProjectTemplate } from '@/lib/types/program'

type DecoratedProject = {
  project: ProgramProject
  program: ProgramSummary | null
  template?: ProgramProjectTemplate
}

const finishedStatuses = new Set(['completed', 'archived'])

export default function TeacherProjectsPage() {
  const { ready, database, programSummaries, membershipIds, session } = useTeacherContext()
  const [activeTab, setActiveTab] = useState<'in-progress' | 'finished' | 'programs'>('in-progress')
  const [searchTerm, setSearchTerm] = useState('')

  const decoratedProjects: DecoratedProject[] = useMemo(() => {
    if (!database) return []
    return database.programProjects
      .filter((project) => membershipIds.has(project.createdById))
      .map((project) => {
        const program = programSummaries.find((summary) => summary.program.id === project.programId) ?? null
        const template = program?.templates.find((entry) => entry.id === project.templateId)
        return { project, program, template }
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
  const draftProjectsCount = decoratedProjects.filter(({ project }) => project.status === 'draft').length

  const programCatalogMap = useMemo(() => {
    if (!database) return new Map<string, ProgramCatalogItem>()
    return new Map(
      buildProgramCatalog(database, { includePrivate: true }).map((item) => [item.programId, item]),
    )
  }, [database])

  const projectsByProgramId = useMemo(() => {
    const map = new Map<string, DecoratedProject[]>()
    for (const item of decoratedProjects) {
      const list = map.get(item.project.programId) ?? []
      list.push(item)
      map.set(item.project.programId, list)
    }
    return map
  }, [decoratedProjects])

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
            <p className="text-sm text-gray-600">
              {session?.name ? `${session.name},` : 'You'} have {activeProjectsCount} active projects
              across {programSummaries.length} partner programs.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-purple-700">
            <Badge className="bg-purple-100 text-purple-700">
              <Sparkles className="mr-1 h-3 w-3" />
              {activeProjectsCount} active
            </Badge>
            <Badge className="bg-purple-50 text-purple-700">
              <Layers className="mr-1 h-3 w-3" />
              {draftProjectsCount} drafts
            </Badge>
            <Badge variant="outline" className="border-purple-200 text-purple-700">
              <Users className="mr-1 h-3 w-3" />
              {programSummaries.length} programs
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button variant="outline" asChild>
            <Link href="/discover">Get Inspired</Link>
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
          <TabsTrigger value="programs">
            Partner programs ({programSummaries.length})
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
                <ProjectCard key={item.project.id} item={item} />
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
                <ProjectCard key={item.project.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          {programSummaries.length === 0 ? (
            <Card className="border-dashed border-purple-200 bg-purple-50/60">
              <CardContent className="p-6 text-sm text-purple-700">
                Join a partner program from Discover to unlock tailored resources and collaborations.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {programSummaries.map((summary) => {
                const catalogItem =
                  programCatalogMap.get(summary.program.id) ??
                  buildFallbackCatalogItem(summary)
                const projectCount = projectsByProgramId.get(summary.program.id)?.length ?? 0

                return (
                  <ProgramCatalogCard
                    key={summary.program.id}
                    item={catalogItem}
                    membershipStatus="member"
                    actions={
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={`/discover/programs/${summary.program.id}`}>View program</Link>
                        </Button>
                        <p className="text-center text-xs text-gray-500">
                          {projectCount === 0
                            ? 'No projects yet'
                            : `${projectCount} project${projectCount === 1 ? '' : 's'} in progress`}
                        </p>
                      </div>
                    }
                  />
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProjectCard({ item }: { item: DecoratedProject }) {
  const { project, template, program } = item
  const programName = program?.program.displayTitle ?? program?.program.name ?? 'Program'
  const status = project.status

  const statusBadgeClass =
    status === 'active'
      ? 'bg-green-100 text-green-700'
      : status === 'draft'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-blue-100 text-blue-700'

  const lastUpdated = new Date(project.updatedAt ?? project.createdAt)

  return (
    <Card className="hover:shadow-lg transition-shadow">
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
          {programName}
        </div>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight">
            {template?.title ?? project.projectId.replaceAll('-', ' ')}
          </CardTitle>
          <Badge className={cn('capitalize', statusBadgeClass)}>{status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="mt-auto space-y-4 text-sm text-gray-600">
        <p>
          {template?.summary ??
            'Custom project defined with the AI assistant and aligned to partner expectations.'}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5 text-purple-500" />
            Updated {lastUpdated.toLocaleDateString()}
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              Continue
            </Button>
            <Button size="sm" variant="ghost">
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function buildFallbackCatalogItem(summary: ProgramSummary): ProgramCatalogItem {
  return {
    programId: summary.program.id,
    name: summary.program.name,
    displayTitle: summary.program.displayTitle ?? summary.program.name,
    marketingTagline: summary.program.marketingTagline,
    description: summary.program.description,
    status: summary.program.status,
    isPublic: summary.program.isPublic,
    hostPartner: undefined,
    supportingPartner: undefined,
    supportingRole: summary.program.supportingPartnerRole,
    coverImageUrl: summary.program.logo ?? undefined,
    logo: summary.program.logo ?? undefined,
    brandColor: summary.program.brandColor,
    sdgFocus: summary.program.sdgFocus,
    startMonthLabel: undefined,
    metrics: {
      templates: summary.templates.length,
      activeProjects: summary.metrics.activeProjectCount,
      institutions: summary.metrics.institutionCount,
      countries: summary.metrics.countries.length,
    },
    templates: summary.templates,
  }
}
