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
  ArrowLeftRight,
  Search,
  MapPin,
} from 'lucide-react'
import Image from 'next/image'
import { getCurrentSession } from '@/lib/auth/session'
import { Database } from '@/lib/types/database'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { SDGIcon, SDG_DATA } from '@/components/sdg-icons'
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

// CRC Article titles
const CRC_TITLES: Record<string, string> = {
  '2': 'Non-discrimination',
  '3': 'Best interests of child',
  '4': 'Implementation of rights',
  '6': 'Life, survival & development',
  '12': 'Respect for views of child',
  '13': 'Freedom of expression',
  '17': 'Access to information',
  '19': 'Protection from violence',
  '24': 'Health services',
  '28': 'Right to education',
  '29': 'Goals of education',
  '31': 'Leisure & play',
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
  activeStudents: number
  ageRange: string
  teachers: number
  city?: string
  schoolType?: 'primary' | 'secondary' | 'higher-ed'
  status?: 'active' | 'partial' | 'onboarding'
  projectCount?: number
}

interface PartnerSchoolInfo {
  name: string
  city: string
  country: string
  flag: string
  students: number
  educators: number
}

interface ProjectDetail {
  name: string
  description?: string
  studentsReached: number
  educatorsEngaged: number
  status: 'active' | 'completed' | 'looking-for-partner'
  school1: PartnerSchoolInfo
  school2?: PartnerSchoolInfo // Optional - if missing, school is looking for partner
  ageGroup: string
  subject?: string
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

  // Always use hardcoded metrics for consistent display
  const programMetrics = useMemo(() => {
    return {
      totalPrograms: 3,
      activePrograms: 3,
      coPartners: 2,
      coordinators: 4,
      institutions: 7, // 7 schools shown in schoolDetails
      teachers: 12, // 12 educators in educatorDetails
      students: 128, // Total from projectDetails
      projects: 3,
      activeProjects: 3, // 2 active + 1 looking-for-partner
      completedProjects: 0,
      templates: 3,
      pendingInvitations: 1, // Ørestad looking for partner
      countryCount: 2,
    }
  }, [])

  // Build detailed school data - always use hardcoded data for consistency
  const schoolDetails = useMemo<SchoolDetail[]>(() => {
    return [
      { name: 'Ørestad Gymnasium', country: 'Denmark', flag: '🇩🇰', students: 850, activeStudents: 156, ageRange: '16-19', teachers: 4, city: 'Copenhagen', schoolType: 'secondary', status: 'active', projectCount: 2 },
      { name: 'Christianhavns rettighedskole', country: 'Denmark', flag: '🇩🇰', students: 540, activeStudents: 48, ageRange: '12-16', teachers: 3, city: 'Copenhagen', schoolType: 'secondary', status: 'active', projectCount: 1 },
      { name: 'Mørke Rettighedsskole', country: 'Denmark', flag: '🇩🇰', students: 380, activeStudents: 24, ageRange: '12-16', teachers: 2, city: 'Mørke', schoolType: 'secondary', status: 'active', projectCount: 1 },
      { name: 'Vesterbjerg Rettighedsskole', country: 'Denmark', flag: '🇩🇰', students: 420, activeStudents: 24, ageRange: '12-16', teachers: 3, city: 'Aalborg', schoolType: 'secondary', status: 'active', projectCount: 1 },
      { name: 'London Climate Academy', country: 'United Kingdom', flag: '🇬🇧', students: 620, activeStudents: 145, ageRange: '12-18', teachers: 5, city: 'London', schoolType: 'secondary', status: 'active', projectCount: 1 },
      { name: 'Manchester Rights School', country: 'United Kingdom', flag: '🇬🇧', students: 460, activeStudents: 26, ageRange: '11-16', teachers: 4, city: 'Manchester', schoolType: 'secondary', status: 'active', projectCount: 1 },
      { name: 'Bristol Green School', country: 'United Kingdom', flag: '🇬🇧', students: 540, activeStudents: 0, ageRange: '11-16', teachers: 3, city: 'Bristol', schoolType: 'secondary', status: 'onboarding', projectCount: 0 },
    ]
  }, [])

  // Build detailed project data
  // Build detailed project data with partner school pairings
  const projectDetails = useMemo<ProjectDetail[]>(() => {
    // Partner school pairings for Class2Class projects
    return [
      {
        name: 'Communities in Focus',
        description: 'Students explore local communities and share cultural perspectives through collaborative storytelling and digital media.',
        studentsReached: 48,
        educatorsEngaged: 4,
        status: 'active',
        school1: {
          name: 'Vesterbjerg Rettighedsskole',
          city: 'Aalborg',
          country: 'Denmark',
          flag: '🇩🇰',
          students: 24,
          educators: 2,
        },
        school2: {
          name: 'Mørke Skole',
          city: 'Mørke',
          country: 'Denmark',
          flag: '🇩🇰',
          students: 24,
          educators: 2,
        },
        ageGroup: '12-14',
        subject: 'Social Studies',
      },
      {
        name: 'Child in the World',
        description: 'An intercultural exchange where students discover similarities and differences in daily life, traditions, and aspirations.',
        studentsReached: 52,
        educatorsEngaged: 4,
        status: 'active',
        school1: {
          name: 'Christianshavn Gymnasium',
          city: 'Copenhagen',
          country: 'Denmark',
          flag: '🇩🇰',
          students: 26,
          educators: 2,
        },
        school2: {
          name: 'Manchester International',
          city: 'Manchester',
          country: 'United Kingdom',
          flag: '🇬🇧',
          students: 26,
          educators: 2,
        },
        ageGroup: '14-16',
        subject: 'Global Citizenship',
      },
      {
        name: 'Climate Action Exchange',
        description: 'Ørestad Gymnasium is seeking a partner school to collaborate on climate awareness and sustainability projects.',
        studentsReached: 28,
        educatorsEngaged: 2,
        status: 'looking-for-partner',
        school1: {
          name: 'Ørestad Gymnasium',
          city: 'Copenhagen',
          country: 'Denmark',
          flag: '🇩🇰',
          students: 28,
          educators: 2,
        },
        // No school2 - looking for partner
        ageGroup: '16-18',
        subject: 'Environmental Science',
      },
    ]
  }, [])

  // Build educator details - always use hardcoded data for consistency
  const educatorDetails = useMemo(() => {
    return [
      // Denmark - Ørestad Gymnasium
      { name: 'Anne Holm', subject: 'Social Studies', school: 'Ørestad Gymnasium', country: 'Denmark', flag: '🇩🇰', projectCount: 2, ageGroup: '16-18' },
      { name: 'Jonas Madsen', subject: 'Art & Design', school: 'Ørestad Gymnasium', country: 'Denmark', flag: '🇩🇰', projectCount: 1, ageGroup: '16-18' },
      // Denmark - Christianhavns rettighedskole
      { name: 'Sofie Larsen', subject: 'History', school: 'Christianhavns rettighedskole', country: 'Denmark', flag: '🇩🇰', projectCount: 1, ageGroup: '12-16' },
      { name: 'Peter Andersen', subject: 'Geography', school: 'Christianhavns rettighedskole', country: 'Denmark', flag: '🇩🇰', projectCount: 1, ageGroup: '12-16' },
      // Denmark - Mørke Rettighedsskole
      { name: 'Ulla Jensen', subject: 'Global Citizenship', school: 'Mørke Rettighedsskole', country: 'Denmark', flag: '🇩🇰', projectCount: 1, ageGroup: '12-16' },
      { name: 'Mette Nielsen', subject: 'Danish', school: 'Mørke Rettighedsskole', country: 'Denmark', flag: '🇩🇰', projectCount: 1, ageGroup: '12-16' },
      // Denmark - Vesterbjerg Rettighedsskole
      { name: 'Karin Albrectsen', subject: 'Environmental Science', school: 'Vesterbjerg Rettighedsskole', country: 'Denmark', flag: '🇩🇰', projectCount: 1, ageGroup: '12-16' },
      { name: 'Henrik Møller', subject: 'Civics', school: 'Vesterbjerg Rettighedsskole', country: 'Denmark', flag: '🇩🇰', projectCount: 1, ageGroup: '12-16' },
      // UK - London Climate Academy
      { name: 'Sarah Johnson', subject: 'Science', school: 'London Climate Academy', country: 'United Kingdom', flag: '🇬🇧', projectCount: 1, ageGroup: '14-16' },
      { name: 'Michael Thompson', subject: 'Environmental Studies', school: 'London Climate Academy', country: 'United Kingdom', flag: '🇬🇧', projectCount: 1, ageGroup: '14-18' },
      // UK - Manchester Rights School
      { name: 'James Wilson', subject: 'English', school: 'Manchester Rights School', country: 'United Kingdom', flag: '🇬🇧', projectCount: 1, ageGroup: '12-14' },
      { name: 'Emma Roberts', subject: 'PSHE', school: 'Manchester Rights School', country: 'United Kingdom', flag: '🇬🇧', projectCount: 1, ageGroup: '11-16' },
    ]
  }, [])

  // Student breakdown by program - always use hardcoded data for consistency
  const studentBreakdown = useMemo(() => {
    return [
      { program: 'Communities in Focus', students: 48, schools: 2, countries: 1 },
      { program: 'Child in the World', students: 52, schools: 2, countries: 2 },
      { program: 'Climate Action Exchange', students: 28, schools: 1, countries: 1 },
    ]
  }, [])

  // Country impact - always use hardcoded data for consistency
  const countryImpact = useMemo(() => {
    return [
      {
        country: 'DK',
        countryLabel: 'Denmark',
        flag: '🇩🇰',
        institutions: 4,
        teachers: 8, // 2 Ørestad + 2 Christianhavns + 2 Mørke + 2 Vesterbjerg
        students: 2190,
        projects: 2,
        completedProjects: 0,
        regions: ['Capital Region', 'Central Denmark', 'North Denmark'],
      },
      {
        country: 'UK',
        countryLabel: 'United Kingdom',
        flag: '🇬🇧',
        institutions: 3,
        teachers: 4, // 2 London Climate Academy + 2 Manchester Rights School (Bristol onboarding)
        students: 1620,
        projects: 1,
        completedProjects: 0,
        regions: ['London', 'Manchester', 'Bristol'],
      },
    ]
  }, [])

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
      id: 'educators',
      label: 'Educators engaged',
      value: programMetrics.teachers.toString(),
      caption: 'Teachers collaborating with peers',
      icon: Users,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
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
      id: 'programs',
      label: 'Programs',
      value: programMetrics.totalPrograms.toString(),
      caption: 'Educational programs running',
      icon: BookOpen,
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
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
      value: '3',
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
        metrics: { students: 2700, schools: 4, educators: 12, projects: 2, completedProjects: 0 },
        regions: ['Capital Region', 'Central Denmark', 'North Denmark'],
        engagementScore: 4.2,
        growthRate: 0.15,
        schools: [
          { name: 'Ørestad Gymnasium', city: 'Copenhagen', students: 850, activeStudents: 156, studentAgeRange: '16-19', educators: 4, projects: ['Communities in Focus', 'Child in the World'], coordinates: [55.6295, 12.6144] as [number, number] },
          { name: 'Christianhavns rettighedskole', city: 'Copenhagen', students: 540, activeStudents: 48, studentAgeRange: '12-16', educators: 3, projects: ['Child in the World'], coordinates: [55.6736, 12.5944] as [number, number] },
          { name: 'Mørke Rettighedsskole', city: 'Mørke', students: 380, activeStudents: 24, studentAgeRange: '12-16', educators: 2, projects: ['Communities in Focus'], coordinates: [56.3333, 10.4500] as [number, number] },
          { name: 'Vesterbjerg Rettighedsskole', city: 'Aalborg', students: 420, activeStudents: 24, studentAgeRange: '12-16', educators: 3, projects: ['Communities in Focus'], coordinates: [57.0488, 9.9217] as [number, number] },
        ],
      },
      {
        id: 'uk',
        name: 'United Kingdom',
        flag: '🇬🇧',
        coordinates: [51.5074, -0.1278],
        metrics: { students: 2900, schools: 3, educators: 12, projects: 1, completedProjects: 0 },
        regions: ['London', 'Manchester', 'Bristol'],
        engagementScore: 3.8,
        growthRate: 0.12,
        schools: [
          { name: 'London Climate Academy', city: 'London', students: 620, activeStudents: 145, studentAgeRange: '12-18', educators: 5, projects: ['Climate Action'], coordinates: [51.5074, -0.1278] as [number, number] },
          { name: 'Manchester Rights School', city: 'Manchester', students: 460, activeStudents: 26, studentAgeRange: '11-16', educators: 4, projects: ['Child in the World'], coordinates: [53.4808, -2.2426] as [number, number] },
          { name: 'Bristol Green School', city: 'Bristol', students: 540, activeStudents: 0, studentAgeRange: '11-16', educators: 3, projects: [], coordinates: [51.4545, -2.5879] as [number, number] },
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
        const countryCount = 2 // Denmark and UK

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
        const totalActiveStudents = schoolDetails.reduce((sum, s) => sum + s.activeStudents, 0)
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
                <div className="mt-4 flex flex-wrap items-center gap-4 text-blue-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">{totalSchoolStudents.toLocaleString()} total students</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                    <Users className="h-3.5 w-3.5" />
                    <span className="text-sm">{totalActiveStudents} active in projects</span>
                  </div>
                  <span className="text-sm">{uniqueCountries} countries</span>
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
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                              Ages {school.ageRange}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                              {school.teachers} educators
                            </span>
                            {school.projectCount && school.projectCount > 0 && (
                              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                {school.projectCount} {school.projectCount === 1 ? 'project' : 'projects'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">{school.students.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">total students</p>
                        {school.activeStudents > 0 ? (
                          <p className="mt-1 text-sm font-medium text-emerald-600">{school.activeStudents} active</p>
                        ) : (
                          <p className="mt-1 text-sm text-gray-400">onboarding</p>
                        )}
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
        const lookingForPartnerCount = projectDetails.filter((p) => p.status === 'looking-for-partner').length
        const totalProjectStudents = projectDetails.reduce((sum, p) => sum + p.studentsReached, 0)

        return (
          <div className="space-y-10">
            {/* Hero stat with animated counter */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 text-white">
              <div className="relative z-10">
                <p className="text-sm font-medium text-emerald-100">Class2Class Projects</p>
                <p className="mt-2 text-5xl font-bold">
                  <AnimatedCounter value={activeProjectCount + lookingForPartnerCount} />
                </p>
                <div className="mt-4 flex items-center gap-4 text-emerald-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">{totalProjectStudents.toLocaleString()} students</span>
                  </div>
                  {lookingForPartnerCount > 0 && (
                    <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                      <Search className="h-3.5 w-3.5" />
                      <span className="text-sm">{lookingForPartnerCount} seeking partner</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
            </div>

            {/* Project Cards */}
            <div>
              <h4 className="mb-6 text-base font-semibold text-gray-900">Partner Class Projects</h4>
              <div className="space-y-6">
                {projectDetails.map((project, idx) => {
                  const isLookingForPartner = project.status === 'looking-for-partner'

                  return (
                    <motion.div
                      key={project.name}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + idx * 0.08 }}
                      className={`group rounded-2xl border-2 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 ${
                        isLookingForPartner
                          ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50'
                          : 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50'
                      }`}
                    >
                      {/* Project Header */}
                      <div className={`px-6 py-4 ${isLookingForPartner ? 'bg-amber-100/50' : 'bg-emerald-100/50'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                isLookingForPartner
                                  ? 'bg-amber-500 text-white'
                                  : project.status === 'active'
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-gray-400 text-white'
                              }`}>
                                {isLookingForPartner ? (
                                  <>
                                    <Search className="h-3 w-3" />
                                    Looking for Partner
                                  </>
                                ) : (
                                  <>
                                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                    Active
                                  </>
                                )}
                              </span>
                            </div>
                            {project.description && (
                              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{project.description}</p>
                            )}
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex items-center gap-6 mt-4">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isLookingForPartner ? 'bg-amber-200/50' : 'bg-emerald-200/50'}`}>
                            <GraduationCap className={`h-4 w-4 ${isLookingForPartner ? 'text-amber-700' : 'text-emerald-700'}`} />
                            <span className={`text-sm font-semibold ${isLookingForPartner ? 'text-amber-800' : 'text-emerald-800'}`}>
                              {project.studentsReached} students
                            </span>
                          </div>
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isLookingForPartner ? 'bg-amber-200/50' : 'bg-emerald-200/50'}`}>
                            <Users className={`h-4 w-4 ${isLookingForPartner ? 'text-amber-700' : 'text-emerald-700'}`} />
                            <span className={`text-sm font-semibold ${isLookingForPartner ? 'text-amber-800' : 'text-emerald-800'}`}>
                              {project.educatorsEngaged} educators
                            </span>
                          </div>
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isLookingForPartner ? 'bg-amber-200/50' : 'bg-emerald-200/50'}`}>
                            <BookOpen className={`h-4 w-4 ${isLookingForPartner ? 'text-amber-700' : 'text-emerald-700'}`} />
                            <span className={`text-sm font-semibold ${isLookingForPartner ? 'text-amber-800' : 'text-emerald-800'}`}>
                              Ages {project.ageGroup}
                            </span>
                          </div>
                          {project.subject && (
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isLookingForPartner ? 'bg-amber-200/50' : 'bg-emerald-200/50'}`}>
                              <Target className={`h-4 w-4 ${isLookingForPartner ? 'text-amber-700' : 'text-emerald-700'}`} />
                              <span className={`text-sm font-semibold ${isLookingForPartner ? 'text-amber-800' : 'text-emerald-800'}`}>
                                {project.subject}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Partner Schools Section */}
                      <div className="px-6 py-5">
                        <div className="flex items-center gap-3 mb-4">
                          <ArrowLeftRight className={`h-4 w-4 ${isLookingForPartner ? 'text-amber-500' : 'text-emerald-500'}`} />
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Partner Classes</span>
                        </div>

                        <div className="flex items-stretch gap-4">
                          {/* School 1 */}
                          <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                            <div className="flex items-start gap-3">
                              <div className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${isLookingForPartner ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                                <School className={`h-5 w-5 ${isLookingForPartner ? 'text-amber-600' : 'text-emerald-600'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">{project.school1.name}</p>
                                <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                                  <span>{project.school1.flag}</span>
                                  <MapPin className="h-3 w-3" />
                                  <span>{project.school1.city}, {project.school1.country}</span>
                                </div>
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="text-xs text-gray-500">
                                    <span className="font-semibold text-gray-700">{project.school1.students}</span> students
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    <span className="font-semibold text-gray-700">{project.school1.educators}</span> educators
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Connection Arrow */}
                          <div className="flex items-center justify-center">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                              isLookingForPartner ? 'bg-amber-100' : 'bg-emerald-100'
                            }`}>
                              <ArrowLeftRight className={`h-5 w-5 ${isLookingForPartner ? 'text-amber-500' : 'text-emerald-500'}`} />
                            </div>
                          </div>

                          {/* School 2 or Looking for Partner */}
                          {project.school2 ? (
                            <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 flex-shrink-0">
                                  <School className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 truncate">{project.school2.name}</p>
                                  <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                                    <span>{project.school2.flag}</span>
                                    <MapPin className="h-3 w-3" />
                                    <span>{project.school2.city}, {project.school2.country}</span>
                                  </div>
                                  <div className="flex items-center gap-4 mt-2">
                                    <span className="text-xs text-gray-500">
                                      <span className="font-semibold text-gray-700">{project.school2.students}</span> students
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      <span className="font-semibold text-gray-700">{project.school2.educators}</span> educators
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-dashed border-amber-300 p-4">
                              <div className="flex items-center gap-3 h-full">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 flex-shrink-0">
                                  <Search className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-amber-800">Looking for Partner School</p>
                                  <p className="text-sm text-amber-600 mt-0.5">Connect a school to start collaborating</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
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
      case 'programs': {
        const totalStudents = studentBreakdown.reduce((sum, p) => sum + p.students, 0)
        const totalSchools = studentBreakdown.reduce((sum, p) => sum + p.schools, 0)
        const uniqueCountries = new Set(studentBreakdown.flatMap(p => {
          // Approximation based on countries field
          return Array(p.countries).fill(0).map((_, i) => i)
        })).size || programMetrics.countryCount

        return (
          <div className="space-y-10">
            {/* Hero stat with animated counter */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 p-8 text-white">
              <div className="relative z-10">
                <p className="text-sm font-medium text-indigo-100">Active Programs</p>
                <p className="mt-2 text-5xl font-bold">
                  <AnimatedCounter value={programMetrics.totalPrograms} />
                </p>
                <div className="mt-4 flex items-center gap-2 text-indigo-100">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">{totalStudents.toLocaleString()} students · {totalSchools} schools · {programMetrics.countryCount} countries</span>
                </div>
              </div>
              <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
            </div>

            {/* Programs List */}
            <div>
              <h4 className="mb-6 text-base font-semibold text-gray-900">Program Overview</h4>
              <div className="space-y-5">
                {studentBreakdown.map((program, idx) => {
                  const percent = totalStudents > 0 ? Math.round((program.students / totalStudents) * 100) : 0
                  return (
                    <motion.div
                      key={program.program}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + idx * 0.05 }}
                      className="group rounded-xl bg-indigo-50/50 border-l-4 border-indigo-500 p-6 transition-all hover:bg-indigo-50/80 hover:shadow-md hover:-translate-y-0.5"
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
                            <p className="font-semibold text-gray-900">{program.program}</p>
                            <p className="mt-1.5 text-sm text-gray-500">
                              {program.schools} schools · {program.countries} {program.countries === 1 ? 'country' : 'countries'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">{program.students.toLocaleString()}</p>
                          <p className="mt-1 text-sm text-gray-500">students</p>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-indigo-100 overflow-hidden">
                        <motion.div
                          className="h-2 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 0.8, delay: 0.4 + idx * 0.1, ease: "easeOut" }}
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* SDG Focus Areas */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/30 p-6">
              <h4 className="mb-6 text-base font-semibold text-gray-900">SDG Focus Areas</h4>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
                {[4, 10, 13, 16, 17].map((sdg) => (
                  <SDGIcon
                    key={sdg}
                    number={sdg}
                    size="lg"
                    showTitle={true}
                  />
                ))}
              </div>
            </div>

            {/* CRC Focus Areas */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/30 p-6">
              <h4 className="mb-6 text-base font-semibold text-gray-900">CRC Focus Areas</h4>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                {[12, 13, 28, 29].map((article) => {
                  const paddedNum = article.toString().padStart(2, '0')
                  const imageUrl = `/crc/icons/article-${paddedNum}.png`
                  const articleTitle = CRC_TITLES[article.toString()] ?? `Article ${article}`

                  return (
                    <div key={article} className="flex flex-col items-center gap-2 text-center">
                      <div className="relative w-20 h-20">
                        <Image
                          src={imageUrl}
                          alt={`CRC Article ${article}: ${articleTitle}`}
                          fill
                          sizes="80px"
                          className="rounded object-contain"
                        />
                      </div>
                      <div className="max-w-[100px]">
                        <p className="text-sm font-medium text-gray-900 leading-tight">
                          Article {article}
                        </p>
                        <p className="text-xs text-gray-600 leading-tight mt-0.5">
                          {articleTitle}
                        </p>
                      </div>
                    </div>
                  )
                })}
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
        <div className="grid gap-4 md:grid-cols-5">
          <Skeleton className="h-32 rounded-2xl" />
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
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
