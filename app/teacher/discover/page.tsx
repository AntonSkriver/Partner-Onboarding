'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Filter,
  Layers,
  Users,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ProgramCatalogCard } from '@/components/program/program-catalog-card'
import { buildProgramCatalog } from '@/lib/programs/selectors'
import { useTeacherContext } from '@/hooks/use-teacher-context'
import { cn } from '@/lib/utils'

export default function TeacherDiscoverPage() {
  const { ready, database, programSummaries, myProgramIds, membershipIds } = useTeacherContext()
  const [joinedPrograms, setJoinedPrograms] = useState<Set<string>>(new Set())
  const [programFilter, setProgramFilter] = useState<'mine' | 'all'>('mine')

  useEffect(() => {
    setJoinedPrograms(new Set(myProgramIds))
  }, [myProgramIds])

  const isLoading = !ready || !database

  const catalog = useMemo(() => {
    if (!database) return []
    const items = buildProgramCatalog(database, { includePrivate: true })
    return items.filter((item) => item.isPublic || myProgramIds.has(item.programId))
  }, [database, myProgramIds])

  const openProjects = useMemo(() => {
    if (!database) return []
    return database.programProjects.filter((project) => project.status === 'active')
  }, [database])

  const filteredProjects = useMemo(() => {
    if (!database) return []
    return openProjects
      .map((project) => {
        const summary = programSummaries.find((entry) => entry.program.id === project.programId)
        return {
          project,
          summary,
          isMember: myProgramIds.has(project.programId),
        }
      })
      .filter(({ summary }) => Boolean(summary))
      .filter((entry) => (programFilter === 'mine' ? entry.isMember : true))
  }, [openProjects, programSummaries, myProgramIds, programFilter, database])

  const handleJoinProgram = (programId: string) => {
    setJoinedPrograms((prev) => {
      const next = new Set(prev)
      next.add(programId)
      return next
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <Card className="border-0 bg-gray-900 text-white">
        <CardContent className="space-y-6 p-8">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-wide text-purple-200">Discover</p>
            <h1 className="text-3xl font-semibold leading-tight">Partner programs and collaborations</h1>
            <p className="max-w-3xl text-base text-gray-200">
              Browse curated programs, join invite-only initiatives you have access to, and find open collaborations requesting classrooms right now.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-purple-100">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              <Layers className="h-4 w-4" />
              {programSummaries.length} programs
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              <Users className="h-4 w-4" />
              {membershipIds.size} teacher membership{membershipIds.size === 1 ? '' : 's'}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              <Sparkles className="h-4 w-4" />
              AI tailored project guidance
            </span>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Partner programs</h2>
            <p className="text-sm text-gray-600">
              Join public programs or open the ones you already belong to. Private programs are visible when you&apos;ve been invited by the hosting partner.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {catalog.map((item) => {
            const isMember = joinedPrograms.has(item.programId)
            return (
              <ProgramCatalogCard
                key={item.programId}
                item={item}
                membershipStatus={isMember ? 'member' : item.isPublic ? 'available' : 'invite-only'}
                onJoin={
                  item.isPublic && !isMember
                    ? () => handleJoinProgram(item.programId)
                    : undefined
                }
                actions={
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/discover/programs/${item.programId}`}>View program</Link>
                    </Button>
                    {!item.isPublic && !isMember && (
                      <Button className="w-full" variant="ghost" disabled>
                        Invite-only access
                      </Button>
                    )}
                    {isMember && (
                      <p className="text-center text-xs text-gray-500">
                        You&apos;re already in this program.
                      </p>
                    )}
                  </div>
                }
              />
            )
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Open collaborations</h2>
            <p className="text-sm text-gray-600">
              Classroom projects actively inviting new participants. Filter to see only the programs you belong to.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm">
            <Filter className="h-4 w-4 text-purple-500" />
            <button
              className={cn(
                'rounded-full px-3 py-1',
                programFilter === 'mine'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-purple-600',
              )}
              onClick={() => setProgramFilter('mine')}
            >
              My programs
            </button>
            <button
              className={cn(
                'rounded-full px-3 py-1',
                programFilter === 'all'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-purple-600',
              )}
              onClick={() => setProgramFilter('all')}
            >
              All programs
            </button>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <Card className="border-dashed border-purple-200 bg-purple-50/60">
            <CardContent className="p-6 text-sm text-purple-700">
              No open collaborations match your filter. Try switching to “All programs” or check back soon.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {filteredProjects.map(({ project, summary, isMember }) => {
              const template = summary?.templates.find((entry) => entry.id === project.templateId)
              const badgeText = summary?.program.displayTitle ?? summary?.program.name ?? 'Program project'
              return (
                <Card key={project.id} className="flex h-full flex-col border border-gray-200 shadow-sm">
                  <CardContent className="flex flex-1 flex-col space-y-3 p-5">
                    <Badge variant={isMember ? 'secondary' : 'outline'} className="w-fit">
                      {isMember ? 'Your program' : 'Discoverable'}
                    </Badge>
                    <h3 className="text-base font-semibold text-gray-900">
                      {template?.title ?? project.projectId.replaceAll('-', ' ')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {template?.summary ??
                        'Program project inviting classrooms to collaborate. Review the outline and request to join.'}
                    </p>
                    <div className="mt-auto space-y-2 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {badgeText}
                        </Badge>
                        <span>Updated {new Date(project.updatedAt ?? project.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-gray-600">
                          <Users className="h-3.5 w-3.5 text-purple-500" />
                          {summary?.metrics.teacherCount ?? 0} teachers
                        </span>
                        <Button variant="outline" size="sm">
                          Request to join
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-purple-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-purple-600" />
              Program visibility and membership
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <p>
              Public programs are available for any teacher to join. Private programs appear here only when you&apos;ve been invited.
              Joining keeps the program handy across your dashboard, filters, and AI project definition flow.
            </p>
            <p>
              You can always create independent projects outside a program via the main project creation flow if you need more flexibility.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-900">Filter projects by program</CardTitle>
            <CardDescription>
              Use the program filter on the project search page to focus on specific partner collaborations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" asChild className="w-full">
              <Link href="/teacher/projects">
                Open project search
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="text-xs text-gray-500">
              Your program badges follow each project so you can immediately see if it is part of a partner initiative.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
