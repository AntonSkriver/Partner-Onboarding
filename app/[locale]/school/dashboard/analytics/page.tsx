'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  GraduationCap,
  Users,
  BookOpen,
  Globe,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { getCurrentSession, isOnboardedUser } from '@/lib/auth/session'
import { buildProgramSummary, type ProgramSummary } from '@/lib/programs/selectors'
import { getCountryDisplay } from '@/lib/countries'

type Institution = ProgramSummary['institutions'][number] & {
  sdgFocus?: string[]
  childRightsFocus?: string[]
}

export default function SchoolAnalyticsPage() {
  const t = useTranslations('profile.analytics')
  const tc = useTranslations('common')
  const { ready: prototypeReady, database } = usePrototypeDb()
  const [session] = useState(getCurrentSession())
  const [institution, setInstitution] = useState<Institution | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)

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

    // Fresh onboarded users have no seed institution — show empty analytics
    if (isOnboardedUser(session)) {
      setInstitution(null)
      setLoading(false)
      return
    }

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

  const teacherPrograms = useMemo(() => {
    const map = new Map<string, Set<string>>()
    programSummaries.forEach((summary) => {
      const programName = summary.program.displayTitle || summary.program.name
      summary.teachers.forEach((teacher) => {
        if (teacher.institutionId !== institution?.id) return
        const key = teacher.id
        if (!map.has(key)) {
          map.set(key, new Set())
        }
        map.get(key)!.add(programName)
      })
    })
    return map
  }, [programSummaries, institution?.id])

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
    if (!institution) return []
    const countryCodes = new Set<string>()
    const homeCountry = institution.country ?? null

    programSummaries.forEach((summary) => {
      const teacherIds = summary.teachers
        .filter((teacher) => teacher.institutionId === institution.id)
        .map((t) => t.id)
      if (teacherIds.length === 0) return

      summary.projects.forEach((project) => {
        if (!teacherIds.includes(project.createdById)) return
        summary.institutions.forEach((inst) => {
          if (inst.id === institution.id) return
          if (!inst.country) return
          if (homeCountry && inst.country === homeCountry) return
          countryCodes.add(inst.country)
        })
      })
    })

    return Array.from(countryCodes)
      .map((code) => getCountryDisplay(code))
      .filter((c) => c.name)
  }, [programSummaries, institution])

  const studentsReached = institution?.studentCount ?? 0
  const educatorCount = schoolTeachers.length
  const programCount = programSummaries.length
  const projectCount = schoolProjects.length
  const reachCount = countryConnections.length

  const headlineMetrics = [
    {
      id: 'students',
      label: t('studentsReached'),
      value: studentsReached.toLocaleString(),
      caption: `${programCount || 0} program${programCount === 1 ? '' : 's'}`,
      icon: GraduationCap,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
    {
      id: 'educators',
      label: t('educatorsEngaged'),
      value: educatorCount.toString(),
      caption: `${teacherPrograms.size || 0} teacher${educatorCount === 1 ? '' : 's'}`,
      icon: Users,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      id: 'programs',
      label: t('programsMetric'),
      value: programCount.toString(),
      caption: 'Active for this school',
      icon: BookOpen,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
    },
    {
      id: 'projects',
      label: t('activeProjects'),
      value: projectCount.toString(),
      caption: 'Started by your teachers',
      icon: CheckCircle2,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
    },
    {
      id: 'reach',
      label: t('schoolConnections'),
      value: reachCount.toString(),
      caption: t('countriesConnected'),
      icon: Globe,
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
    },
  ]

  const selectedMetricData = headlineMetrics.find((metric) => metric.id === selectedMetric)

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
          <p className="text-lg font-semibold text-gray-900">{t('noAnalyticsTitle')}</p>
          <p className="text-gray-600">{t('noAnalyticsDesc')}</p>
        </CardContent>
      </Card>
    )
  }

  const renderMetricDetail = () => {
    switch (selectedMetric) {
      case 'students':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <StatPill label="Students" value={studentsReached.toLocaleString()} />
              <StatPill label="Educators" value={educatorCount.toString()} />
              <StatPill label="Programs" value={programCount.toString()} />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900">By program</h4>
              {programSummaries.map((summary) => (
                <div key={summary.program.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                  <div>
                    <p className="font-medium text-gray-900">{summary.program.displayTitle || summary.program.name}</p>
                    <p className="text-xs text-gray-500">{summary.metrics.institutionCount} institutions</p>
                  </div>
                  <p className="text-sm font-semibold text-purple-700">
                    {summary.metrics.studentCount.toLocaleString()} students
                  </p>
                </div>
              ))}
            </div>
          </div>
        )
      case 'educators':
        return (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Teachers</h4>
            {schoolTeachers.length === 0 ? (
              <p className="text-sm text-gray-600">No educators yet.</p>
            ) : (
              <div className="space-y-2">
                {schoolTeachers.map((teacher) => {
                  const fullName = `${teacher.firstName} ${teacher.lastName}`.trim() || 'Educator'
                  const programs = Array.from(teacherPrograms.get(teacher.id) ?? [])
                  return (
                    <div key={teacher.id} className="flex items-start justify-between rounded-lg border border-gray-100 p-3">
                      <div>
                        <p className="font-medium text-gray-900">{fullName}</p>
                        <p className="text-xs text-gray-500">{teacher.subject || 'General'}</p>
                        {programs.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {programs.map((p) => (
                              <Badge key={p} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                                {p}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{teacher.status}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      case 'programs':
        return (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Programs</h4>
            {programSummaries.length === 0 ? (
              <p className="text-sm text-gray-600">No programs yet.</p>
            ) : (
              <div className="space-y-2">
                {programSummaries.map((summary) => (
                  <div key={summary.program.id} className="rounded-lg border border-gray-100 p-3">
                    <p className="font-medium text-gray-900">
                      {summary.program.displayTitle || summary.program.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {summary.metrics.studentCount.toLocaleString()} students · {summary.metrics.institutionCount} institutions
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      case 'projects':
        return (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Projects</h4>
            {schoolProjects.length === 0 ? (
              <p className="text-sm text-gray-600">No projects yet.</p>
            ) : (
              <div className="space-y-2">
                {schoolProjects.map(({ project, programName }) => (
                  <div key={project.id} className="rounded-lg border border-gray-100 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{project.title || 'Program project'}</p>
                        <p className="text-xs text-gray-500">{programName}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {project.status === 'completed' ? 'Completed' : 'Active'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      case 'reach':
        return (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">{t('schoolConnections')}</h4>
            {reachCount === 0 ? (
              <p className="text-sm text-gray-600">
                No country connections yet. Collaborate with schools abroad to add one.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {countryConnections.map((country) => (
                  <div key={country.name} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{country.flag}</span>
                      <p className="font-medium text-gray-900">{country.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">{t('title')}</h1>
        <p className="text-sm text-gray-600">
          Students, educators, and projects connected through your programs.{' '}
          <span className="font-medium text-purple-600">Click any metric for details.</span>
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {headlineMetrics.map(({ id, label, value, caption, icon: Icon, bgColor, textColor }) => (
          <motion.div key={id} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
            <Card
              className="group cursor-pointer border-gray-100 transition-all hover:border-gray-200 hover:shadow-lg"
              onClick={() => setSelectedMetric(id)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgColor}`}>
                    <Icon className={`h-6 w-6 ${textColor}`} />
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-300 transition-colors group-hover:text-gray-400" />
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-gray-900">{value}</p>
                  <p className="mt-1 text-sm font-medium text-gray-700">{label}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{caption}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-600" />
            {t('activePrograms')}
          </CardTitle>
          <CardDescription>{t('programsMetricDesc')}</CardDescription>
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
                      {tc('active')}
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
            {t('schoolConnections')}
          </CardTitle>
          <CardDescription>{t('countriesConnected')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {countryConnections.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-600 sm:col-span-2 md:col-span-3">
              Start a project with schools abroad to add country connections.
            </div>
          ) : (
            countryConnections.map((country) => (
              <div key={country.name} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{country.flag}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{country.name}</p>
                    <p className="text-xs text-gray-500">Connected via projects</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedMetric} onOpenChange={(open) => !open && setSelectedMetric(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              {selectedMetricData && (
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${selectedMetricData.bgColor}`}>
                  <selectedMetricData.icon className={`h-6 w-6 ${selectedMetricData.textColor}`} />
                </div>
              )}
              <div>
                <DialogTitle className="text-lg font-semibold">
                  {selectedMetricData?.label}
                </DialogTitle>
                <DialogDescription>
                  {selectedMetricData?.caption}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="mt-2">{renderMetricDetail()}</div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-center">
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}
