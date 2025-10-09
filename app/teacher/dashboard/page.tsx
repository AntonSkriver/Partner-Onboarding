'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Compass,
  Layers,
  Users,
  GraduationCap,
  Sparkles,
  FolderKanban,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useTeacherContext } from '@/hooks/use-teacher-context'
import { formatDistanceToNow } from 'date-fns'

const friendlyStatus = (status: string) => {
  switch (status) {
    case 'active':
      return { label: 'Active', className: 'bg-green-100 text-green-700' }
    case 'draft':
      return { label: 'Draft', className: 'bg-amber-100 text-amber-700' }
    case 'completed':
      return { label: 'Completed', className: 'bg-blue-100 text-blue-700' }
    default:
      return { label: status, className: 'bg-gray-100 text-gray-600' }
  }
}

export default function TeacherDashboardPage() {
  const {
    ready,
    session,
    programSummaries,
    myProgramIds,
    membershipIds,
    database,
    myInstitutions,
  } = useTeacherContext()

  const isLoading = !ready || !database

  const teacherProjects = useMemo(() => {
    if (!database) return []
    const createdBy = membershipIds
    return database.programProjects.filter((project) => createdBy.has(project.createdById))
  }, [database, membershipIds])

  const peerConnections = useMemo(() => {
    const peers = new Set<string>()
    programSummaries.forEach((summary) => {
      summary.teachers.forEach((teacher) => {
        if (!membershipIds.has(teacher.id) && teacher.email) {
          peers.add(teacher.email)
        }
      })
    })
    return peers.size
  }, [programSummaries, membershipIds])

  const studentsReached = useMemo(
    () =>
      myInstitutions.reduce(
        (total, institution) => total + (institution.studentCount ?? 0),
        0,
      ),
    [myInstitutions],
  )

  const openCollaborations = useMemo(() => {
    if (!database) return []
    return database.programProjects.filter(
      (project) =>
        project.status === 'active' &&
        myProgramIds.has(project.programId) &&
        !membershipIds.has(project.createdById),
    )
  }, [database, myProgramIds, membershipIds])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Teacher session required</CardTitle>
          <CardDescription>
            Use the “Log in as teacher” preview button from the partner dashboard to view this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/partner/profile?tab=programs">Back to partner tools</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-10">
      <Card className="overflow-hidden border-0 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-500 text-white shadow-xl">
        <CardContent className="p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-wide text-purple-100">Welcome back</p>
              <h1 className="text-3xl font-semibold leading-tight">
                Hi, {session.name ?? 'Teacher'} — here is what is happening in your programs today.
              </h1>
              <p className="max-w-2xl text-base text-purple-100">
                Keep collaborating with partner classrooms, launch new projects with our guided AI
                flow, and track the progress of every program you belong to.
              </p>
              <div className="flex flex-wrap gap-2">
                {programSummaries.length > 0 ? (
                  programSummaries.map((summary) => (
                    <Badge key={summary.program.id} variant="secondary" className="bg-white/15 text-white">
                      {summary.program.displayTitle ?? summary.program.name}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="secondary" className="bg-white/15 text-white">
                    No active program memberships yet
                  </Badge>
                )}
              </div>
            </div>
            <div className="grid gap-4 rounded-2xl bg-white/10 p-5 text-sm text-purple-50">
              <div>
                <p className="text-xs uppercase tracking-wide text-purple-200">Programs</p>
                <p className="text-2xl font-semibold">{programSummaries.length}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-purple-200">Projects</p>
                <p className="text-2xl font-semibold">{teacherProjects.length}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-purple-200">Connections</p>
                <p className="text-2xl font-semibold">{peerConnections}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <QuickActionCard
          icon={<Compass className="h-5 w-5 text-purple-600" />}
          title="Discover partner programs"
          description="Explore curated programs from UNICEF, LEGO and other partners."
          actionLabel="Browse programs"
          href="/teacher/discover"
        />
        <QuickActionCard
          icon={<Layers className="h-5 w-5 text-purple-600" />}
          title="My programs"
          description="Review participants, resources and program updates."
          actionLabel="Open programs"
          href="#my-programs"
        />
        <QuickActionCard
          icon={<Sparkles className="h-5 w-5 text-purple-600" />}
          title="Create program project"
          description="Use the AI-guided definition flow tailored to your program."
          actionLabel="Start a project"
          href="/teacher/discover"
        />
      </section>

      <section id="my-programs" className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">My partner programs</h2>
          <p className="text-sm text-gray-600">
            Access program resources, see who else is participating, and launch new collaborations.
          </p>
        </div>

        {programSummaries.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-6 text-sm text-gray-600">
              You&apos;re not part of a program yet. Browse public partner programs and join the ones that
              fit your classroom goals.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {programSummaries.map((summary) => (
              <Card key={summary.program.id} className="border-purple-100 shadow-sm">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg text-gray-900">
                        {summary.program.displayTitle ?? summary.program.name}
                      </CardTitle>
                      <CardDescription>
                        {summary.program.marketingTagline ?? summary.program.description.slice(0, 110)}…
                      </CardDescription>
                    </div>
                    <Badge>{summary.program.isPublic ? 'Public' : 'Invite-only'}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    {summary.program.pedagogicalFramework.slice(0, 3).map((framework) => (
                      <Badge key={framework} variant="outline">
                        {framework.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <Metric label="Teachers" value={summary.metrics.teacherCount} icon={<Users className="h-4 w-4 text-purple-500" />} />
                    <Metric label="Institutions" value={summary.metrics.institutionCount} icon={<Activity className="h-4 w-4 text-purple-500" />} />
                    <Metric label="Active projects" value={summary.metrics.activeProjectCount} icon={<CheckCircle2 className="h-4 w-4 text-purple-500" />} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Next check-in:{' '}
                      {summary.program.startDate
                        ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(
                            new Date(summary.program.startDate),
                          )
                        : 'TBD'}
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/discover/programs/${summary.program.id}`}>
                        View program
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">My projects</h2>
            <p className="text-sm text-gray-600">
              Continue drafting, collaborating, or publishing projects aligned with your programs.
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Sparkles className="mr-2 h-4 w-4" />
            Create new project
          </Button>
        </div>

        {teacherProjects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-6 text-sm text-gray-600">
              Launch your first project by selecting a program template or defining your idea with the
              AI assistant.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {teacherProjects.map((project) => {
              const program = programSummaries.find((summary) => summary.program.id === project.programId)
              const status = friendlyStatus(project.status)
              return (
                <Card key={project.id} className="border-gray-200">
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {project.projectId.replaceAll('-', ' ').replace('project ', '')}
                        </p>
                        {program && (
                          <p className="text-xs text-gray-500">
                            Program: {program.program.displayTitle ?? program.program.name}
                          </p>
                        )}
                      </div>
                      <Badge className={status.className}>{status.label}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <CalendarDays className="h-3.5 w-3.5 text-purple-500" />
                      Updated {formatDistanceToNow(new Date(project.updatedAt ?? project.createdAt), { addSuffix: true })}
                    </div>
                    <div className="flex items-center justify-between">
                      <Button size="sm" variant="outline">
                        Continue
                      </Button>
                      <Button size="sm" variant="ghost">
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Open collaborations in your programs</h2>
            <p className="text-sm text-gray-600">
              Join classrooms currently inviting partners or explore what other teachers are building.
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/teacher/discover">
              View all collaborations
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {openCollaborations.length === 0 ? (
          <Card className="border-dashed border-purple-200 bg-purple-50/60">
            <CardContent className="p-6 text-sm text-purple-700">
              No open collaborations right now. Check back soon or invite a partner school to co-create a project.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {openCollaborations.map((project) => {
              const summary = programSummaries.find((program) => program.program.id === project.programId)
              const template = summary?.templates.find((entry) => entry.id === project.templateId)
              return (
                <Card key={project.id} className="flex h-full flex-col border-purple-100">
                  {template?.heroImageUrl && (
                    <div
                      className="h-36 w-full rounded-t-lg bg-cover bg-center"
                      style={{ backgroundImage: `url(${template.heroImageUrl})` }}
                    />
                  )}
                  <CardContent className="flex flex-1 flex-col space-y-3 p-5">
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-xs text-purple-600">
                        {summary?.program.displayTitle ?? 'Program project'}
                      </Badge>
                      <h3 className="text-base font-semibold text-gray-900">
                        {template?.title ?? project.projectId.replaceAll('-', ' ')}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {template?.summary ??
                          'Classroom collaboration inviting new partner schools. Review the outline and request to join.'}
                      </p>
                    </div>
                    <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-purple-500" />
                        {summary?.metrics.teacherCount ?? 0} teachers in program
                      </span>
                      <Button size="sm" variant="outline">
                        Request to join
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-purple-600" />
              Students in your network
            </CardTitle>
            <CardDescription>
              This sums the student population for the schools connected to your programs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-semibold text-gray-900">{studentsReached.toLocaleString()}</div>
            <p className="text-sm text-gray-600">
              Track impact as you invite additional classes or launch program-specific activities.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-purple-600" />
              Saved resources
            </CardTitle>
            <CardDescription>
              Templates and guides from your partner programs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-dashed border-purple-200 bg-purple-50/60 p-4 text-sm text-purple-700">
              Access program resources from the Overview tab of each program. They appear here once you mark them as favourites.
            </div>
            <Button variant="outline" size="sm">
              Browse resources
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

interface QuickActionCardProps {
  icon: React.ReactNode
  title: string
  description: string
  actionLabel: string
  href: string
}

function QuickActionCard({ icon, title, description, actionLabel, href }: QuickActionCardProps) {
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardContent className="space-y-4 p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
          {icon}
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <Button variant="ghost" className="px-0 text-sm text-purple-600 hover:text-purple-700" asChild>
          <Link href={href}>
            {actionLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function Metric({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="space-y-1 rounded-lg border border-purple-100 bg-purple-50/40 p-3 text-center">
      <div className="flex items-center justify-center gap-1 text-purple-600">{icon}</div>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    </div>
  )
}
