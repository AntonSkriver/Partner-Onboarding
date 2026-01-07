'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  GraduationCap,
  Users,
  BookOpen,
  Globe,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { getCurrentSession } from '@/lib/auth/session'
import { buildProgramSummary, type ProgramSummary } from '@/lib/programs/selectors'
import { getCountryDisplay } from '@/lib/countries'

type Institution = ProgramSummary['institutions'][number] & {
  sdgFocus?: string[]
  childRightsFocus?: string[]
}

export default function SchoolAnalyticsPage() {
  const { ready: prototypeReady, database } = usePrototypeDb()
  const [session] = useState(getCurrentSession())
  const [institution, setInstitution] = useState<Institution | null>(null)
  const [loading, setLoading] = useState(true)

  const activeProgramIds = useMemo(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = window.localStorage.getItem('activeProgramIds')
      return raw ? (JSON.parse(raw) as string[]) : []
    } catch {
      return []
    }
  }, [])

  useEffect(() => {
    if (!prototypeReady || !database) return

    const activeInstitutionId =
      typeof window !== 'undefined' ? window.localStorage.getItem('activeInstitutionId') : null
    const normalizedEmail = session?.email?.toLowerCase()
    const normalizedName = session?.organization?.trim().toLowerCase()

    const matchesCurrentSchool = (inst: Institution) => {
      if (activeInstitutionId && inst.id === activeInstitutionId) return true
      const name = inst.name?.trim().toLowerCase()
      const email = inst.contactEmail?.toLowerCase()
      const nameMatch = normalizedName && name === normalizedName
      const emailMatch = normalizedEmail && email === normalizedEmail
      return Boolean(nameMatch || emailMatch)
    }

    const match = database.institutions.find((inst) => matchesCurrentSchool(inst as Institution))
    setInstitution(match ? (match as Institution) : null)
    setLoading(false)
  }, [prototypeReady, database, session])

  const programsForSchool = useMemo(() => {
    if (!database || !institution) return []
    const ids = new Set<string>()
    if (institution.programId) ids.add(institution.programId)
    activeProgramIds.forEach((id) => ids.add(id))
    return database.programs.filter((program) => ids.has(program.id))
  }, [database, institution, activeProgramIds])

  const programSummaries = useMemo<ProgramSummary[]>(() => {
    if (!database || !institution) return []
    return programsForSchool.map((program) => buildProgramSummary(database, program))
  }, [database, institution, programsForSchool])

  const schoolTeachers = useMemo(() => {
    if (!institution) return []
    const teachers = programSummaries.flatMap((summary) =>
      summary.teachers.filter((teacher) => teacher.institutionId === institution.id),
    )
    const seen = new Set<string>()
    return teachers.filter((teacher) => {
      if (seen.has(teacher.id)) return false
      seen.add(teacher.id)
      return true
    })
  }, [institution, programSummaries])

  const schoolProjects = useMemo(() => {
    if (!institution) return []
    return programSummaries.flatMap((summary) => {
      return summary.projects
        .filter((project) => {
          const creator = summary.teachers.find((teacher) => teacher.id === project.createdById)
          return creator?.institutionId === institution.id
        })
        .map((project) => ({
          project,
          programName: summary.program.displayTitle || summary.program.name,
        }))
    })
  }, [institution, programSummaries])

  const countryConnections = useMemo(() => {
    const countryCodes = new Set<string>()
    programSummaries.forEach((summary) => {
      summary.program.countriesInScope.forEach((code) => countryCodes.add(code))
    })
    return Array.from(countryCodes)
      .map((code) => getCountryDisplay(code))
      .filter((c) => c.name)
  }, [programSummaries])

  const studentsReached = institution?.studentCount ?? 0
  const educatorCount = schoolTeachers.length
  const programCount = programSummaries.length
  const projectCount = schoolProjects.length

  if (loading || !prototypeReady) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!institution) {
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <p className="text-lg font-semibold text-gray-900">No school profile found</p>
          <p className="text-gray-600">Accept an invitation to view analytics.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-8 text-white">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="relative space-y-4">
          <div className="flex items-center gap-2 text-purple-100">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium">School impact overview</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold">Impact & analytics</h1>
              <p className="text-sm text-purple-100">
                Students, educators, and projects connected through your programs.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MetricCard icon={GraduationCap} label="Students reached" value={studentsReached.toLocaleString()} />
            <MetricCard icon={Users} label="Educators engaged" value={educatorCount.toString()} />
            <MetricCard icon={BookOpen} label="Programs" value={programCount.toString()} />
            <MetricCard icon={CheckCircle2} label="Projects" value={projectCount.toString()} />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-600" />
            Active programs
          </CardTitle>
          <CardDescription>Programs your school is connected to</CardDescription>
        </CardHeader>
        <CardContent>
          {programSummaries.length === 0 ? (
            <div className="rounded-lg border border-dashed border-purple-200 bg-purple-50 p-6 text-center text-sm text-gray-700">
              No programs yet. Join a program to start collaborating.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {programSummaries.map((summary) => (
                <div key={summary.program.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {summary.program.displayTitle || summary.program.name}
                      </p>
                      <p className="text-xs text-gray-500">{summary.program.countriesInScope.join(' • ')}</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Active
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-700">
                    <span>{summary.metrics.studentCount.toLocaleString()} students</span>
                    <span>•</span>
                    <span>{summary.metrics.institutionCount} institutions</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-purple-600" />
            Projects from your school
          </CardTitle>
          <CardDescription>Only projects started by your teachers</CardDescription>
        </CardHeader>
        <CardContent>
          {schoolProjects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
              No projects yet. Invite teachers to start projects in your programs.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {schoolProjects.map(({ project, programName }) => (
                <div key={project.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{project.title || 'Program Project'}</p>
                      <p className="text-sm text-gray-500">{programName}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {project.status === 'completed' ? 'Completed' : 'Active'}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>Created by your school</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Educators
          </CardTitle>
          <CardDescription>Teachers connected to your school workspace</CardDescription>
        </CardHeader>
        <CardContent>
          {schoolTeachers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
              Add teachers to see educator analytics here.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {schoolTeachers.map((teacher) => {
                const fullName = `${teacher.firstName} ${teacher.lastName}`.trim()
                return (
                  <div key={teacher.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-700">
                        {fullName ? fullName.slice(0, 2).toUpperCase() : 'ED'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{fullName || 'Educator'}</p>
                        <p className="text-xs text-gray-500">{teacher.subject || 'General'}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-purple-600" />
            Country connections
          </CardTitle>
          <CardDescription>Where your programs operate</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {countryConnections.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-600 sm:col-span-2 md:col-span-3">
              Join programs to start connecting with partner countries.
            </div>
          ) : (
            countryConnections.map((country) => (
              <div key={country.name} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{country.flag}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{country.name}</p>
                    <p className="text-xs text-gray-500">In your program scope</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof GraduationCap
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
      <div className="flex items-center gap-2 text-purple-100">
        <Icon className="h-5 w-5" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
    </div>
  )
}
