'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Target,
  Users,
  GraduationCap,
  School,
  Building2,
  Map as MapIcon,
  ChevronDown,
  X,
  BookOpen,
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
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
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

  // Build detailed school data
  const schoolDetails = useMemo<SchoolDetail[]>(() => {
    if (filteredProgramSummaries.length === 0) {
      return [
        { name: 'Ørestad Gymnasium', country: 'Denmark', flag: '🇩🇰', students: 850, teachers: 4, city: 'Copenhagen' },
        { name: 'London Academy', country: 'United Kingdom', flag: '🇬🇧', students: 1200, teachers: 5, city: 'London' },
        { name: 'Manchester International', country: 'United Kingdom', flag: '🇬🇧', students: 980, teachers: 4, city: 'Manchester' },
        { name: 'Aarhus Community School', country: 'Denmark', flag: '🇩🇰', students: 650, teachers: 3, city: 'Aarhus' },
      ]
    }

    const schoolMap = new Map<string, SchoolDetail>()
    filteredProgramSummaries.forEach(summary => {
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
  }, [filteredProgramSummaries])

  // Build detailed project data
  const projectDetails = useMemo<ProjectDetail[]>(() => {
    if (filteredProgramSummaries.length === 0) {
      return [
        { name: 'Climate Action 2025', studentsReached: 520, educatorsEngaged: 4, status: 'active', partnerSchool: 'London Academy', country: 'United Kingdom', flag: '🇬🇧' },
        { name: 'Digital Rights', studentsReached: 380, educatorsEngaged: 3, status: 'active', partnerSchool: 'Ørestad Gymnasium', country: 'Denmark', flag: '🇩🇰' },
        { name: 'Community Voices', studentsReached: 450, educatorsEngaged: 4, status: 'active', partnerSchool: 'Manchester International', country: 'United Kingdom', flag: '🇬🇧' },
        { name: 'Youth Leadership', studentsReached: 290, educatorsEngaged: 2, status: 'completed', partnerSchool: 'Aarhus Community School', country: 'Denmark', flag: '🇩🇰' },
      ]
    }

    const projects: ProjectDetail[] = []
    filteredProgramSummaries.forEach(summary => {
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
  }, [filteredProgramSummaries])

  // Build educator details
  const educatorDetails = useMemo(() => {
    if (filteredProgramSummaries.length === 0) {
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
    filteredProgramSummaries.forEach(summary => {
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
  }, [filteredProgramSummaries])

  // Student breakdown by program
  const studentBreakdown = useMemo(() => {
    if (filteredProgramSummaries.length === 0) {
      return [
        { program: 'UNICEF Denmark: Communities in Focus', students: 2400, schools: 2, countries: 1 },
        { program: 'UNICEF UK: Climate Action', students: 2800, schools: 2, countries: 1 },
      ]
    }

    return filteredProgramSummaries.map(summary => {
      const students = summary.institutions.reduce((sum, i) => sum + (i.studentCount || 0), 0)
      return {
        program: summary.program.name,
        students,
        schools: summary.institutions.length,
        countries: new Set(summary.institutions.map(i => i.country).filter(Boolean)).size,
      }
    }).sort((a, b) => b.students - a.students)
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

  const headlineMetrics = [
    {
      id: 'students',
      label: 'Students reached',
      value: programMetrics.students.toLocaleString(),
      caption: 'Learners participating in partner programs',
      icon: GraduationCap,
      bubbleClassName: 'bg-purple-100 text-purple-700',
      expandedColor: 'from-purple-500 to-purple-600',
      details: studentBreakdown,
    },
    {
      id: 'schools',
      label: 'Schools & institutions',
      value: programMetrics.institutions.toString(),
      caption: 'Active learning sites onboarded',
      icon: School,
      bubbleClassName: 'bg-blue-100 text-blue-700',
      expandedColor: 'from-blue-500 to-blue-600',
      details: schoolDetails,
    },
    {
      id: 'projects',
      label: 'Active projects',
      value: programMetrics.activeProjects.toString(),
      caption: 'Currently collaborating across regions',
      icon: Target,
      bubbleClassName: 'bg-emerald-100 text-emerald-700',
      expandedColor: 'from-emerald-500 to-emerald-600',
      details: projectDetails,
    },
    {
      id: 'educators',
      label: 'Educators engaged',
      value: programMetrics.teachers.toString(),
      caption: 'Teachers collaborating with peers',
      icon: Users,
      bubbleClassName: 'bg-amber-100 text-amber-700',
      expandedColor: 'from-amber-500 to-amber-600',
      details: educatorDetails,
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
      value: filteredProgramSummaries.length > 0 ? filteredProgramSummaries.length.toString() : '2',
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

  const toggleCard = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id)
  }

  const renderExpandedContent = (metric: typeof headlineMetrics[number]) => {
    switch (metric.id) {
      case 'students':
        return (
          <div className="space-y-3">
            <div className="text-sm font-medium text-white/80 mb-4">Students by Program</div>
            {(metric.details as typeof studentBreakdown).map((item, idx) => (
              <motion.div
                key={item.program}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between bg-white/10 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-white/70" />
                  <div>
                    <p className="text-sm font-medium text-white">{item.program}</p>
                    <p className="text-xs text-white/60">{item.schools} schools · {item.countries} countries</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{item.students.toLocaleString()}</p>
                  <p className="text-xs text-white/60">students</p>
                </div>
              </motion.div>
            ))}
          </div>
        )

      case 'schools':
        return (
          <div className="space-y-3">
            <div className="text-sm font-medium text-white/80 mb-4">School Details</div>
            {(metric.details as typeof schoolDetails).slice(0, 6).map((school, idx) => (
              <motion.div
                key={school.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between bg-white/10 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{school.flag}</span>
                  <div>
                    <p className="text-sm font-medium text-white">{school.name}</p>
                    <p className="text-xs text-white/60">{school.city}, {school.country}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{school.students.toLocaleString()} students</p>
                  <p className="text-xs text-white/60">{school.teachers} teachers</p>
                </div>
              </motion.div>
            ))}
          </div>
        )

      case 'projects':
        return (
          <div className="space-y-3">
            <div className="text-sm font-medium text-white/80 mb-4">Project Impact</div>
            {(metric.details as typeof projectDetails).map((project, idx) => (
              <motion.div
                key={project.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/10 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{project.flag}</span>
                    <p className="text-sm font-medium text-white">{project.name}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    project.status === 'active'
                      ? 'bg-green-400/20 text-green-200'
                      : 'bg-gray-400/20 text-gray-300'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-white/70" />
                    <div>
                      <p className="text-lg font-bold text-white">{project.studentsReached}</p>
                      <p className="text-xs text-white/60">students reached</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-white/70" />
                    <div>
                      <p className="text-lg font-bold text-white">{project.educatorsEngaged}</p>
                      <p className="text-xs text-white/60">educators engaged</p>
                    </div>
                  </div>
                </div>
                {project.partnerSchool && (
                  <p className="text-xs text-white/50 mt-2">Partner: {project.partnerSchool}</p>
                )}
              </motion.div>
            ))}
          </div>
        )

      case 'educators':
        return (
          <div className="space-y-3">
            <div className="text-sm font-medium text-white/80 mb-4">Educator Details</div>
            {(metric.details as typeof educatorDetails).slice(0, 6).map((educator, idx) => (
              <motion.div
                key={educator.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between bg-white/10 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium text-white">
                    {educator.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{educator.name}</p>
                    <p className="text-xs text-white/60">{educator.subject} · {educator.school}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{educator.flag} {educator.country}</p>
                  {educator.projectCount > 0 && (
                    <p className="text-xs text-white/60">{educator.projectCount} project{educator.projectCount > 1 ? 's' : ''}</p>
                  )}
                </div>
              </motion.div>
            ))}
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

      {/* Interactive Headline Metrics */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {headlineMetrics.map(({ id, label, value, caption, icon: Icon, bubbleClassName, expandedColor, details }) => (
          <motion.div
            key={id}
            layout
            className="relative"
          >
            <motion.div
              layout
              onClick={() => toggleCard(id)}
              className={`cursor-pointer rounded-2xl border transition-all ${
                expandedCard === id
                  ? 'border-transparent shadow-xl'
                  : 'border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-gray-200'
              }`}
            >
              <AnimatePresence mode="wait">
                {expandedCard === id ? (
                  <motion.div
                    key="expanded"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`bg-gradient-to-br ${expandedColor} rounded-2xl p-5 text-white min-h-[280px]`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{value}</p>
                          <p className="text-sm text-white/80">{label}</p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation()
                          setExpandedCard(null)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </motion.button>
                    </div>
                    <div className="max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                      {renderExpandedContent({ id, label, value, caption, icon: Icon, bubbleClassName, expandedColor, details } as typeof headlineMetrics[number])}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="collapsed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-5"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${bubbleClassName}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <motion.div
                          animate={{ rotate: expandedCard === id ? 180 : 0 }}
                          className="text-gray-400"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </motion.div>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
                        <p className="mt-1 text-xs text-gray-500">{caption}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
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

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  )
}
