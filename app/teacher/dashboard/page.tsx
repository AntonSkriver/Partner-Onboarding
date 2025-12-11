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
  Globe2,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useTeacherContext } from '@/hooks/use-teacher-context'



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
                <p className="text-2xl font-semibold text-gray-900">28</p>
                <p className="text-xs text-gray-600">Students</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-purple-600" />
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">2</p>
                <p className="text-xs text-gray-600">Partner programs</p>
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
