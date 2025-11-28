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

export default function ParentAnalyticsPage() {
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

  const filteredProgramSummaries = useMemo(() => {
    const allowedHosts = new Set(['partner-unicef', 'partner-unicef-england'])
    return programSummaries.filter((summary) => allowedHosts.has(summary.program.partnerId))
  }, [programSummaries])

  const programMetrics = useMemo(() => {
    if (filteredProgramSummaries.length === 0) {
      return {
        totalPrograms: 2,
        activePrograms: 2,
        coPartners: 2,
        coordinators: 4,
        institutions: 4,
        teachers: 8,
        students: 5200,
        projects: 6,
        activeProjects: 4,
        completedProjects: 2,
        templates: 3,
        pendingInvitations: 0,
        countryCount: 2,
      }
    }
    return aggregateProgramMetrics(filteredProgramSummaries)
  }, [filteredProgramSummaries])

  const countryImpact = useMemo(() => {
    if (filteredProgramSummaries.length === 0) {
      return [
        {
          country: 'DK',
          countryLabel: 'Denmark',
          flag: '🇩🇰',
          institutions: 2,
          teachers: 4,
          students: 2400,
          projects: 3,
          completedProjects: 1,
          regions: ['Capital Region', 'Jutland'],
        },
        {
          country: 'UK',
          countryLabel: 'United Kingdom',
          flag: '🇬🇧',
          institutions: 2,
          teachers: 4,
          students: 2800,
          projects: 3,
          completedProjects: 1,
          regions: ['London', 'Manchester'],
        },
      ]
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
    const allowedCountries = new Set(['DK', 'UK'])

    for (const summary of filteredProgramSummaries) {
      summary.institutions.forEach((institution) => {
        if (!institution.country || !allowedCountries.has(institution.country)) {
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
        if (institution?.country && allowedCountries.has(institution.country)) {
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
        if (institution?.country && allowedCountries.has(institution.country)) {
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
  }, [filteredProgramSummaries, database])

  const topCountry = countryImpact[0] ?? null
  const activeCountryNames = countryImpact.map((entry) => entry.countryLabel)
  const totalRegionsCovered = countryImpact.reduce(
    (sum, entry) => sum + entry.regions.length,
    0,
  )

  const activityTimeline = useMemo(() => {
    if (filteredProgramSummaries.length === 0) {
      return [
        { label: 'Jan 2025', projects: 2, completed: 0, timestamp: new Date(2025, 0, 1).valueOf() },
        { label: 'Feb 2025', projects: 3, completed: 1, timestamp: new Date(2025, 1, 1).valueOf() },
        { label: 'Mar 2025', projects: 4, completed: 2, timestamp: new Date(2025, 2, 1).valueOf() },
        { label: 'Apr 2025', projects: 5, completed: 2, timestamp: new Date(2025, 3, 1).valueOf() },
      ]
    }

    const buckets = new Map<
      number,
      {
        label: string
        projects: number
        completed: number
      }
    >()

    filteredProgramSummaries.forEach((summary) => {
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
  }, [filteredProgramSummaries])

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

  const topPrograms = filteredProgramSummaries.length
    ? filteredProgramSummaries.slice(0, 4).map(({ program, metrics }) => ({
        id: program.id,
        title: program.displayTitle ?? program.name,
        students: metrics.studentCount,
        institutions: metrics.institutionCount,
        activeProjects: metrics.activeProjectCount,
      }))
    : [
        {
          id: 'program-communities-2025',
          title: 'UNICEF Denmark: Communities in Focus',
          students: 2400,
          institutions: 6,
          activeProjects: 3,
        },
        {
          id: 'program-uk-climate-2025',
          title: 'UNICEF UK: Climate Action',
          students: 2800,
          institutions: 6,
          activeProjects: 4,
        },
      ]

  const maxProgramStudents =
    topPrograms.reduce((max, summary) => Math.max(max, summary.students), 0) || 1

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
      value: filteredProgramSummaries.length.toString(),
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

  const markerPositions: Record<string, { x: string; y: string }> = {
    Denmark: { x: '65%', y: '38%' },
    'United Kingdom': { x: '46%', y: '52%' },
  }

  const mapMarkers =
    countryImpact.length > 0
      ? countryImpact.map((entry) => ({
          country: entry.countryLabel,
          flag: entry.flag,
          x: markerPositions[entry.countryLabel]?.x ?? '50%',
          y: markerPositions[entry.countryLabel]?.y ?? '50%',
        }))
      : [
          { country: 'Denmark', flag: '🇩🇰', x: markerPositions.Denmark.x, y: markerPositions.Denmark.y },
          {
            country: 'United Kingdom',
            flag: '🇬🇧',
            x: markerPositions['United Kingdom'].x,
            y: markerPositions['United Kingdom'].y,
          },
        ]

  useEffect(() => {
    loadOrganizationProfile()
  }, [])

  const loadOrganizationProfile = async () => {
    setLoading(true)
    try {
      const session = getCurrentSession()
      if (!session || session.role !== 'parent') {
        return
      }

      // For demo purposes - sample organization data
      const sampleOrg: Organization = {
        id: 'demo-org-id',
        name: 'UNICEF World Organization',
        organization_type: 'ngo',
        website: 'https://www.unicef.org',
        logo: null,
        short_description:
          'Connecting UNICEF country teams and partners to scale impact for children worldwide.',
        primary_contacts: [],
        regions_of_operation: ['Global'],
        countries_of_operation: ['Denmark', 'United Kingdom'],
        languages: ['English', 'French', 'Spanish'],
        sdg_tags: ['4', '5', '10', '13', '16', '17'],
        thematic_tags: ["Children's Rights", 'Global Citizenship', 'Healthy Communities'],
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
              <CardDescription>Visual map of where UNICEF parent programs are active.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-56 overflow-hidden rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-blue-50 shadow-sm">
              <div className="absolute inset-0 opacity-70">
                <div className="h-full w-full bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.18),transparent_35%),radial-gradient(circle_at_70%_40%,rgba(59,130,246,0.15),transparent_30%),radial-gradient(circle_at_55%_70%,rgba(34,197,94,0.12),transparent_28%)]" />
              </div>
              <div className="absolute inset-0">
                <div className="mx-auto flex h-full max-w-xl items-center justify-between px-8">
                  <div className="flex flex-col gap-3 text-xs text-gray-600">
                    {countryReachStats.map((stat) => (
                      <div key={stat.label} className="flex items-center justify-between gap-4">
                        <span className="text-gray-600">{stat.label}</span>
                        <span className="text-lg font-semibold text-gray-900">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="relative h-52 w-80 overflow-hidden rounded-xl border border-white/60 bg-white/85 p-4 shadow-sm backdrop-blur">
                    <div className="absolute inset-0 opacity-60">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/1024px-World_map_-_low_resolution.svg.png"
                        alt="World map"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_50%_30%,rgba(99,102,241,0.08),transparent_40%)]" />
                    <div className="relative h-full w-full">
                      {mapMarkers.map((marker) => (
                        <div
                          key={marker.country}
                          className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 text-[11px] font-medium text-gray-800"
                          style={{ left: marker.x, top: marker.y }}
                        >
                          <span className="h-2.5 w-2.5 rounded-full bg-purple-600 shadow-sm" />
                          <span className="rounded-full bg-white/90 px-2 py-0.5 shadow-sm">
                            {marker.flag} {marker.country}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

    </div>
  )
}
