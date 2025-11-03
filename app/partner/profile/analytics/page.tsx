'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Target,
  Users,
  GraduationCap,
  School,
  Globe,
  BarChart3,
  Building2,
  Map as MapIcon,
  MapPin,
  Activity,
} from 'lucide-react'
import { getCurrentSession } from '@/lib/auth/session'
import { Database } from '@/lib/types/database'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import {
  buildProgramSummariesForPartner,
  aggregateProgramMetrics,
  type ProgramSummary,
} from '@/lib/programs/selectors'
import { getCountryDisplay } from '@/lib/countries'

type Organization = Database['public']['Tables']['organizations']['Row']

export default function PartnerAnalyticsPage() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const { ready: prototypeReady, database } = usePrototypeDb()

  const normalizedOrganizationName = organization?.name
    ? organization.name.trim().toLowerCase()
    : null

  const partnerRecord = useMemo(() => {
    if (!database) return null
    if (normalizedOrganizationName) {
      const match = database.partners.find(
        (partner) => partner.organizationName.toLowerCase() === normalizedOrganizationName,
      )
      if (match) return match
    }
    return database.partners.length > 0 ? database.partners[0] : null
  }, [database, normalizedOrganizationName])

  const programSummaries = useMemo<ProgramSummary[]>(() => {
    if (!prototypeReady || !database || !partnerRecord) {
      return []
    }
    return buildProgramSummariesForPartner(database, partnerRecord.id, {
      includeRelatedPrograms: true,
    })
  }, [prototypeReady, database, partnerRecord])

  const programMetrics = useMemo(
    () => aggregateProgramMetrics(programSummaries),
    [programSummaries],
  )

  const countryImpact = useMemo(() => {
    if (programSummaries.length === 0) {
      return []
    }

    type MutableEntry = {
      country: string
      institutions: Set<string>
      teachers: Set<string>
      regions: Set<string>
      students: number
      projects: Set<string>
      completedProjects: number
    }

    const stats = new Map<string, MutableEntry>()

    const ensureEntry = (countryCode: string): MutableEntry => {
      const key = countryCode || 'Unknown'
      let entry = stats.get(key)
      if (!entry) {
        entry = {
          country: key,
          institutions: new Set<string>(),
          teachers: new Set<string>(),
          regions: new Set<string>(),
          students: 0,
          projects: new Set<string>(),
          completedProjects: 0,
        }
        stats.set(key, entry)
      }
      return entry
    }

    const institutionById = new Map(
      (database?.institutions ?? []).map((institution) => [institution.id, institution]),
    )
    const teacherById = new Map(
      (database?.institutionTeachers ?? []).map((teacher) => [teacher.id, teacher]),
    )

    for (const summary of programSummaries) {
      summary.institutions.forEach((institution) => {
        if (!institution.country) {
          return
        }
        const entry = ensureEntry(institution.country)
        entry.institutions.add(institution.id)
        entry.students += institution.studentCount ?? 0
        if (institution.region) {
          entry.regions.add(institution.region)
        }
      })

      summary.teachers.forEach((teacher) => {
        const institution =
          summary.institutions.find((inst) => inst.id === teacher.institutionId) ??
          institutionById.get(teacher.institutionId)
        if (institution?.country) {
          const entry = ensureEntry(institution.country)
          entry.teachers.add(teacher.id)
        }
      })

      summary.projects.forEach((project) => {
        const teacher =
          summary.teachers.find((entry) => entry.id === project.createdById) ??
          teacherById.get(project.createdById)
        if (!teacher) {
          return
        }

        const institution =
          summary.institutions.find((inst) => inst.id === teacher.institutionId) ??
          institutionById.get(teacher.institutionId)
        if (institution?.country) {
          const entry = ensureEntry(institution.country)
          entry.projects.add(project.id)
          if (project.status === 'completed') {
            entry.completedProjects += 1
          }
        }
      })
    }

    return Array.from(stats.values())
      .map((entry) => {
        const { flag, name } = getCountryDisplay(entry.country)
        return {
          country: entry.country,
          countryLabel: name,
          flag,
          institutions: entry.institutions.size,
          teachers: entry.teachers.size,
          students: entry.students,
          projects: entry.projects.size,
          completedProjects: entry.completedProjects,
          regions: Array.from(entry.regions).sort((a, b) => a.localeCompare(b)),
        }
      })
      .sort((a, b) => {
        if (b.students !== a.students) {
          return b.students - a.students
        }
        return b.projects - a.projects
      })
  }, [programSummaries, database])

  const topCountry = countryImpact[0] ?? null
  const activeCountryNames = countryImpact.map((entry) => entry.countryLabel)
  const totalRegionsCovered = countryImpact.reduce(
    (sum, entry) => sum + entry.regions.length,
    0,
  )

  const activityTimeline = useMemo(() => {
    if (programSummaries.length === 0) {
      return []
    }

    const buckets = new Map<
      number,
      {
        label: string
        projects: number
        completed: number
      }
    >()

    programSummaries.forEach((summary) => {
      summary.projects.forEach((project) => {
        const date = new Date(project.createdAt)
        if (Number.isNaN(date.valueOf())) {
          return
        }
        const bucketKey = new Date(date.getFullYear(), date.getMonth(), 1).valueOf()
        const bucket =
          buckets.get(bucketKey) ??
          {
            label: new Intl.DateTimeFormat(undefined, {
              month: 'short',
              year: 'numeric',
            }).format(new Date(date.getFullYear(), date.getMonth(), 1)),
            projects: 0,
            completed: 0,
          }
        bucket.projects += 1
        if (project.status === 'completed') {
          bucket.completed += 1
        }
        buckets.set(bucketKey, bucket)
      })
    })

    return Array.from(buckets.entries())
      .map(([timestamp, details]) => ({ ...details, timestamp }))
      .sort((a, b) => a.timestamp - b.timestamp)
  }, [programSummaries])

  const totalProjects = programMetrics.activeProjects + programMetrics.completedProjects
  const completionRate =
    totalProjects > 0
      ? Math.round((programMetrics.completedProjects / totalProjects) * 100)
      : 0

  const headlineMetrics = [
    {
      label: 'Students reached',
      value: programMetrics.students.toLocaleString(),
      caption: 'Learners participating in partner programs',
      icon: GraduationCap,
      bubbleClassName: 'bg-purple-100 text-purple-700',
    },
    {
      label: 'Schools & institutions',
      value: programMetrics.institutions.toString(),
      caption: 'Active learning sites onboarded',
      icon: School,
      bubbleClassName: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Active projects',
      value: programMetrics.activeProjects.toString(),
      caption: 'Currently collaborating across regions',
      icon: Target,
      bubbleClassName: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Educators engaged',
      value: programMetrics.teachers.toString(),
      caption: 'Teachers collaborating with peers',
      icon: Users,
      bubbleClassName: 'bg-amber-100 text-amber-700',
    },
  ] as const

  const topPrograms = programSummaries.slice(0, 4)
  const maxProgramStudents =
    topPrograms.reduce((max, summary) => Math.max(max, summary.metrics.studentCount), 0) || 1

  const countryReachStats = [
    {
      label: 'Countries active',
      value: programMetrics.countryCount.toString(),
    },
    {
      label: 'Institutions onboarded',
      value: programMetrics.institutions.toString(),
    },
    {
      label: 'Programs live',
      value: programSummaries.length.toString(),
    },
  ]

  const maxCountryStudents =
    countryImpact.reduce((max, entry) => Math.max(max, entry.students), 0) || 1

  const timelineEntries = activityTimeline.slice(-6)
  const maxTimelineProjects =
    timelineEntries.reduce((max, entry) => Math.max(max, entry.projects), 0) || 1

  const completionBarWidth =
    totalProjects > 0
      ? Math.min(100, Math.max(0, Math.round((programMetrics.completedProjects / totalProjects) * 100)))
      : 0

  useEffect(() => {
    loadOrganizationProfile()
  }, [])

  const loadOrganizationProfile = async () => {
    setLoading(true)
    try {
      const session = getCurrentSession()
      if (!session || session.role !== 'partner') {
        return
      }

      // For demo purposes - sample organization data
      const sampleOrg: Organization = {
        id: 'demo-org-id',
        name: 'UNICEF Denmark',
        organization_type: 'ngo',
        website: 'https://unicef.dk',
        logo: null,
        short_description:
          'Connecting classrooms worldwide through collaborative learning experiences aligned with UN Sustainable Development Goals',
        primary_contacts: [],
        regions_of_operation: ['Europe', 'Africa', 'Asia-Pacific'],
        countries_of_operation: ['Denmark', 'Mexico', 'Italy', 'Germany', 'Brazil', 'Finland'],
        languages: ['Danish', 'English', 'Spanish', 'Italian'],
        sdg_tags: ['4', '10', '16', '17'],
        thematic_tags: [
          "Children's Rights",
          'Global Citizenship',
          'Cultural Exchange',
          'Human Rights Education',
        ],
        verification_status: 'verified',
        brand_settings: null,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-03-10T15:30:00Z',
        is_active: true,
      }

      setOrganization(sampleOrg)
    } catch (err) {
      console.error('Error loading organization profile:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!organization) {
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <Building2 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h2 className="mb-2 text-lg font-semibold text-gray-900">No Organization Profile</h2>
          <p className="text-gray-600">Please create an organization profile to get started.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">Impact & analytics</h1>
        <p className="text-sm text-gray-600">
          Understand how your programs engage educators and learners across regions.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {headlineMetrics.map(({ label, value, caption, icon: Icon, bubbleClassName }) => (
          <Card key={label} className="shadow-sm">
            <CardContent className="flex flex-col gap-3 p-5">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${bubbleClassName}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
                <p className="mt-1 text-xs text-gray-500">{caption}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          {topCountry ? (
            <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <MapPin className="h-5 w-5" />
                  Impact spotlight
                </CardTitle>
                <CardDescription>
                  Leading countries by student reach and classroom activity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">Top contributor</p>
                    <p className="mt-1 text-2xl font-semibold text-blue-900">
                      <span className="mr-2">{topCountry.flag}</span>
                      {topCountry.countryLabel}
                    </p>
                    <p className="mt-2 text-xs text-gray-600">
                      {topCountry.students.toLocaleString()} students • {topCountry.institutions}{' '}
                      institutions • {topCountry.projects} projects
                    </p>
                    {topCountry.regions.length > 0 && (
                      <p className="mt-1 text-xs text-gray-500">
                        Regional hubs: {topCountry.regions.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-xs font-medium uppercase text-gray-500">Next in line</p>
                    {countryImpact.slice(1, 4).length > 0 ? (
                      countryImpact.slice(1, 4).map((country) => (
                        <div
                          key={country.country}
                          className="flex items-center justify-between rounded-md border border-blue-100 bg-white/70 px-3 py-2 text-sm text-gray-700 shadow-sm"
                        >
                          <span>
                            <span className="mr-2">{country.flag}</span>
                            {country.countryLabel}
                          </span>
                          <span className="text-xs text-gray-500">
                            {country.students.toLocaleString()} students
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">
                        Invite more institutions to grow your impact footprint.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-blue-100 bg-blue-50/60">
              <CardContent className="p-6 text-sm text-blue-900">
                Connect your first program to start tracking country-level impact.
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Program engagement
              </CardTitle>
              <CardDescription>Top programs ranked by student participation.</CardDescription>
            </CardHeader>
            <CardContent>
              {topPrograms.length > 0 ? (
                <div className="space-y-4">
                  {topPrograms.map(({ program, metrics }) => {
                    const percent = Math.round((metrics.studentCount / maxProgramStudents) * 100)
                    return (
                      <div key={program.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-900">
                            {program.displayTitle ?? program.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {metrics.studentCount} students
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100">
                          <div
                            className="h-1.5 rounded-full bg-purple-500"
                            style={{ width: `${Math.min(100, percent)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{metrics.institutionCount} institutions</span>
                          <span>{metrics.activeProjectCount} active projects</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Program insights will appear once classrooms start their first projects.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-600" />
                Global reach summary
              </CardTitle>
              <CardDescription>
                A snapshot of where Save the Children programs are active.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {countryReachStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2 text-sm text-gray-700"
                  >
                    <span>{stat.label}</span>
                    <span className="font-semibold text-gray-900">{stat.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project health</CardTitle>
              <CardDescription>Progress across all initiatives.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-700">
                <span>Active projects</span>
                <span className="font-semibold text-gray-900">{programMetrics.activeProjects}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-700">
                <span>Completed projects</span>
                <span className="font-semibold text-gray-900">
                  {programMetrics.completedProjects}
                </span>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Completion rate</span>
                  <span className="font-medium text-gray-900">
                    {totalProjects > 0 ? `${completionRate}%` : '—'}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: `${completionBarWidth}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[3fr,2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Country impact breakdown</CardTitle>
            <CardDescription>
              Institutions, educators, and students engaged per country.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {countryImpact.length > 0 ? (
              <div className="space-y-4">
                {countryImpact.map((entry) => {
                  const percent = entry.students
                    ? Math.min(
                        100,
                        Math.max(6, Math.round((entry.students / maxCountryStudents) * 100)),
                      )
                    : 0
                  return (
                    <div
                      key={entry.country}
                      className="space-y-2 rounded-lg border border-gray-100 p-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-gray-900">
                          <span className="mr-2 text-base">{entry.flag}</span>
                          {entry.countryLabel}
                        </div>
                        <div className="text-xs text-gray-500">
                          {entry.students.toLocaleString()} students
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100">
                        <div
                          className="h-1.5 rounded-full bg-purple-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span>{entry.institutions} institutions</span>
                        <span>{entry.teachers} teachers</span>
                        <span>{entry.projects} projects</span>
                        {entry.completedProjects > 0 && (
                          <span>{entry.completedProjects} completed</span>
                        )}
                        {entry.regions.length > 0 && (
                          <span>Regions: {entry.regions.join(', ')}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Country-level insights will appear once your programs onboard participating schools.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapIcon className="h-5 w-5 text-purple-600" />
              Geographic reach
            </CardTitle>
            <CardDescription>
              A map view will visualise school locations and regional coverage in an upcoming
              release.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-purple-200 bg-purple-50/40 text-center text-sm text-purple-700">
              <MapPin className="mb-3 h-6 w-6" />
              <p className="font-medium">
                {activeCountryNames.length > 0
                  ? `${activeCountryNames.length} countries active`
                  : 'No countries connected yet'}
              </p>
              {activeCountryNames.length > 0 ? (
                <p className="mt-1 text-xs text-purple-600">
                  {activeCountryNames.slice(0, 5).join(', ')}
                  {activeCountryNames.length > 5 ? '…' : ''}
                </p>
              ) : (
                <p className="mt-1 text-xs text-purple-600">
                  Add programs to begin mapping your impact footprint.
                </p>
              )}
              {activeCountryNames.length > 0 && (
                <p className="mt-3 text-xs text-purple-600">
                  {totalRegionsCovered} regional hubs reported
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Project timeline
          </CardTitle>
          <CardDescription>Launch velocity across the past six months.</CardDescription>
        </CardHeader>
        <CardContent>
          {timelineEntries.length > 0 ? (
            <div className="space-y-3">
              {timelineEntries
                .slice()
                .reverse()
                .map((entry) => {
                  const percent = entry.projects
                    ? Math.min(
                        100,
                        Math.max(8, Math.round((entry.projects / maxTimelineProjects) * 100)),
                      )
                    : 0
                  return (
                    <div
                      key={entry.timestamp}
                      className="space-y-2 rounded-md border border-gray-100 p-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900">{entry.label}</span>
                        <span className="text-xs text-gray-500">
                          +{entry.projects} project{entry.projects === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100">
                        <div
                          className="h-2 rounded-full bg-indigo-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{entry.completed} completed</span>
                        <span>{entry.projects - entry.completed} in progress</span>
                      </div>
                    </div>
                  )
                })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Timeline insights will appear once your programs start rolling out.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
