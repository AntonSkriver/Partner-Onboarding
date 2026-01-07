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
}

interface ProjectDetail {
  name: string
  studentsReached: number
  educatorsEngaged: number
  status: 'active' | 'completed'
  partnerSchool?: string
  country?: string
  flag?: string
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
        { name: 'Ørestad Gymnasium', country: 'Denmark', flag: '🇩🇰', students: 850, teachers: 4, city: 'Copenhagen' },
        { name: 'London Academy', country: 'United Kingdom', flag: '🇬🇧', students: 1200, teachers: 5, city: 'London' },
        { name: 'Manchester International', country: 'United Kingdom', flag: '🇬🇧', students: 980, teachers: 4, city: 'Manchester' },
        { name: 'Vesterbjerg Rettighedsskole', country: 'Denmark', flag: '🇩🇰', students: 650, teachers: 3, city: 'Aalborg' },
      ]
    }

    const schoolMap = new Map<string, SchoolDetail>()
    programSummaries.forEach(summary => {
      summary.institutions.forEach(inst => {
        if (!schoolMap.has(inst.id)) {
          const { flag, name: countryName } = getCountryDisplay(inst.country || '')
          const teacherCount = summary.teachers.filter(t => t.institutionId === inst.id).length
          schoolMap.set(inst.id, {
            name: inst.name,
            country: countryName,
            flag,
            students: inst.studentCount || 0,
            teachers: teacherCount,
            city: inst.city,
          })
        }
      })
    })

    return Array.from(schoolMap.values()).sort((a, b) => b.students - a.students)
  }, [programSummaries])

  // Build detailed project data
  const projectDetails = useMemo<ProjectDetail[]>(() => {
    if (programSummaries.length === 0) {
      return [
        { name: 'Climate Action 2025', studentsReached: 520, educatorsEngaged: 4, status: 'active', partnerSchool: 'London Academy', country: 'United Kingdom', flag: '🇬🇧' },
        { name: 'Digital Rights', studentsReached: 380, educatorsEngaged: 3, status: 'active', partnerSchool: 'Ørestad Gymnasium', country: 'Denmark', flag: '🇩🇰' },
        { name: 'Community Voices', studentsReached: 450, educatorsEngaged: 4, status: 'active', partnerSchool: 'Manchester International', country: 'United Kingdom', flag: '🇬🇧' },
        { name: 'Youth Leadership', studentsReached: 290, educatorsEngaged: 2, status: 'completed', partnerSchool: 'Vesterbjerg Rettighedsskole', country: 'Denmark', flag: '🇩🇰' },
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

        projects.push({
          name: project.title,
          studentsReached,
          educatorsEngaged,
          status: project.status === 'completed' ? 'completed' : 'active',
          partnerSchool: institution?.name,
          country: countryName,
          flag,
        })
      })
    })

    return projects.sort((a, b) => b.studentsReached - a.studentsReached)
  }, [programSummaries])

  // Build educator details
  const educatorDetails = useMemo(() => {
    if (programSummaries.length === 0) {
      return [
        { name: 'Sarah Johnson', subject: 'Science', school: 'London Academy', country: 'United Kingdom', flag: '🇬🇧', projectCount: 2 },
        { name: 'Anne Holm', subject: 'Social Studies', school: 'Ørestad Gymnasium', country: 'Denmark', flag: '🇩🇰', projectCount: 2 },
        { name: 'James Wilson', subject: 'English', school: 'Manchester International', country: 'United Kingdom', flag: '🇬🇧', projectCount: 1 },
        { name: 'Jonas Madsen', subject: 'Art & Design', school: 'Ørestad Gymnasium', country: 'Denmark', flag: '🇩🇰', projectCount: 1 },
      ]
    }

    const educators: Array<{
      name: string
      subject: string
      school: string
      country: string
      flag: string
      projectCount: number
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

        educators.push({
          name: `${teacher.firstName} ${teacher.lastName}`,
          subject: teacher.subject || 'General',
          school: institution?.name || 'Unknown',
          country: countryName,
          flag,
          projectCount,
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
      case 'schools':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-blue-50 p-4 text-center">
                <p className="text-3xl font-bold text-blue-700">{programMetrics.institutions}</p>
                <p className="mt-1 text-sm text-blue-600">Total Schools</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <p className="text-3xl font-bold text-gray-700">
                  {schoolDetails.reduce((sum, s) => sum + s.students, 0).toLocaleString()}
                </p>
                <p className="mt-1 text-sm text-gray-600">Total Students</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <p className="text-3xl font-bold text-gray-700">
                  {schoolDetails.reduce((sum, s) => sum + s.teachers, 0)}
                </p>
                <p className="mt-1 text-sm text-gray-600">Total Teachers</p>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-900">All Schools & Institutions</h4>
              <div className="grid gap-3 md:grid-cols-2">
                {schoolDetails.map((school, idx) => (
                  <motion.div
                    key={school.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="rounded-xl border border-gray-100 p-4 transition-shadow hover:shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{school.flag}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 whitespace-normal break-words">
                          {school.name}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                          <MapIcon className="h-3 w-3" />
                          <span>{school.city}, {school.country}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm">
                          <span className="font-medium text-blue-600">{school.students.toLocaleString()} students</span>
                          <span className="text-gray-500">{school.teachers} teachers</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )
      case 'projects': {
        const activeProjectCount = projectDetails.filter((p) => p.status === 'active').length
        const completedProjectCount = projectDetails.filter((p) => p.status === 'completed').length
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-xl bg-emerald-50 p-4 text-center">
                <p className="text-3xl font-bold text-emerald-700">{activeProjectCount}</p>
                <p className="mt-1 text-sm text-emerald-600">Active</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <p className="text-3xl font-bold text-gray-700">{completedProjectCount}</p>
                <p className="mt-1 text-sm text-gray-600">Completed</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <p className="text-3xl font-bold text-gray-700">{programMetrics.students.toLocaleString()}</p>
                <p className="mt-1 text-sm text-gray-600">Total Students</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <p className="text-3xl font-bold text-gray-700">{educatorDetails.length}</p>
                <p className="mt-1 text-sm text-gray-600">Total Educators</p>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-900">Project Impact Details</h4>
              <div className="space-y-3">
                {projectDetails.map((project, idx) => (
                  <motion.div
                    key={project.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="rounded-xl border border-gray-100 p-4 transition-shadow hover:shadow-sm"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{project.flag}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{project.name}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              project.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {project.status}
                            </span>
                          </div>
                          {project.partnerSchool && (
                            <p className="mt-0.5 text-sm text-gray-500">Partner: {project.partnerSchool}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-purple-500" />
                        <div>
                          <p className="text-lg font-bold text-gray-900">{project.studentsReached}</p>
                          <p className="text-xs text-gray-500">students reached</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-500" />
                        <div>
                          <p className="text-lg font-bold text-gray-900">{project.educatorsEngaged}</p>
                          <p className="text-xs text-gray-500">educators engaged</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )
      }
      case 'educators':
        return (
          <div className="space-y-6">
            <h4 className="text-sm font-semibold text-gray-900">Educator Details</h4>
            <div className="grid gap-3 md:grid-cols-2">
              {educatorDetails.map((educator, idx) => (
                <motion.div
                  key={educator.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-xl border border-gray-100 p-4 transition-shadow hover:shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-sm font-medium text-purple-700">
                        {educator.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{educator.name}</p>
                        <p className="text-xs text-gray-500">{educator.subject} · {educator.school}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{educator.flag} {educator.country}</p>
                      {educator.projectCount > 0 && (
                        <p className="text-xs text-gray-500">
                          {educator.projectCount} project{educator.projectCount > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )
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
                        <motion.div
                          key={marker.country}
                          className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 text-[11px] font-medium text-gray-800"
                          style={{ left: marker.x, top: marker.y }}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3, type: "spring" }}
                          whileHover={{ scale: 1.1 }}
                        >
                          <motion.span
                            className="h-2.5 w-2.5 rounded-full bg-purple-600 shadow-sm"
                            animate={{
                              boxShadow: ['0 0 0 0 rgba(147, 51, 234, 0.4)', '0 0 0 8px rgba(147, 51, 234, 0)', '0 0 0 0 rgba(147, 51, 234, 0)']
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <span className="rounded-full bg-white/90 px-2 py-0.5 shadow-sm">
                            {marker.flag} {marker.country}
                          </span>
                        </motion.div>
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
