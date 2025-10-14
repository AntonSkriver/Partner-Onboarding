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
  Link as LinkIcon,
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
      {/* Header Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-gray-900">
            Hi, {session.name ?? 'Teacher'}
          </h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-purple-600" />
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">{peerConnections}</p>
                <p className="text-xs text-gray-600">Connections</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-purple-600" />
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">{teacherProjects.length}</p>
                <p className="text-xs text-gray-600">Projects</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-purple-600" />
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">{studentsReached}</p>
                <p className="text-xs text-gray-600">Students</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Your Global Learning Hub</h2>
          <p className="text-sm text-gray-600">Everything you need for global classroom success.</p>
        </div>

        {/* Grid of Cards - Original Style */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* My Connections */}
          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <LinkIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">My Connections</h3>
                <p className="text-sm text-gray-600">View and manage your global educator network.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="px-0 text-sm text-purple-600 hover:text-purple-700">
                  Learn More
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white" size="sm">
                  Connect
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* My Projects */}
          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <FolderKanban className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">My Projects</h3>
                <p className="text-sm text-gray-600">Create and manage your global collaboration projects.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="px-0 text-sm text-purple-600 hover:text-purple-700">
                  Learn More
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white" size="sm" asChild>
                  <Link href="/teacher/projects">Go to projects</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* My Students */}
          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">My Students</h3>
                <p className="text-sm text-gray-600">Invite and manage your students and classrooms.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="px-0 text-sm text-purple-600 hover:text-purple-700">
                  Learn More
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white" size="sm">
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Be Inspired */}
          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Be Inspired</h3>
                <p className="text-sm text-gray-600">Explore innovative global projects.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white" size="sm" asChild>
                  <Link href="#discover">Explore</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Join Projects */}
          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Layers className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Join projects</h3>
                <p className="text-sm text-gray-600">Explore projects you can request to join.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white" size="sm" asChild>
                  <Link href="#discover">Explore</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* View Resources */}
          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">View Resources</h3>
                <p className="text-sm text-gray-600">Explore resources you can use in your collaboration projects.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="px-0 text-sm text-purple-600 hover:text-purple-700">
                  Learn More
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white" size="sm">
                  Explore
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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

      <section id="discover" className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Discover</h2>
            <p className="text-sm text-gray-600">
              Explore projects, programs, and resources from educators around the world.
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/discover">
              View all
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
            {openCollaborations.slice(0, 3).map((project) => {
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

    </div>
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
