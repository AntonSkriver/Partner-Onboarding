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
  ChevronRight,
  BookOpen,
  MapPin,
} from 'lucide-react'
import { Database } from '@/lib/types/database'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import {
  buildProgramSummariesForPartner,
  type ProgramSummary,
} from '@/lib/programs/selectors'
import { getCountryDisplay } from '@/lib/countries'

type Organization = Database['public']['Tables']['organizations']['Row']
type FocusCountryCode = 'DK' | 'UK'

const EXCLUDED_INSTITUTION_IDS = new Set<string>()

const TEACHER_AVATARS: Record<string, string> = {
  'Ulla Jensen': '/images/avatars/ulla-new.jpg',
  'Karin Albrectsen': '/images/avatars/karin-new.jpg',
  'Maria Garcia': '/images/avatars/maria-new.jpg',
  'Raj Patel': '/images/avatars/raj-new.jpg',
  'Jonas Madsen': '/images/avatars/jonas-final.jpg',
  'Anne Holm': '/images/avatars/anne-holm.png',
  'Sofie Larsen': '/images/avatars/sofie-larsen.png',
  'Sara Ricci': '/images/avatars/sara-ricci.png',
  'Lucas Souza': '/images/avatars/lucas-souza.png',
  'Peter Andersen': '/images/avatars/peter-andersen.png',
}

// Detailed breakdown data for interactive cards
interface SchoolDetail {
  name: string
  originalName: string
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

export default function PartnerAnalyticsPage() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
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

  // Build detailed school data
  const schoolDetails = useMemo<SchoolDetail[]>(() => {
    if (!database || programSummaries.length === 0) return []

    const schoolMap = new Map<string, SchoolDetail>()

    programSummaries.forEach(summary => {
      summary.institutions.forEach(inst => {
        if (EXCLUDED_INSTITUTION_IDS.has(inst.id)) return
        if (!schoolMap.has(inst.id)) {
          const { flag, name: countryName } = getCountryDisplay(inst.country || '')
          const teacherCount = summary.teachers.filter(t => t.institutionId === inst.id).length
          schoolMap.set(inst.id, {
            name: inst.name,
            originalName: inst.name,
            country: countryName,
            flag,
            students: inst.studentCount || 0,
            teachers: teacherCount,
            city: inst.city,
          })
        }
      })
    })

    const merged = new Map<string, SchoolDetail>()
    schoolMap.forEach((school) => {
      const key = school.name.trim().toLowerCase()
      const existing = merged.get(key)
      if (!existing) {
        merged.set(key, { ...school })
        return
      }
      const combinedName = existing.name.length >= school.name.length
        ? existing.name
        : school.name
      merged.set(key, {
        ...existing,
        name: combinedName,
        originalName: existing.originalName,
        students: existing.students + school.students,
        teachers: existing.teachers + school.teachers,
      })
    })

    return Array.from(merged.values())
      .filter((entry) => entry.teachers > 0 || entry.students > 0)
      .sort((a, b) => b.students - a.students)
  }, [database, programSummaries])

  // Build detailed project data
  const projectDetails = useMemo<ProjectDetail[]>(() => {
    if (programSummaries.length === 0 || !database) return []

    const projects: ProjectDetail[] = []

    // Create template lookup map
    const templateById = new Map(
      database.programTemplates.map(t => [t.id, t])
    )

    programSummaries.forEach((summary) => {
      summary.projects.forEach((project, projectIdx) => {
        const creator = summary.teachers.find(t => t.id === project.createdById)
        const institution = creator
          ? summary.institutions.find(i => i.id === creator.institutionId)
          : null
        const { flag, name: countryName } = institution?.country
          ? getCountryDisplay(institution.country)
          : { flag: '', name: '' }

        // Get educators specifically associated with the project's creator's school
        const creatorInstitutionId = creator?.institutionId
        const projectTeachers = creatorInstitutionId
          ? summary.teachers.filter(t => t.institutionId === creatorInstitutionId && !EXCLUDED_INSTITUTION_IDS.has(t.institutionId))
          : []

        // Students reached = students at the creator's school
        const studentsReached = institution?.studentCount || 0
        const educatorsEngaged = projectTeachers.length || 1

        // Get project name from template or generate fallback
        const template = project.templateId ? templateById.get(project.templateId) : null
        const projectName = template?.title || `${summary.program.name} Project ${projectIdx + 1}`

        projects.push({
          name: projectName,
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
  }, [programSummaries, database])

  // Build educator details
  const educatorDetails = useMemo(() => {
    if (programSummaries.length === 0) return []

    const educators: Array<{
      name: string
      avatar?: string | null
      subject: string
      school: string
      country: string
      flag: string
      projectCount: number
    }> = []

    const seenTeachers = new Set<string>()

    programSummaries.forEach(summary => {
      summary.teachers.forEach(teacher => {
        // Skip teachers from excluded institutions
        if (EXCLUDED_INSTITUTION_IDS.has(teacher.institutionId)) return
        if (seenTeachers.has(teacher.id)) return
        seenTeachers.add(teacher.id)

        const institution = summary.institutions.find(i => i.id === teacher.institutionId)
        const { flag, name: countryName } = institution?.country
          ? getCountryDisplay(institution.country)
          : { flag: '', name: '' }

        const projectCount = summary.projects.filter(p => p.createdById === teacher.id).length

        const fullName = `${teacher.firstName} ${teacher.lastName}`.trim()

        educators.push({
          name: fullName,
          avatar: TEACHER_AVATARS[fullName] ?? null,
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
    if (programSummaries.length === 0) return []

    return programSummaries.map(summary => {
      const validInstitutions = summary.institutions.filter(i => !EXCLUDED_INSTITUTION_IDS.has(i.id))
      const students = validInstitutions.reduce((sum, i) => sum + (i.studentCount || 0), 0)
      return {
        program: summary.program.name,
        students,
        schools: validInstitutions.length,
        countries: new Set(validInstitutions.map(i => i.country).filter(Boolean)).size,
      }
    }).sort((a, b) => b.students - a.students)
  }, [programSummaries])

  const studentsTotal = useMemo(
    () => studentBreakdown.reduce((sum, entry) => sum + entry.students, 0),
    [studentBreakdown],
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
        if (EXCLUDED_INSTITUTION_IDS.has(institution.id)) {
          return
        }
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
        if (institution?.country && !EXCLUDED_INSTITUTION_IDS.has(institution.id)) {
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
        if (institution?.country && !EXCLUDED_INSTITUTION_IDS.has(institution.id)) {
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

  const focusCountries: FocusCountryCode[] = ['DK', 'UK']
  const filteredImpact = countryImpact.filter((entry) =>
    focusCountries.includes(entry.country as FocusCountryCode),
  )

  const focusSchoolCount = useMemo(() => {
    const focusSet = new Set<FocusCountryCode>(focusCountries)
    const names = new Set<string>()

    programSummaries.forEach((summary) => {
      summary.institutions.forEach((inst) => {
        if (!focusSet.has(inst.country as FocusCountryCode)) return
        const name = inst.name?.trim()
        if (name) {
          names.add(name.toLowerCase())
        }
      })
    })

    return names.size
  }, [programSummaries, focusCountries])

  const filteredTotals = useMemo(() => {
    const focusSet = new Set<FocusCountryCode>(focusCountries)
    const programs = new Set<string>()

    programSummaries.forEach((summary) => {
      const hasFocusInstitution = summary.institutions.some((inst) =>
        focusSet.has(inst.country as FocusCountryCode),
      )
      if (hasFocusInstitution) {
        programs.add(summary.program.id)
      }
    })

    return {
      institutions: focusSchoolCount,
      programs: programs.size,
    }
  }, [programSummaries, focusCountries, focusSchoolCount])

  const headlineMetrics = [
    {
      id: 'students',
      label: 'Students reached',
      value: studentsTotal.toLocaleString(),
      caption: 'Learners participating in partner programs',
      icon: GraduationCap,
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-700',
      gradientFrom: 'from-purple-500',
      gradientTo: 'to-purple-600',
    },
    {
      id: 'schools',
      label: 'Schools & institutions',
      value: filteredTotals.institutions.toString(),
      caption: 'Active learning sites onboarded',
      icon: School,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-blue-600',
    },
    {
      id: 'projects',
      label: 'Active projects',
      value: projectDetails.filter(p => p.status === 'active').length.toString(),
      caption: 'Currently collaborating across regions',
      icon: Target,
      color: 'emerald',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-700',
      gradientFrom: 'from-emerald-500',
      gradientTo: 'to-emerald-600',
    },
    {
      id: 'educators',
      label: 'Educators engaged',
      value: educatorDetails.length.toString(),
      caption: 'Teachers collaborating with peers',
      icon: Users,
      color: 'amber',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-700',
      gradientFrom: 'from-amber-500',
      gradientTo: 'to-amber-600',
    },
  ] as const

  const countryReachStats = [
    {
      label: 'Countries active (DK/UK)',
      value: filteredImpact.length.toString(),
    },
    {
      label: 'Institutions onboarded',
      value: filteredTotals.institutions.toString(),
    },
    {
      label: 'Programs live',
      value: filteredTotals.programs.toString(),
    },
  ]

  const maxCountryStudents =
    countryImpact.reduce((max, entry) => Math.max(max, entry.students), 0) || 1

  useEffect(() => {
    loadOrganizationProfile()
  }, [])

  const markerPositions: Record<string, { x: string; y: string }> = {
    Denmark: { x: '62%', y: '40%' },
    'United Kingdom': { x: '48%', y: '45%' },
  }

  const mapMarkers =
    filteredImpact.length > 0
      ? filteredImpact.map((entry) => ({
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

  const loadOrganizationProfile = async () => {
    setLoading(true)
    try {
      // Use sample data for prototype - no strict session check needed
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

  const selectedMetricData = headlineMetrics.find(m => m.id === selectedMetric)

  const renderModalContent = () => {
    if (!selectedMetric) return null

    switch (selectedMetric) {
      case 'students':
        // Calculate unique countries across all programs (with exclusions applied)
        const uniqueCountries = new Set<string>()
        programSummaries.forEach(summary => {
          summary.institutions
            .filter(i => !EXCLUDED_INSTITUTION_IDS.has(i.id) && i.country)
            .forEach(i => uniqueCountries.add(i.country))
        })
        const totalUniqueCountries = uniqueCountries.size

        return (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-purple-50 p-4 text-center">
                <p className="text-3xl font-bold text-purple-700">{studentsTotal.toLocaleString()}</p>
                <p className="text-sm text-purple-600 mt-1">Total Students</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <p className="text-3xl font-bold text-gray-700">{studentBreakdown.length}</p>
                <p className="text-sm text-gray-600 mt-1">Programs</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <p className="text-3xl font-bold text-gray-700">{totalUniqueCountries}</p>
                <p className="text-sm text-gray-600 mt-1">Countries</p>
              </div>
            </div>

            {/* Breakdown by Program */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Breakdown by Program</h4>
              <div className="space-y-3">
                {studentBreakdown.map((item, idx) => {
                  const percent = studentsTotal
                    ? Math.round((item.students / studentsTotal) * 100)
                    : 0
                  return (
                    <motion.div
                      key={item.program}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                            <BookOpen className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.program}</p>
                            <p className="text-sm text-gray-500">{item.schools} {item.schools === 1 ? 'school' : 'schools'} · {item.countries} {item.countries === 1 ? 'country' : 'countries'}</p>
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

      case 'schools':
        return (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-blue-50 p-4 text-center">
                <p className="text-3xl font-bold text-blue-700">{filteredTotals.institutions}</p>
                <p className="text-sm text-blue-600 mt-1">Total Schools</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <p className="text-3xl font-bold text-gray-700">
                  {schoolDetails.reduce((sum, s) => sum + s.students, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total Students</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <p className="text-3xl font-bold text-gray-700">
                  {schoolDetails.reduce((sum, s) => sum + s.teachers, 0)}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total Teachers</p>
              </div>
            </div>

            {/* School List */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">All Schools & Institutions</h4>
              <div className="grid gap-3 md:grid-cols-2">
                {schoolDetails.map((school, idx) => (
                  <motion.div
                    key={school.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{school.flag}</span>
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-medium text-gray-900 whitespace-normal break-words"
                          title={school.originalName}
                        >
                          {school.name}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          <span className="min-w-0 flex-1 truncate">{school.city}, {school.country}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm">
                          <span className="whitespace-nowrap font-medium text-blue-600">
                            {school.students.toLocaleString()} students
                          </span>
                          <span className="whitespace-nowrap text-gray-500">
                            {school.teachers} teachers
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'projects':
        const activeProjectCount = projectDetails.filter(p => p.status === 'active').length
        const completedProjectCount = projectDetails.filter(p => p.status === 'completed').length
        return (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-xl bg-emerald-50 p-4 text-center">
                <p className="text-3xl font-bold text-emerald-700">{activeProjectCount}</p>
                <p className="text-sm text-emerald-600 mt-1">Active</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <p className="text-3xl font-bold text-gray-700">{completedProjectCount}</p>
                <p className="text-sm text-gray-600 mt-1">Completed</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <p className="text-3xl font-bold text-gray-700">
                  {studentsTotal.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total Students</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <p className="text-3xl font-bold text-gray-700">
                  {educatorDetails.length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total Educators</p>
              </div>
            </div>

            {/* Project List */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Project Impact Details</h4>
              <div className="space-y-3">
                {projectDetails.map((project, idx) => (
                  <motion.div
                    key={project.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
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
                            <p className="text-sm text-gray-500 mt-0.5">School: {project.partnerSchool}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                          <GraduationCap className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-gray-900">{project.studentsReached}</p>
                          <p className="text-xs text-gray-500">Students Reached</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                          <Users className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-gray-900">{project.educatorsEngaged}</p>
                          <p className="text-xs text-gray-500">Educators Engaged</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'educators':
        return (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-amber-50 p-4 text-center">
                <p className="text-3xl font-bold text-amber-700">{educatorDetails.length}</p>
                <p className="text-sm text-amber-600 mt-1">Total Educators</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <p className="text-3xl font-bold text-gray-700">
                  {new Set(educatorDetails.map(e => e.school)).size}
                </p>
                <p className="text-sm text-gray-600 mt-1">Schools</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <p className="text-3xl font-bold text-gray-700">
                  {new Set(educatorDetails.map(e => e.country)).size}
                </p>
                <p className="text-sm text-gray-600 mt-1">Countries</p>
              </div>
            </div>

            {/* Educator List */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">All Educators</h4>
              <div className="grid gap-3 md:grid-cols-2">
                {educatorDetails.map((educator, idx) => (
                  <motion.div
                    key={educator.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-amber-100 to-amber-50 text-base font-semibold text-amber-700">
                        {educator.avatar ? (
                          <img
                            src={educator.avatar}
                            alt={educator.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          educator.name.split(' ').map(n => n[0]).join('')
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{educator.name}</p>
                        <p className="text-sm text-gray-500 truncate">{educator.subject}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                          <span>{educator.flag} {educator.school}</span>
                          {educator.projectCount > 0 && (
                            <>
                              <span>·</span>
                              <span className="text-amber-600">{educator.projectCount} project{educator.projectCount > 1 ? 's' : ''}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
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
          Spotlight on Denmark and UK partnerships: students reached, educators engaged, and where
          collaborations are active. <span className="text-purple-600 font-medium">Click any metric for details.</span>
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
            {filteredImpact.length > 0 ? (
              <div className="space-y-4">
                {filteredImpact.map((entry) => {
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
            <CardDescription>Where UNICEF Denmark collaborations are active.</CardDescription>
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
