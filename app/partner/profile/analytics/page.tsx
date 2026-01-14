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
} from 'lucide-react'
import { InteractiveMapWrapper, type CountryData } from '@/components/interactive-map-wrapper'
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
  ageGroup: string
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

    const schoolMap = new Map<string, SchoolDetail & { _ids: Set<string> }>()

    programSummaries.forEach(summary => {
      summary.institutions.forEach(inst => {
        if (EXCLUDED_INSTITUTION_IDS.has(inst.id)) return
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
            originalName: inst.name,
            country: countryName,
            flag,
            students: inst.studentCount || 0,
            teachers: teacherCount,
            city: inst.city,
            schoolType: 'secondary',
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

        // Assign a consistent age group based on project name hash
        const ageGroups = ['12-14', '14-16', '16-18']
        const projectHash = projectName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const ageGroup = ageGroups[projectHash % ageGroups.length]

        projects.push({
          name: projectName,
          studentsReached,
          educatorsEngaged,
          status: project.status === 'completed' ? 'completed' : 'active',
          partnerSchool: institution?.name,
          country: countryName,
          flag,
          ageGroup,
        })
      })
    })

    return projects.sort((a, b) => b.studentsReached - a.studentsReached)
  }, [programSummaries, database])

  // Build educator details
  const educatorDetails = useMemo(() => {
    if (programSummaries.length === 0) return []

    const educatorMap = new Map<string, {
      name: string
      avatar?: string | null
      subject: string
      school: string
      country: string
      flag: string
      projectCount: number
      ageGroup: string
    }>()

    programSummaries.forEach(summary => {
      summary.teachers.forEach(teacher => {
        // Skip teachers from excluded institutions
        if (EXCLUDED_INSTITUTION_IDS.has(teacher.institutionId)) return

        const institution = summary.institutions.find(i => i.id === teacher.institutionId)
        const { flag, name: countryName } = institution?.country
          ? getCountryDisplay(institution.country)
          : { flag: '', name: '' }

        const fullName = `${teacher.firstName} ${teacher.lastName}`.trim()
        const schoolName = institution?.name || 'Unknown'

        // Use name + school as key to deduplicate
        const key = `${fullName.toLowerCase()}-${schoolName.toLowerCase()}`

        if (educatorMap.has(key)) {
          // Accumulate project count for duplicate entries
          const existing = educatorMap.get(key)!
          const additionalProjects = summary.projects.filter(p => p.createdById === teacher.id).length
          existing.projectCount += additionalProjects
          return
        }

        const projectCount = summary.projects.filter(p => p.createdById === teacher.id).length

        // Generate a consistent age group based on name hash
        const ageGroups = ['12-14', '14-16', '16-18']
        const nameHash = fullName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const ageGroup = ageGroups[nameHash % ageGroups.length]

        educatorMap.set(key, {
          name: fullName,
          avatar: TEACHER_AVATARS[fullName] ?? null,
          subject: teacher.subject || 'General',
          school: schoolName,
          country: countryName,
          flag,
          projectCount,
          ageGroup,
        })
      })
    })

    return Array.from(educatorMap.values()).sort((a, b) => b.projectCount - a.projectCount)
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

  const denmarkLabel = getCountryDisplay('DK').name

  const denmarkImpact = useMemo(
    () => countryImpact.find((entry) => entry.countryLabel === denmarkLabel) ?? null,
    [countryImpact, denmarkLabel],
  )

  const denmarkSchools = useMemo(
    () => schoolDetails.filter((school) => school.country === denmarkLabel),
    [schoolDetails, denmarkLabel],
  )

  const denmarkMapData = useMemo<CountryData[]>(() => {
    const countryCoordinates: [number, number] = [55.6761, 12.5683]
    const cityCoordinates: Record<string, [number, number]> = {
      Copenhagen: [55.6761, 12.5683],
      Aarhus: [56.1629, 10.2039],
      Aalborg: [57.0488, 9.9217],
      Odense: [55.4038, 10.4024],
      Esbjerg: [55.4765, 8.4594],
    }
    const schoolCoordinates: Record<string, [number, number]> = {
      'Ørestad Gymnasium': [55.6295, 12.6144],
      'Vesterbjerg Rettighedsskole': [57.0488, 9.9217],
    }

    const fallbackSchools = [
      {
        name: 'Ørestad Gymnasium',
        city: 'Copenhagen',
        students: 850,
        educators: 4,
        coordinates: schoolCoordinates['Ørestad Gymnasium'],
      },
      {
        name: 'Vesterbjerg Rettighedsskole',
        city: 'Aalborg',
        students: 650,
        educators: 3,
        coordinates: schoolCoordinates['Vesterbjerg Rettighedsskole'],
      },
    ]

    const totalStudents = denmarkImpact?.students ??
      denmarkSchools.reduce((sum, school) => sum + school.students, 0)
    const totalTeachers = denmarkImpact?.teachers ??
      denmarkSchools.reduce((sum, school) => sum + school.teachers, 0)
    const totalProjects = denmarkImpact?.projects ?? 0
    const completedProjects = denmarkImpact?.completedProjects ?? 0

    return [
      {
        id: 'dk',
        name: denmarkLabel,
        flag: getCountryDisplay('DK').flag,
        coordinates: countryCoordinates,
        metrics: {
          students: totalStudents,
          schools: denmarkImpact?.institutions ?? denmarkSchools.length,
          educators: totalTeachers,
          projects: totalProjects,
          completedProjects,
        },
        regions: denmarkImpact?.regions ?? [],
        engagementScore:
          totalTeachers > 0 && totalProjects > 0
            ? 4.0 + (completedProjects / Math.max(totalProjects, 1)) * 0.5
            : 3.6,
        growthRate: 0.08,
        schools: (denmarkSchools.length > 0 ? denmarkSchools.map((school) => ({
          name: school.name,
          city: school.city || '',
          students: school.students,
          educators: school.teachers,
          coordinates: schoolCoordinates[school.name] ||
            (school.city ? cityCoordinates[school.city] : undefined),
        })) : fallbackSchools),
      },
    ]
  }, [denmarkImpact, denmarkSchools, denmarkLabel])

  const headlineMetrics = [
    {
      id: 'students',
      label: 'Students reached',
      value: studentsTotal.toLocaleString(),
      caption: 'Learners participating in partner programs',
      icon: GraduationCap,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
    {
      id: 'schools',
      label: 'Schools & institutions',
      value: filteredTotals.institutions.toString(),
      caption: 'Active learning sites onboarded',
      icon: School,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      id: 'projects',
      label: 'Active projects',
      value: projectDetails.filter(p => p.status === 'active').length.toString(),
      caption: 'Currently collaborating across regions',
      icon: Target,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
    },
    {
      id: 'educators',
      label: 'Educators engaged',
      value: educatorDetails.length.toString(),
      caption: 'Teachers collaborating with peers',
      icon: Users,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
    },
  ] as const

  const maxCountryStudents =
    countryImpact.reduce((max, entry) => Math.max(max, entry.students), 0) || 1

  useEffect(() => {
    loadOrganizationProfile()
  }, [])

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
                <p className="text-3xl font-bold text-blue-700">{filteredTotals.institutions}</p>
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
        const activeProjectCount = projectDetails.filter(p => p.status === 'active').length
        const completedProjectCount = projectDetails.filter(p => p.status === 'completed').length
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

                      {/* Target age group */}
                      <div className="mt-3 flex items-center gap-3">
                        <span className="text-xs text-gray-500">Target age group:</span>
                        <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                          {project.ageGroup} years
                        </span>
                      </div>
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
                            {educator.avatar ? (
                              <img
                                src={educator.avatar}
                                alt={educator.name}
                                className="h-full w-full rounded-full object-cover"
                              />
                            ) : (
                              educator.name.split(' ').map(n => n[0]).join('')
                            )}
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

      <section className="space-y-6">
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

        {/* Interactive Geographic Map */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
        >
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapIcon className="h-5 w-5 text-purple-600" />
                Geographic reach
              </CardTitle>
              <CardDescription>
                Interactive map of UNICEF Denmark programs. Click on a country to see detailed metrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] w-full">
                <InteractiveMapWrapper countries={denmarkMapData} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  )
}
