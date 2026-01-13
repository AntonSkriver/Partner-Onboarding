'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Target,
  Users,
  GraduationCap,
  School,
  Building2,
  Map as MapIcon,
  BookOpen,
  ChevronRight,
} from 'lucide-react'
import { getCurrentSession } from '@/lib/auth/session'
import { Database } from '@/lib/types/database'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import {
  buildProgramSummary,
  aggregateProgramMetrics,
  type ProgramSummary,
} from '@/lib/programs/selectors'
import { getCountryDisplay } from '@/lib/countries'

type Organization = Database['public']['Tables']['organizations']['Row']

// Detailed breakdown data for interactive cards
interface SchoolDetail {
  name: string
  country: string
  flag: string
  students: number
  teachers: number
  city?: string
  schoolType?: 'primary' | 'secondary' | 'higher-ed'
  status?: 'active' | 'partial' | 'onboarding'
  projectCount?: number
}

interface ProjectDetail {
  name: string
  studentsReached: number
  educatorsEngaged: number
  status: 'active' | 'completed'
  partnerSchool?: string
  country?: string
  flag?: string
  ageGroupBreakdown?: { ageGroup: string; students: number }[]
}

export default function ParentAnalyticsPage() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const { ready: prototypeReady, database } = usePrototypeDb()

  const allowedPartnerIds = useMemo(
    () => new Set(['partner-unicef', 'partner-unicef-england']),
    [],
  )

  const programSummaries = useMemo<ProgramSummary[]>(() => {
    if (!prototypeReady || !database) {
      return []
    }
    return database.programs
      .filter((program) => allowedPartnerIds.has(program.partnerId))
      .map((program) => buildProgramSummary(database, program))
  }, [prototypeReady, database, allowedPartnerIds])

  const programMetrics = useMemo(() => {
    if (programSummaries.length === 0) {
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
    return aggregateProgramMetrics(programSummaries)
  }, [programSummaries])

  // Build detailed school data
  const schoolDetails = useMemo<SchoolDetail[]>(() => {
    if (programSummaries.length === 0) {
      return [
        { name: 'Ørestad Gymnasium', country: 'Denmark', flag: '🇩🇰', students: 850, teachers: 4, city: 'Copenhagen', schoolType: 'secondary', status: 'active', projectCount: 2 },
        { name: 'London Academy', country: 'United Kingdom', flag: '🇬🇧', students: 1200, teachers: 5, city: 'London', schoolType: 'secondary', status: 'active', projectCount: 3 },
        { name: 'Manchester International', country: 'United Kingdom', flag: '🇬🇧', students: 980, teachers: 4, city: 'Manchester', schoolType: 'secondary', status: 'partial', projectCount: 1 },
        { name: 'Vesterbjerg Rettighedsskole', country: 'Denmark', flag: '🇩🇰', students: 650, teachers: 3, city: 'Aalborg', schoolType: 'primary', status: 'onboarding', projectCount: 0 },
      ]
    }

    // Use school name as key to dedupe schools that appear multiple times
    const schoolMap = new Map<string, SchoolDetail & { _ids: Set<string> }>()
    programSummaries.forEach(summary => {
      summary.institutions.forEach(inst => {
        const { flag, name: countryName } = getCountryDisplay(inst.country || '')
        const teacherCount = summary.teachers.filter(t => t.institutionId === inst.id).length
        const projectCount = summary.projects.filter(p => {
          const creator = summary.teachers.find(t => t.id === p.createdById)
          return creator?.institutionId === inst.id
        }).length

        const existing = schoolMap.get(inst.name)
        if (existing) {
          // Merge: accumulate teachers/projects, keep highest student count
          if (!existing._ids.has(inst.id)) {
            existing._ids.add(inst.id)
            existing.teachers += teacherCount
            existing.projectCount = (existing.projectCount || 0) + projectCount
            existing.students = Math.max(existing.students, inst.studentCount || 0)
          }
        } else {
          schoolMap.set(inst.name, {
            name: inst.name,
            country: countryName,
            flag,
            students: inst.studentCount || 0,
            teachers: teacherCount,
            city: inst.city,
            schoolType: 'secondary',
            status: 'onboarding',
            projectCount,
            _ids: new Set([inst.id]),
          })
        }
      })
    })

    // Calculate status based on merged data and return without internal _ids field
    return Array.from(schoolMap.values())
      .map(({ _ids, ...school }) => {
        let status: 'active' | 'partial' | 'onboarding' = 'onboarding'
        if (school.teachers > 0 && (school.projectCount || 0) > 1) {
          status = 'active'
        } else if (school.teachers > 0 || (school.projectCount || 0) > 0) {
          status = 'partial'
        }
        return { ...school, status }
      })
      .filter((entry) => entry.teachers > 0 || entry.students > 0)
      .sort((a, b) => b.students - a.students)
  }, [programSummaries])

  // Build detailed project data
  const projectDetails = useMemo<ProjectDetail[]>(() => {
    if (programSummaries.length === 0) {
      return [
        {
          name: 'Climate Action 2025',
          studentsReached: 520,
          educatorsEngaged: 4,
          status: 'active',
          partnerSchool: 'London Academy',
          country: 'United Kingdom',
          flag: '🇬🇧',
          ageGroupBreakdown: [
            { ageGroup: '12-14', students: 180 },
            { ageGroup: '14-16', students: 220 },
            { ageGroup: '16-18', students: 120 },
          ]
        },
        {
          name: 'Digital Rights',
          studentsReached: 380,
          educatorsEngaged: 3,
          status: 'active',
          partnerSchool: 'Ørestad Gymnasium',
          country: 'Denmark',
          flag: '🇩🇰',
          ageGroupBreakdown: [
            { ageGroup: '14-16', students: 150 },
            { ageGroup: '16-18', students: 230 },
          ]
        },
        {
          name: 'Community Voices',
          studentsReached: 450,
          educatorsEngaged: 4,
          status: 'active',
          partnerSchool: 'Manchester International',
          country: 'United Kingdom',
          flag: '🇬🇧',
          ageGroupBreakdown: [
            { ageGroup: '12-14', students: 200 },
            { ageGroup: '14-16', students: 250 },
          ]
        },
        {
          name: 'Youth Leadership',
          studentsReached: 290,
          educatorsEngaged: 2,
          status: 'completed',
          partnerSchool: 'Vesterbjerg Rettighedsskole',
          country: 'Denmark',
          flag: '🇩🇰',
          ageGroupBreakdown: [
            { ageGroup: '14-16', students: 120 },
            { ageGroup: '16-18', students: 170 },
          ]
        },
      ]
    }

    const projects: ProjectDetail[] = []
    programSummaries.forEach(summary => {
      summary.projects.forEach(project => {
        const creator = summary.teachers.find(t => t.id === project.createdById)
        const institution = creator
          ? summary.institutions.find(i => i.id === creator.institutionId)
          : null
        const { flag, name: countryName } = institution?.country
          ? getCountryDisplay(institution.country)
          : { flag: '', name: '' }

        const projectInstitutions = summary.institutions.filter(i =>
          summary.teachers.some(t => t.institutionId === i.id)
        )
        const studentsReached = Math.round(
          projectInstitutions.reduce((sum, i) => sum + (i.studentCount || 0), 0) /
          Math.max(summary.projects.length, 1)
        )
        const educatorsEngaged = Math.round(summary.teachers.length / Math.max(summary.projects.length, 1))

        // Generate age group breakdown based on students reached
        const ageGroupBreakdown = [
          { ageGroup: '12-14', students: Math.round(studentsReached * 0.3) },
          { ageGroup: '14-16', students: Math.round(studentsReached * 0.4) },
          { ageGroup: '16-18', students: Math.round(studentsReached * 0.3) },
        ].filter(ag => ag.students > 0)

        projects.push({
          name: project.title,
          studentsReached,
          educatorsEngaged,
          status: project.status === 'completed' ? 'completed' : 'active',
          partnerSchool: institution?.name,
          country: countryName,
          flag,
          ageGroupBreakdown,
        })
      })
    })

    return projects.sort((a, b) => b.studentsReached - a.studentsReached)
  }, [programSummaries])

  // Build educator details
  const educatorDetails = useMemo(() => {
    if (programSummaries.length === 0) {
      return [
        { name: 'Sarah Johnson', subject: 'Science', school: 'London Academy', country: 'United Kingdom', flag: '🇬🇧', projectCount: 2, ageGroup: '14-16' },
        { name: 'Anne Holm', subject: 'Social Studies', school: 'Ørestad Gymnasium', country: 'Denmark', flag: '🇩🇰', projectCount: 2, ageGroup: '16-18' },
        { name: 'James Wilson', subject: 'English', school: 'Manchester International', country: 'United Kingdom', flag: '🇬🇧', projectCount: 1, ageGroup: '12-14' },
        { name: 'Jonas Madsen', subject: 'Art & Design', school: 'Ørestad Gymnasium', country: 'Denmark', flag: '🇩🇰', projectCount: 1, ageGroup: '16-18' },
      ]
    }

    const educators: Array<{
      name: string
      subject: string
      school: string
      country: string
      flag: string
      projectCount: number
      ageGroup: string
    }> = []

    const seenTeachers = new Set<string>()
    programSummaries.forEach(summary => {
      summary.teachers.forEach(teacher => {
        if (seenTeachers.has(teacher.id)) return
        seenTeachers.add(teacher.id)

        const institution = summary.institutions.find(i => i.id === teacher.institutionId)
        const { flag, name: countryName } = institution?.country
          ? getCountryDisplay(institution.country)
          : { flag: '', name: '' }

        const projectCount = summary.projects.filter(p => p.createdById === teacher.id).length

        // Generate an age group based on subject or use a default
        const ageGroups = ['12-14', '14-16', '16-18']
        const ageGroup = ageGroups[Math.floor(Math.random() * ageGroups.length)]

        educators.push({
          name: `${teacher.firstName} ${teacher.lastName}`,
          subject: teacher.subject || 'General',
          school: institution?.name || 'Unknown',
          country: countryName,
          flag,
          projectCount,
          ageGroup,
        })
      })
    })

    return educators.sort((a, b) => b.projectCount - a.projectCount)
  }, [programSummaries])

  // Student breakdown by program
  const studentBreakdown = useMemo(() => {
    if (programSummaries.length === 0) {
      return [
        { program: 'UNICEF Denmark: Communities in Focus', students: 2400, schools: 2, countries: 1 },
        { program: 'UNICEF UK: Climate Action', students: 2800, schools: 2, countries: 1 },
      ]
    }

    return programSummaries.map(summary => {
      const students = summary.institutions.reduce((sum, i) => sum + (i.studentCount || 0), 0)
      return {
        program: summary.program.name,
        students,
        schools: summary.institutions.length,
        countries: new Set(summary.institutions.map(i => i.country).filter(Boolean)).size,
      }
    }).sort((a, b) => b.students - a.students)
  }, [programSummaries])

  const countryImpact = useMemo(() => {
    if (programSummaries.length === 0) {
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

    for (const summary of programSummaries) {
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
  }, [programSummaries, database])

  const headlineMetrics = [
    {
      id: 'students',
      label: 'Students reached',
      value: programMetrics.students.toLocaleString(),
      caption: 'Learners participating in partner programs',
      icon: GraduationCap,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
    {
      id: 'schools',
      label: 'Schools & institutions',
      value: programMetrics.institutions.toString(),
      caption: 'Active learning sites onboarded',
      icon: School,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      id: 'projects',
      label: 'Active projects',
      value: programMetrics.activeProjects.toString(),
      caption: 'Currently collaborating across regions',
      icon: Target,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
    },
    {
      id: 'educators',
      label: 'Educators engaged',
      value: programMetrics.teachers.toString(),
      caption: 'Teachers collaborating with peers',
      icon: Users,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
    },
  ] as const

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
      value: programSummaries.length > 0 ? programSummaries.length.toString() : '2',
    },
  ]

  const maxCountryStudents =
    countryImpact.reduce((max, entry) => Math.max(max, entry.students), 0) || 1

  const markerPositions: Record<string, { x: string; y: string }> = {
    Denmark: { x: '51%', y: '27%' },
    'United Kingdom': { x: '47%', y: '29%' },
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

  const selectedMetricData = headlineMetrics.find((metric) => metric.id === selectedMetric)

  const renderModalContent = () => {
    if (!selectedMetric) return null

    switch (selectedMetric) {
      case 'students': {
        const uniqueCountries = new Set<string>()
        programSummaries.forEach((summary) => {
          summary.institutions
            .filter((inst) => inst.country)
            .forEach((inst) => uniqueCountries.add(inst.country))
        })
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-purple-50 p-4 text-center">
                <p className="text-3xl font-bold text-purple-700">{programMetrics.students.toLocaleString()}</p>
                <p className="mt-1 text-sm text-purple-600">Total Students</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <p className="text-3xl font-bold text-gray-700">{studentBreakdown.length}</p>
                <p className="mt-1 text-sm text-gray-600">Programs</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <p className="text-3xl font-bold text-gray-700">{uniqueCountries.size}</p>
                <p className="mt-1 text-sm text-gray-600">Countries</p>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-900">Breakdown by Program</h4>
              <div className="space-y-3">
                {studentBreakdown.map((item, idx) => {
                  const percent = programMetrics.students
                    ? Math.round((item.students / programMetrics.students) * 100)
                    : 0
                  return (
                    <motion.div
                      key={item.program}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="rounded-xl border border-gray-100 p-4 transition-shadow hover:shadow-sm"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                            <BookOpen className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.program}</p>
                            <p className="text-sm text-gray-500">
                              {item.schools} schools · {item.countries} countries
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-600">{item.students.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">{percent}% of total</p>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100">
                        <motion.div
                          className="h-2 rounded-full bg-purple-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.1 }}
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      }
      case 'schools': {
        const totalSchoolStudents = schoolDetails.reduce((sum, s) => sum + s.students, 0)
        const uniqueCountries = new Set(schoolDetails.map(s => s.country)).size
        const activeCount = schoolDetails.filter(s => s.status === 'active').length
        const partialCount = schoolDetails.filter(s => s.status === 'partial').length
        const onboardingCount = schoolDetails.filter(s => s.status === 'onboarding').length
        const healthPercent = schoolDetails.length > 0 ? Math.round((activeCount / schoolDetails.length) * 100) : 0

        const statusConfig = {
          active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
          partial: { label: 'Partial', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
          onboarding: { label: 'Onboarding', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
        }

        const schoolTypeLabels = {
          primary: 'Primary',
          secondary: 'Secondary',
          'higher-ed': 'Higher Ed',
        }

        return (
          <div className="space-y-6">
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-blue-50 p-4 text-center">
                <p className="text-3xl font-bold text-blue-700">{programMetrics.institutions}</p>
                <p className="mt-1 text-sm text-blue-600">Schools</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <p className="text-3xl font-bold text-gray-700">{totalSchoolStudents.toLocaleString()}</p>
                <p className="mt-1 text-sm text-gray-600">Students</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <p className="text-3xl font-bold text-gray-700">{uniqueCountries}</p>
                <p className="mt-1 text-sm text-gray-600">Countries</p>
              </div>
            </div>

            {/* Engagement health overview */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Engagement Health</span>
                <span className="text-sm font-bold text-blue-600">{healthPercent}% fully active</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-gray-600">{activeCount} active</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-xs text-gray-600">{partialCount} partial</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-gray-400" />
                  <span className="text-xs text-gray-600">{onboardingCount} onboarding</span>
                </div>
              </div>
            </div>

            {/* Schools list with enhanced details */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-900">Schools by student reach</h4>
              <div className="space-y-3">
                {schoolDetails.map((school, idx) => {
                  const percent = totalSchoolStudents > 0
                    ? Math.round((school.students / totalSchoolStudents) * 100)
                    : 0
                  const ratio = school.teachers > 0 ? Math.round(school.students / school.teachers) : null
                  const statusStyle = statusConfig[school.status || 'onboarding']
                  return (
                    <motion.div
                      key={school.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="rounded-xl border border-gray-100 p-4 transition-shadow hover:shadow-sm"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                            <School className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{school.name}</p>
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle.color}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                                {statusStyle.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {school.flag} {school.city}, {school.country}
                              {school.schoolType && (
                                <span className="ml-2 text-xs text-gray-400">· {schoolTypeLabels[school.schoolType]}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{school.students.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">{percent}% · {school.teachers} educators</p>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100">
                        <motion.div
                          className="h-2 rounded-full bg-blue-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.1 }}
                        />
                      </div>

                      {/* Additional metrics row */}
                      <div className="mt-3 flex items-center gap-4 text-xs">
                        {ratio && (
                          <span className={`${ratio > 400 ? 'text-amber-600' : 'text-gray-500'}`}>
                            {ratio}:1 student/educator ratio
                          </span>
                        )}
                        {school.projectCount !== undefined && (
                          <span className="text-gray-500">
                            {school.projectCount} {school.projectCount === 1 ? 'project' : 'projects'}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      }
      case 'projects': {
        const activeProjectCount = projectDetails.filter((p) => p.status === 'active').length
        const completedProjectCount = projectDetails.filter((p) => p.status === 'completed').length
        const totalProjectStudents = projectDetails.reduce((sum, p) => sum + p.studentsReached, 0)
        return (
          <div className="space-y-6">
            {/* Summary stats - matching Students Reached style */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-emerald-50 p-4 text-center">
                <p className="text-3xl font-bold text-emerald-700">{activeProjectCount}</p>
                <p className="mt-1 text-sm text-emerald-600">Active</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <p className="text-3xl font-bold text-gray-700">{completedProjectCount}</p>
                <p className="mt-1 text-sm text-gray-600">Completed</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <p className="text-3xl font-bold text-gray-700">{totalProjectStudents.toLocaleString()}</p>
                <p className="mt-1 text-sm text-gray-600">Students</p>
              </div>
            </div>

            {/* Projects list with progress bars - matching Students Reached style */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-900">Impact by project</h4>
              <div className="space-y-3">
                {projectDetails.map((project, idx) => {
                  const percent = totalProjectStudents > 0
                    ? Math.round((project.studentsReached / totalProjectStudents) * 100)
                    : 0
                  return (
                    <motion.div
                      key={project.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="rounded-xl border border-gray-100 p-4 transition-shadow hover:shadow-sm"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            project.status === 'active' ? 'bg-emerald-100' : 'bg-gray-100'
                          }`}>
                            <Target className={`h-5 w-5 ${
                              project.status === 'active' ? 'text-emerald-600' : 'text-gray-500'
                            }`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{project.name}</p>
                              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                project.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {project.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {project.flag} {project.partnerSchool || project.country}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-emerald-600">{project.studentsReached.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">{percent}% · {project.educatorsEngaged} educators</p>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100">
                        <motion.div
                          className={`h-2 rounded-full ${
                            project.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.1 }}
                        />
                      </div>

                      {/* Age group breakdown */}
                      {project.ageGroupBreakdown && project.ageGroupBreakdown.length > 0 && (
                        <div className="mt-3 flex items-center gap-3">
                          <span className="text-xs text-gray-500">Age groups:</span>
                          <div className="flex items-center gap-2">
                            {project.ageGroupBreakdown.map((ag, agIdx) => {
                              const agPercent = project.studentsReached > 0
                                ? Math.round((ag.students / project.studentsReached) * 100)
                                : 0
                              const colors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-teal-100 text-teal-700']
                              return (
                                <span
                                  key={ag.ageGroup}
                                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[agIdx % colors.length]}`}
                                >
                                  {ag.ageGroup}: {agPercent}%
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      }
      case 'educators': {
        const uniqueSchools = new Set(educatorDetails.map(e => e.school)).size
        const uniqueCountries = new Set(educatorDetails.map(e => e.country)).size
        const totalProjects = educatorDetails.reduce((sum, e) => sum + e.projectCount, 0)

        // Group educators by school for cleaner display
        const educatorsBySchool = educatorDetails.reduce((acc, educator) => {
          if (!acc[educator.school]) {
            acc[educator.school] = { country: educator.country, flag: educator.flag, educators: [] }
          }
          acc[educator.school].educators.push(educator)
          return acc
        }, {} as Record<string, { country: string; flag: string; educators: typeof educatorDetails }>)

        return (
          <div className="space-y-6">
            {/* Summary stats - matching Students Reached style */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-amber-50 p-4 text-center">
                <p className="text-3xl font-bold text-amber-700">{educatorDetails.length}</p>
                <p className="mt-1 text-sm text-amber-600">Educators</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <p className="text-3xl font-bold text-gray-700">{uniqueSchools}</p>
                <p className="mt-1 text-sm text-gray-600">Schools</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <p className="text-3xl font-bold text-gray-700">{uniqueCountries}</p>
                <p className="mt-1 text-sm text-gray-600">Countries</p>
              </div>
            </div>

            {/* Educators grouped by school - clean list view */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-900">Educators by school</h4>
              <div className="space-y-3">
                {Object.entries(educatorsBySchool).map(([school, data], idx) => (
                  <motion.div
                    key={school}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="rounded-xl border border-gray-100 p-4 transition-shadow hover:shadow-sm"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                          <School className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{school}</p>
                          <p className="text-sm text-gray-500">{data.flag} {data.country}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-amber-600">{data.educators.length}</p>
                        <p className="text-xs text-gray-500">educators</p>
                      </div>
                    </div>

                    {/* Compact educator list with age groups */}
                    <div className="flex flex-wrap gap-2">
                      {data.educators.map((educator) => (
                        <div
                          key={educator.name}
                          className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2"
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700">
                            {educator.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700">{educator.name}</span>
                            <span className="text-xs text-gray-400">{educator.subject} · Ages {educator.ageGroup}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )
      }
      default:
        return null
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
          Understand how your programs engage educators and learners across regions.{' '}
          <span className="text-purple-600 font-medium">Click any metric for details.</span>
        </p>
      </header>

      {/* Headline Metrics - Clickable Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {headlineMetrics.map(({ id, label, value, caption, icon: Icon, bgColor, textColor }) => (
          <motion.div
            key={id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className="cursor-pointer border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all group"
              onClick={() => setSelectedMetric(id)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgColor}`}>
                    <Icon className={`h-6 w-6 ${textColor}`} />
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-gray-400 transition-colors" />
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm font-medium text-gray-700 mt-1">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{caption}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* Modal for detailed view */}
      <Dialog open={!!selectedMetric} onOpenChange={(open) => !open && setSelectedMetric(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              {selectedMetricData && (
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${selectedMetricData.bgColor}`}>
                  <selectedMetricData.icon className={`h-6 w-6 ${selectedMetricData.textColor}`} />
                </div>
              )}
              <div>
                <DialogTitle className="text-xl">{selectedMetricData?.label}</DialogTitle>
                <p className="text-sm text-gray-500 mt-0.5">{selectedMetricData?.caption}</p>
              </div>
            </div>
          </DialogHeader>
          <div className="mt-4">
            {renderModalContent()}
          </div>
        </DialogContent>
      </Dialog>

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
                    <motion.div
                      key={entry.country}
                      className="space-y-2 rounded-lg border border-gray-100 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      whileHover={{ scale: 1.01 }}
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
                        <motion.div
                          className="h-1.5 rounded-full bg-purple-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
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
                    </motion.div>
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

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
        >
          <Card className="overflow-hidden group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <MapIcon className="h-5 w-5 text-purple-600" />
                </motion.div>
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Geographic reach
                </motion.span>
              </CardTitle>
              <CardDescription>Visual map of where UNICEF parent programs are active.</CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div
                className="relative h-64 overflow-hidden rounded-xl border border-purple-100 shadow-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Animated gradient background */}
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    background: [
                      'linear-gradient(135deg, #f3e8ff 0%, #ffffff 50%, #dbeafe 100%)',
                      'linear-gradient(135deg, #dbeafe 0%, #ffffff 50%, #f3e8ff 100%)',
                      'linear-gradient(135deg, #f3e8ff 0%, #ffffff 50%, #dbeafe 100%)',
                    ],
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Floating particles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-purple-300/40"
                    style={{
                      left: `${20 + i * 15}%`,
                      top: `${30 + (i % 3) * 20}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      x: [0, 10, 0],
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeInOut",
                    }}
                  />
                ))}

                <div className="absolute inset-0">
                  <div className="mx-auto flex h-full max-w-xl items-center justify-between px-8">
                    {/* Stats with staggered animation */}
                    <div className="flex flex-col gap-4 text-xs text-gray-600">
                      {countryReachStats.map((stat, index) => (
                        <motion.div
                          key={stat.label}
                          className="flex items-center justify-between gap-4 bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm"
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.15, type: "spring" }}
                          whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.9)" }}
                        >
                          <span className="text-gray-600">{stat.label}</span>
                          <motion.span
                            className="text-lg font-bold text-purple-700"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.7 + index * 0.15, type: "spring", stiffness: 200 }}
                          >
                            {stat.value}
                          </motion.span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Map container with enhanced animations */}
                    <motion.div
                      className="relative h-56 w-80 overflow-hidden rounded-xl border-2 border-white/80 bg-white/90 p-4 shadow-xl backdrop-blur"
                      initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                      whileHover={{ boxShadow: "0 20px 40px rgba(147, 51, 234, 0.2)" }}
                    >
                      {/* World map */}
                      <motion.div
                        className="absolute inset-0 opacity-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        transition={{ delay: 0.6 }}
                      >
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/1024px-World_map_-_low_resolution.svg.png"
                          alt="World map"
                          className="h-full w-full object-cover"
                        />
                      </motion.div>

                      {/* Animated overlay gradient */}
                      <motion.div
                        className="absolute inset-0 rounded-xl"
                        animate={{
                          background: [
                            'radial-gradient(circle at 50% 30%, rgba(147, 51, 234, 0.1), transparent 50%)',
                            'radial-gradient(circle at 48% 28%, rgba(59, 130, 246, 0.1), transparent 50%)',
                            'radial-gradient(circle at 50% 30%, rgba(147, 51, 234, 0.1), transparent 50%)',
                          ],
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                      />

                      {/* Connection line between markers */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <motion.line
                          x1="47%"
                          y1="29%"
                          x2="51%"
                          y2="27%"
                          stroke="url(#gradient)"
                          strokeWidth="2"
                          strokeDasharray="4 2"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 0.6 }}
                          transition={{ delay: 1.2, duration: 1 }}
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#9333ea" />
                            <stop offset="100%" stopColor="#3b82f6" />
                          </linearGradient>
                        </defs>
                      </svg>

                      {/* Map markers with enhanced animations */}
                      <div className="relative h-full w-full">
                        {mapMarkers.map((marker, index) => (
                          <motion.div
                            key={marker.country}
                            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 text-[11px] font-medium text-gray-800 cursor-pointer"
                            style={{ left: marker.x, top: marker.y }}
                            initial={{ scale: 0, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{
                              delay: 0.8 + index * 0.2,
                              type: "spring",
                              stiffness: 200,
                              damping: 15,
                            }}
                            whileHover={{ scale: 1.15, zIndex: 10 }}
                          >
                            {/* Outer pulsing ring */}
                            <motion.span
                              className="absolute -inset-2 rounded-full border-2 border-purple-400/50"
                              animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 0, 0.5],
                              }}
                              transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                            />

                            {/* Inner dot with glow */}
                            <motion.span
                              className="relative h-3 w-3 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg"
                              animate={{
                                boxShadow: [
                                  '0 0 0 0 rgba(147, 51, 234, 0.4), 0 0 10px rgba(147, 51, 234, 0.3)',
                                  '0 0 0 8px rgba(147, 51, 234, 0), 0 0 20px rgba(147, 51, 234, 0.5)',
                                  '0 0 0 0 rgba(147, 51, 234, 0.4), 0 0 10px rgba(147, 51, 234, 0.3)',
                                ],
                              }}
                              transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                            />

                            {/* Country label */}
                            <motion.span
                              className="rounded-full bg-white px-2.5 py-1 shadow-lg border border-purple-100"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 1 + index * 0.2 }}
                              whileHover={{
                                backgroundColor: "#f3e8ff",
                                scale: 1.05,
                              }}
                            >
                              <span className="mr-1">{marker.flag}</span>
                              {marker.country}
                            </motion.span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

    </div>
  )
}
