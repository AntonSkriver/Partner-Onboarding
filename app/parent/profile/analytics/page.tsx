'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, useInView, useSpring, useTransform } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  LabelList,
} from 'recharts'
import {
  Target,
  Users,
  GraduationCap,
  School,
  Building2,
  Map as MapIcon,
  BookOpen,
  ChevronRight,
  TrendingUp,
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
import { InteractiveMapWrapper, type CountryData } from '@/components/interactive-map-wrapper'

type Organization = Database['public']['Tables']['organizations']['Row']

// Helper for consistent age group calculation based on project name hash
function getProjectAgeGroup(projectName: string): string {
  const ageGroups = ['12-14', '14-16', '16-18']
  const hash = projectName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return ageGroups[hash % ageGroups.length]
}

// Animated counter component for engaging number displays
function AnimatedCounter({ value, duration = 1.5, className = '' }: { value: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const spring = useSpring(0, { duration: duration * 1000 })
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString())

  useEffect(() => {
    if (isInView) {
      spring.set(value)
    }
  }, [isInView, spring, value])

  return <motion.span ref={ref} className={className}>{display}</motion.span>
}

// Chart color palettes
const CHART_COLORS = {
  purple: ['#9333ea', '#a855f7', '#c084fc', '#d8b4fe'],
  blue: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'],
  emerald: ['#059669', '#10b981', '#34d399', '#6ee7b7'],
  amber: ['#d97706', '#f59e0b', '#fbbf24', '#fcd34d'],
  status: {
    active: '#10b981',
    partial: '#f59e0b',
    onboarding: '#9ca3af',
  },
}

// Educator avatar mapping
const EDUCATOR_AVATARS: Record<string, string> = {
  'Anne Holm': '/images/avatars/anne-holm.png',
  'Jonas Madsen': '/images/avatars/jonas-final.jpg',
  'Sofie Larsen': '/images/avatars/sofie-larsen.png',
  'Peter Andersen': '/images/avatars/peter-andersen.png',
  'Karin Albrectsen': '/images/avatars/karin-new.jpg',
  'Ulla Jensen': '/images/avatars/ulla-new.jpg',
}

function getEducatorAvatar(name: string): string | null {
  return EDUCATOR_AVATARS[name] || null
}

// Custom tooltip component for charts
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; payload: { fill?: string } }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
        <p className="text-sm font-medium text-gray-900">{label || payload[0].name}</p>
        <p className="text-sm text-gray-600">{payload[0].value.toLocaleString()}</p>
      </div>
    )
  }
  return null
}

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
        institutions: 7,
        teachers: 24,
        students: 5600,
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
        { name: 'Christianshavn Gymnasium', country: 'Denmark', flag: '🇩🇰', students: 720, teachers: 3, city: 'Copenhagen', schoolType: 'secondary', status: 'active', projectCount: 2 },
        { name: 'Mørke Skole', country: 'Denmark', flag: '🇩🇰', students: 480, teachers: 2, city: 'Mørke', schoolType: 'primary', status: 'active', projectCount: 1 },
        { name: 'Vesterbjerg Rettighedsskole', country: 'Denmark', flag: '🇩🇰', students: 650, teachers: 3, city: 'Aalborg', schoolType: 'primary', status: 'onboarding', projectCount: 0 },
        { name: 'London Academy', country: 'United Kingdom', flag: '🇬🇧', students: 1200, teachers: 5, city: 'London', schoolType: 'secondary', status: 'active', projectCount: 3 },
        { name: 'Manchester International', country: 'United Kingdom', flag: '🇬🇧', students: 980, teachers: 4, city: 'Manchester', schoolType: 'secondary', status: 'partial', projectCount: 1 },
        { name: 'Bristol Grammar School', country: 'United Kingdom', flag: '🇬🇧', students: 720, teachers: 3, city: 'Bristol', schoolType: 'secondary', status: 'active', projectCount: 2 },
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
          studentsReached: 52,
          educatorsEngaged: 2,
          status: 'active',
          partnerSchool: 'London Academy',
          country: 'United Kingdom',
          flag: '🇬🇧',
          ageGroupBreakdown: [
            { ageGroup: getProjectAgeGroup('Climate Action 2025'), students: 52 },
          ]
        },
        {
          name: 'Digital Rights',
          studentsReached: 48,
          educatorsEngaged: 2,
          status: 'active',
          partnerSchool: 'Ørestad Gymnasium',
          country: 'Denmark',
          flag: '🇩🇰',
          ageGroupBreakdown: [
            { ageGroup: getProjectAgeGroup('Digital Rights'), students: 48 },
          ]
        },
        {
          name: 'Community Voices',
          studentsReached: 55,
          educatorsEngaged: 2,
          status: 'active',
          partnerSchool: 'Manchester International',
          country: 'United Kingdom',
          flag: '🇬🇧',
          ageGroupBreakdown: [
            { ageGroup: getProjectAgeGroup('Community Voices'), students: 55 },
          ]
        },
        {
          name: 'Youth Leadership',
          studentsReached: 45,
          educatorsEngaged: 1,
          status: 'completed',
          partnerSchool: 'Vesterbjerg Rettighedsskole',
          country: 'Denmark',
          flag: '🇩🇰',
          ageGroupBreakdown: [
            { ageGroup: getProjectAgeGroup('Youth Leadership'), students: 45 },
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

        // Realistic project size: typically 30-60 students per project
        const projectName = project.projectId.replaceAll('-', ' ')
        const hash = projectName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const studentsReached = 30 + (hash % 30) // 30-59 students
        const educatorsEngaged = 1 + (hash % 2) // 1-2 educators per project

        const ageGroupBreakdown = [
          { ageGroup: getProjectAgeGroup(projectName), students: studentsReached },
        ]

        projects.push({
          name: projectName,
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

    const seenTeacherIds = new Set<string>()
    const seenTeacherNames = new Set<string>()
    programSummaries.forEach(summary => {
      summary.teachers.forEach(teacher => {
        const fullName = `${teacher.firstName} ${teacher.lastName}`
        // Dedupe by both ID and name to prevent duplicates across programs
        if (seenTeacherIds.has(teacher.id) || seenTeacherNames.has(fullName)) return
        seenTeacherIds.add(teacher.id)
        seenTeacherNames.add(fullName)

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

  // Transform data for interactive map - use hardcoded data with reliable coordinates
  const mapCountryData = useMemo<CountryData[]>(() => {
    return [
      {
        id: 'dk',
        name: 'Denmark',
        flag: '🇩🇰',
        coordinates: [55.6761, 12.5683],
        metrics: { students: 2700, schools: 4, educators: 12, projects: 5, completedProjects: 2 },
        regions: ['Capital Region', 'Central Denmark', 'North Denmark'],
        engagementScore: 4.2,
        growthRate: 0.15,
        schools: [
          { name: 'Ørestad Gymnasium', city: 'Copenhagen', students: 850, educators: 4, coordinates: [55.6295, 12.6144] as [number, number] },
          { name: 'Christianshavn Gymnasium', city: 'Copenhagen', students: 720, educators: 3, coordinates: [55.6736, 12.5944] as [number, number] },
          { name: 'Mørke Skole', city: 'Mørke', students: 480, educators: 2, coordinates: [56.3333, 10.4500] as [number, number] },
          { name: 'Vesterbjerg Rettighedsskole', city: 'Aalborg', students: 650, educators: 3, coordinates: [57.0488, 9.9217] as [number, number] },
        ],
      },
      {
        id: 'uk',
        name: 'United Kingdom',
        flag: '🇬🇧',
        coordinates: [51.5074, -0.1278],
        metrics: { students: 2900, schools: 3, educators: 12, projects: 6, completedProjects: 1 },
        regions: ['London', 'Manchester', 'Bristol'],
        engagementScore: 3.8,
        growthRate: 0.12,
        schools: [
          { name: 'London Academy', city: 'London', students: 1200, educators: 5, coordinates: [51.5074, -0.1278] as [number, number] },
          { name: 'Manchester International', city: 'Manchester', students: 980, educators: 4, coordinates: [53.4808, -2.2426] as [number, number] },
          { name: 'Bristol Grammar School', city: 'Bristol', students: 720, educators: 3, coordinates: [51.4545, -2.5879] as [number, number] },
        ],
      },
    ]
  }, [])

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
        const countryCount = uniqueCountries.size || 2

        // Prepare pie chart data
        const pieData = studentBreakdown.map((item, idx) => ({
          name: item.program.split(':')[0] || item.program,
          value: item.students,
          fill: CHART_COLORS.purple[idx % CHART_COLORS.purple.length],
        }))

        // Age group distribution (based on typical secondary school demographics)
        const totalStudents = programMetrics.students
        const ageGroupData = [
          { name: '12-14 years', value: Math.round(totalStudents * 0.28), fill: '#8b5cf6' },
          { name: '14-16 years', value: Math.round(totalStudents * 0.38), fill: '#a78bfa' },
          { name: '16-18 years', value: Math.round(totalStudents * 0.34), fill: '#c4b5fd' },
        ]

        // Gender distribution (slightly more female participation typical in educational programs)
        const genderData = [
          { name: 'Female', value: Math.round(totalStudents * 0.52), fill: '#ec4899' },
          { name: 'Male', value: Math.round(totalStudents * 0.47), fill: '#3b82f6' },
          { name: 'Non-binary', value: Math.round(totalStudents * 0.01), fill: '#8b5cf6' },
        ]

        return (
          <div className="space-y-10">
            {/* Hero stat with animated counter */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 p-8 text-white">
              <div className="relative z-10">
                <p className="text-sm font-medium text-purple-100">Total Students Reached</p>
                <p className="mt-2 text-5xl font-bold">
                  <AnimatedCounter value={programMetrics.students} />
                </p>
                <div className="mt-4 flex items-center gap-2 text-purple-100">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Across {countryCount} countries · {studentBreakdown.length} active programs</span>
                </div>
              </div>
              <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
            </div>

            {/* Age and Gender distribution */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Age Group Distribution */}
              <motion.div
                className="rounded-xl border border-gray-100 bg-gray-50/30 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <h4 className="mb-4 text-base font-semibold text-gray-900">Age Distribution</h4>
                <div className="flex items-center gap-6">
                  <div className="h-36 w-36 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={ageGroupData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                          animationBegin={100}
                          animationDuration={600}
                        >
                          {ageGroupData.map((entry, index) => (
                            <Cell key={`age-cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-3">
                    {ageGroupData.map((item) => {
                      const percent = Math.round((item.value / totalStudents) * 100)
                      return (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                            <span className="text-sm font-medium text-gray-700">{item.name}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{percent}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>

              {/* Gender Distribution */}
              <motion.div
                className="rounded-xl border border-gray-100 bg-gray-50/30 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h4 className="mb-4 text-base font-semibold text-gray-900">Gender Distribution</h4>
                <div className="flex items-center gap-6">
                  <div className="h-36 w-36 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={genderData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                          animationBegin={150}
                          animationDuration={600}
                        >
                          {genderData.map((entry, index) => (
                            <Cell key={`gender-cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-3">
                    {genderData.map((item) => {
                      const percent = Math.round((item.value / totalStudents) * 100)
                      return (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                            <span className="text-sm font-medium text-gray-700">{item.name}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{percent}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Pie chart and breakdown */}
            <div className="grid gap-10 lg:grid-cols-2">
              {/* Pie chart */}
              <motion.div
                className="rounded-xl border border-gray-100 bg-gray-50/30 p-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h4 className="mb-6 text-base font-semibold text-gray-900">Distribution by Program</h4>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        animationBegin={200}
                        animationDuration={800}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Simplified color legend */}
                <div className="mt-6 flex flex-wrap gap-4">
                  {pieData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-sm font-medium text-gray-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Program breakdown list */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
              >
                <h4 className="mb-6 text-base font-semibold text-gray-900">Program Details</h4>
                <div className="space-y-5">
                  {studentBreakdown.map((item, idx) => {
                    const percent = programMetrics.students
                      ? Math.round((item.students / programMetrics.students) * 100)
                      : 0
                    return (
                      <motion.div
                        key={item.program}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + idx * 0.05 }}
                        className="group rounded-xl bg-purple-50/50 border-l-4 border-purple-500 p-6 transition-all hover:bg-purple-50/80 hover:shadow-md hover:-translate-y-0.5"
                      >
                        <div className="mb-5 flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className="flex h-12 w-12 items-center justify-center rounded-xl shadow-sm"
                              style={{ backgroundColor: `${CHART_COLORS.purple[idx % CHART_COLORS.purple.length]}15` }}
                            >
                              <BookOpen
                                className="h-6 w-6"
                                style={{ color: CHART_COLORS.purple[idx % CHART_COLORS.purple.length] }}
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{item.program}</p>
                              <p className="mt-1.5 text-sm text-gray-500">
                                {item.schools} schools · {item.countries} {item.countries === 1 ? 'country' : 'countries'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">{item.students.toLocaleString()}</p>
                            <p className="mt-1 text-sm text-gray-500">{percent}% of total</p>
                          </div>
                        </div>
                        <div className="h-2 rounded-full bg-purple-100 overflow-hidden">
                          <motion.div
                            className="h-2 rounded-full bg-gradient-to-r from-purple-600 to-purple-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 0.8, delay: 0.4 + idx * 0.1, ease: "easeOut" }}
                          />
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        )
      }
      case 'schools': {
        const totalSchoolStudents = schoolDetails.reduce((sum, s) => sum + s.students, 0)
        const uniqueCountries = new Set(schoolDetails.map(s => s.country)).size

        return (
          <div className="space-y-10">
            {/* Hero stat with animated counter */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 p-8 text-white">
              <div className="relative z-10">
                <p className="text-sm font-medium text-blue-100">Partner Schools & Institutions</p>
                <p className="mt-2 text-5xl font-bold">
                  <AnimatedCounter value={programMetrics.institutions} />
                </p>
                <div className="mt-4 flex items-center gap-2 text-blue-100">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">{totalSchoolStudents.toLocaleString()} students across {uniqueCountries} countries</span>
                </div>
              </div>
              <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
            </div>

            {/* Schools list */}
            <div>
              <h4 className="mb-6 text-base font-semibold text-gray-900">Schools by student reach</h4>
              <div className="space-y-5">
                {schoolDetails.map((school, idx) => (
                  <motion.div
                    key={school.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    className="group rounded-xl bg-blue-50/50 border-l-4 border-blue-500 p-6 transition-all hover:bg-blue-50/80 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-xl shadow-sm"
                          style={{ backgroundColor: `${CHART_COLORS.blue[idx % CHART_COLORS.blue.length]}15` }}
                        >
                          <School
                            className="h-6 w-6"
                            style={{ color: CHART_COLORS.blue[idx % CHART_COLORS.blue.length] }}
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{school.name}</p>
                          <p className="mt-1.5 text-sm text-gray-500">
                            {school.flag} {school.city}, {school.country}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">{school.students.toLocaleString()}</p>
                        <p className="mt-1 text-sm text-gray-500">students</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )
      }
      case 'projects': {
        const activeProjectCount = projectDetails.filter((p) => p.status === 'active').length
        const totalProjectStudents = projectDetails.reduce((sum, p) => sum + p.studentsReached, 0)

        // Bar chart data for project comparison - use full names, truncate only if very long
        const barChartData = projectDetails.map((p, idx) => ({
          name: p.name.length > 20 ? p.name.substring(0, 18) + '...' : p.name,
          fullName: p.name,
          students: p.studentsReached,
          fill: p.status === 'active' ? CHART_COLORS.emerald[idx % 2] : '#9ca3af',
        }))

        return (
          <div className="space-y-10">
            {/* Hero stat with animated counter */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 text-white">
              <div className="relative z-10">
                <p className="text-sm font-medium text-emerald-100">Active Projects</p>
                <p className="mt-2 text-5xl font-bold">
                  <AnimatedCounter value={activeProjectCount} />
                </p>
                <div className="mt-4 flex items-center gap-2 text-emerald-100">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">{totalProjectStudents.toLocaleString()} students engaged</span>
                </div>
              </div>
              <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
            </div>

            {/* Bar chart - full width */}
            <motion.div
              className="rounded-xl border border-gray-100 bg-gray-50/30 p-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h4 className="mb-2 text-base font-semibold text-gray-900">Student Reach by Project</h4>
              <p className="mb-6 text-sm text-gray-500">Comparing impact across projects</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} layout="vertical" margin={{ left: 0, right: 50 }}>
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={130}
                      tick={{ fontSize: 12, fill: '#374151' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg">
                              <p className="text-sm font-medium text-gray-900">{data.fullName}</p>
                              <p className="text-sm text-gray-600">{data.students.toLocaleString()} students</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar
                      dataKey="students"
                      radius={[0, 6, 6, 0]}
                      animationBegin={200}
                      animationDuration={800}
                    >
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                      <LabelList
                        dataKey="students"
                        position="right"
                        formatter={(value: number) => value.toLocaleString()}
                        style={{ fontSize: 12, fill: '#374151', fontWeight: 500 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Projects list */}
            <div>
              <h4 className="mb-6 text-base font-semibold text-gray-900">Project Details</h4>
              <div className="space-y-5">
                {projectDetails.map((project, idx) => (
                  <motion.div
                    key={project.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    className="group rounded-xl bg-emerald-50/50 border-l-4 border-emerald-500 p-6 transition-all hover:bg-emerald-50/80 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-xl shadow-sm"
                          style={{
                            backgroundColor: project.status === 'active'
                              ? `${CHART_COLORS.emerald[idx % CHART_COLORS.emerald.length]}15`
                              : '#f3f4f6'
                          }}
                        >
                          <Target
                            className="h-6 w-6"
                            style={{
                              color: project.status === 'active'
                                ? CHART_COLORS.emerald[idx % CHART_COLORS.emerald.length]
                                : '#9ca3af'
                            }}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{project.name}</p>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                              project.status === 'active'
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${
                                project.status === 'active' ? 'bg-white' : 'bg-gray-400'
                              }`} />
                              {project.status}
                            </span>
                          </div>
                          <p className="mt-1.5 text-sm text-gray-500">
                            {project.flag} {project.partnerSchool || project.country}
                            {project.ageGroupBreakdown && project.ageGroupBreakdown.length > 0 && (
                              <span className="ml-2 text-xs text-gray-400">· Ages {project.ageGroupBreakdown[0].ageGroup}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">{project.studentsReached.toLocaleString()}</p>
                        <p className="mt-1 text-sm text-gray-500">{project.educatorsEngaged} educators</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
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

        // Bar chart data for educators by school - less aggressive truncation
        const schoolBarData = Object.entries(educatorsBySchool)
          .map(([school, data], idx) => ({
            name: school.length > 22 ? school.substring(0, 20) + '...' : school,
            fullName: school,
            educators: data.educators.length,
            fill: CHART_COLORS.amber[idx % CHART_COLORS.amber.length],
          }))
          .sort((a, b) => b.educators - a.educators)

        // Subject distribution
        const subjectCounts = educatorDetails.reduce((acc, e) => {
          acc[e.subject] = (acc[e.subject] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        const subjectData = Object.entries(subjectCounts)
          .map(([subject, count], idx) => ({
            name: subject,
            value: count,
            fill: CHART_COLORS.amber[idx % CHART_COLORS.amber.length],
          }))
          .sort((a, b) => b.value - a.value)

        return (
          <div className="space-y-10">
            {/* Hero stat with animated counter */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 p-8 text-white">
              <div className="relative z-10">
                <p className="text-sm font-medium text-amber-100">Engaged Educators</p>
                <p className="mt-2 text-5xl font-bold">
                  <AnimatedCounter value={educatorDetails.length} />
                </p>
                <div className="mt-4 flex items-center gap-2 text-amber-100">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">{totalProjects} projects · {uniqueSchools} schools · {uniqueCountries} countries</span>
                </div>
              </div>
              <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
            </div>

            {/* Charts row */}
            <div className="grid gap-10 lg:grid-cols-2">
              {/* Bar chart - educators by school */}
              <motion.div
                className="rounded-xl border border-gray-100 bg-gray-50/30 p-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h4 className="mb-2 text-base font-semibold text-gray-900">Educators by School</h4>
                <p className="mb-6 text-sm text-gray-500">Distribution across partner institutions</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={schoolBarData} layout="vertical" margin={{ left: 0, right: 40 }}>
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={140}
                        tick={{ fontSize: 12, fill: '#374151' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg">
                                <p className="text-sm font-medium text-gray-900">{data.fullName}</p>
                                <p className="text-sm text-gray-600">{data.educators} educators</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar
                        dataKey="educators"
                        radius={[0, 6, 6, 0]}
                        animationBegin={200}
                        animationDuration={800}
                      >
                        {schoolBarData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                        <LabelList
                          dataKey="educators"
                          position="right"
                          style={{ fontSize: 12, fill: '#374151', fontWeight: 500 }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Subject distribution with pie */}
              <motion.div
                className="rounded-xl border border-gray-100 bg-gray-50/30 p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <h4 className="mb-2 text-base font-semibold text-gray-900">Subject Areas</h4>
                <p className="mb-6 text-sm text-gray-500">Expertise across the network</p>
                <div className="flex items-center gap-6">
                  <div className="h-36 w-36 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={subjectData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                          animationBegin={100}
                          animationDuration={600}
                        >
                          {subjectData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-3">
                    {subjectData.slice(0, 4).map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                          <span className="text-sm font-medium text-gray-700">{item.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Educators grouped by school - enhanced list view */}
            <div>
              <h4 className="mb-6 text-base font-semibold text-gray-900">Educator Details</h4>
              <div className="space-y-5">
                {Object.entries(educatorsBySchool).map(([school, data], idx) => (
                  <motion.div
                    key={school}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + idx * 0.05 }}
                    className="group rounded-xl bg-amber-50/50 border-l-4 border-amber-500 p-6 transition-all hover:bg-amber-50/80 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="mb-5 flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-xl shadow-sm"
                          style={{ backgroundColor: `${CHART_COLORS.amber[idx % CHART_COLORS.amber.length]}15` }}
                        >
                          <School
                            className="h-6 w-6"
                            style={{ color: CHART_COLORS.amber[idx % CHART_COLORS.amber.length] }}
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{school}</p>
                          <p className="mt-1.5 text-sm text-gray-500">{data.flag} {data.country}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">{data.educators.length}</p>
                        <p className="mt-1 text-sm text-gray-500">educators</p>
                      </div>
                    </div>

                    {/* Educator cards with enhanced avatar and hover effect */}
                    <div className="flex flex-wrap gap-3">
                      {data.educators.map((educator, educatorIdx) => (
                        <motion.div
                          key={educator.name}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + idx * 0.05 + educatorIdx * 0.02 }}
                          className="flex items-center gap-3 rounded-lg bg-white/80 border border-amber-100 border-l-2 border-l-amber-400 px-3 py-2.5 shadow-sm transition-all hover:bg-amber-50 hover:border-amber-200 hover:border-l-amber-500 hover:shadow-md"
                        >
                          {getEducatorAvatar(educator.name) ? (
                            <img
                              src={getEducatorAvatar(educator.name)!}
                              alt={educator.name}
                              className="h-9 w-9 rounded-full object-cover shadow-sm ring-2 ring-amber-200"
                            />
                          ) : (
                            <div
                              className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold shadow-sm"
                              style={{
                                background: `linear-gradient(135deg, ${CHART_COLORS.amber[educatorIdx % CHART_COLORS.amber.length]}30, ${CHART_COLORS.amber[educatorIdx % CHART_COLORS.amber.length]}50)`,
                                color: CHART_COLORS.amber[educatorIdx % CHART_COLORS.amber.length],
                              }}
                            >
                              {educator.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-800">{educator.name}</span>
                            <span className="text-xs text-gray-500">{educator.subject} · Ages {educator.ageGroup}</span>
                          </div>
                          {educator.projectCount > 0 && (
                            <span className="ml-1 rounded-full bg-amber-500 text-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide shadow-sm">
                              {educator.projectCount} {educator.projectCount === 1 ? 'project' : 'projects'}
                            </span>
                          )}
                        </motion.div>
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
        <DialogContent className="sm:max-w-5xl lg:max-w-6xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-4">
              {selectedMetricData && (
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${selectedMetricData.bgColor}`}>
                  <selectedMetricData.icon className={`h-7 w-7 ${selectedMetricData.textColor}`} />
                </div>
              )}
              <div>
                <DialogTitle className="text-2xl">{selectedMetricData?.label}</DialogTitle>
                <p className="text-sm text-gray-500 mt-1">{selectedMetricData?.caption}</p>
              </div>
            </div>
          </DialogHeader>
          <div className="mt-6">
            {renderModalContent()}
          </div>
        </DialogContent>
      </Dialog>

      <section>
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
                Interactive map of UNICEF parent programs. Click on a country to see detailed metrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] w-full">
                <InteractiveMapWrapper countries={mapCountryData} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

    </div>
  )
}
