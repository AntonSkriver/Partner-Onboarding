'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { motion, useInView, useSpring, useTransform } from 'framer-motion'
import { ProfilePageHeader } from '@/components/profile/profile-page-header'
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
  ResponsiveContainer,
  Tooltip,
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
import { SDGIcon } from '@/components/sdg-icons'
import { InteractiveMapWrapper, type CountryData } from '@/components/interactive-map-wrapper'
import {
  getParentOrganizationProfilePreset,
} from '@/lib/parent/network'

type Organization = Database['public']['Tables']['organizations']['Row']

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
  const t = useTranslations('profile.analytics')
  const tDash = useTranslations('dashboard')
  const [_session, setSession] = useState(() => getCurrentSession())
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  usePrototypeDb()

  // Always use hardcoded metrics for consistent display
  const programMetrics = useMemo(() => {
    return {
      totalPrograms: 3,
      activePrograms: 3,
      coPartners: 2,
      coordinators: 4,
      institutions: 6, // 6 schools shown in schoolDetails
      teachers: 12, // 12 educators in educatorDetails
      students: 128, // Total from projectDetails
      projects: 3,
      activeProjects: 3, // 2 active + 1 looking-for-partner
      completedProjects: 0,
      templates: 3,
      pendingInvitations: 1, // Punto Luce Roma looking for partner
      countryCount: 2,
    }
  }, [])

  // Build detailed school data - always use hardcoded data for consistency
  // Active students must match projectDetails: Diritti in Gioco (48) + Escuelas por los Derechos (52) + Rights in Action Exchange (28) = 128 total
  const schoolDetails = useMemo<SchoolDetail[]>(() => {
    return [
      { name: 'Punto Luce Roma', country: 'Italy', flag: '🇮🇹', students: 850, activeStudents: 28, ageRange: '16-19', teachers: 4, city: 'Rome', schoolType: 'secondary', status: 'active', projectCount: 1 }, // Rights in Action Exchange
      { name: 'Istituto Comprensivo Milano Centro', country: 'Italy', flag: '🇮🇹', students: 540, activeStudents: 26, ageRange: '12-16', teachers: 3, city: 'Milan', schoolType: 'secondary', status: 'active', projectCount: 1 }, // Escuelas por los Derechos
      { name: 'Scuola Comunitaria Napoli Nord', country: 'Italy', flag: '🇮🇹', students: 380, activeStudents: 24, ageRange: '12-16', teachers: 2, city: 'Naples', schoolType: 'secondary', status: 'active', projectCount: 1 }, // Diritti in Gioco
      { name: 'Liceo Palermo Sud', country: 'Italy', flag: '🇮🇹', students: 420, activeStudents: 24, ageRange: '12-16', teachers: 3, city: 'Palermo', schoolType: 'secondary', status: 'active', projectCount: 1 }, // Diritti in Gioco
      { name: 'Escuela Comunitaria CDMX', country: 'Mexico', flag: '🇲🇽', students: 620, activeStudents: 0, ageRange: '12-18', teachers: 5, city: 'Mexico City', schoolType: 'secondary', status: 'onboarding', projectCount: 0 }, // No active project yet
      { name: 'Colegio Derechos Monterrey', country: 'Mexico', flag: '🇲🇽', students: 460, activeStudents: 26, ageRange: '11-16', teachers: 4, city: 'Monterrey', schoolType: 'secondary', status: 'active', projectCount: 1 }, // Escuelas por los Derechos
    ]
  }, [])

  // Build detailed project data
  // Build detailed project data with partner school pairings
  const projectDetails = useMemo<ProjectDetail[]>(() => {
    // Partner school pairings for Class2Class projects
    return [
      {
        name: 'Diritti in Gioco',
        description: 'Students explore child rights in their local communities through storytelling, civic mapping, and collaborative media.',
        studentsReached: 48,
        educatorsEngaged: 4,
        status: 'active',
        school1: {
          name: 'Liceo Palermo Sud',
          city: 'Palermo',
          country: 'Italy',
          flag: '🇮🇹',
          students: 24,
          educators: 2,
        },
        school2: {
          name: 'Scuola Comunitaria Napoli Nord',
          city: 'Naples',
          country: 'Italy',
          flag: '🇮🇹',
          students: 24,
          educators: 2,
        },
        ageGroup: '12-14',
        subject: 'Social Studies',
      },
      {
        name: 'Escuelas por los Derechos',
        description: 'An intercultural exchange where students compare rights in school life and design practical actions for their communities.',
        studentsReached: 52,
        educatorsEngaged: 4,
        status: 'active',
        school1: {
          name: 'Istituto Comprensivo Milano Centro',
          city: 'Milan',
          country: 'Italy',
          flag: '🇮🇹',
          students: 26,
          educators: 2,
        },
        school2: {
          name: 'Colegio Derechos Monterrey',
          city: 'Monterrey',
          country: 'Mexico',
          flag: '🇲🇽',
          students: 26,
          educators: 2,
        },
        ageGroup: '14-16',
        subject: 'Global Citizenship',
      },
      {
        name: 'Rights in Action Exchange',
        description: 'Punto Luce Roma is seeking a partner school to co-design action projects on child rights and social inclusion.',
        studentsReached: 28,
        educatorsEngaged: 2,
        status: 'looking-for-partner',
        school1: {
          name: 'Punto Luce Roma',
          city: 'Rome',
          country: 'Italy',
          flag: '🇮🇹',
          students: 28,
          educators: 2,
        },
        // No school2 - looking for partner
        ageGroup: '16-18',
        subject: 'Child Rights Education',
      },
    ]
  }, [])

  // Build educator details - always use hardcoded data for consistency
  const educatorDetails = useMemo(() => {
    return [
      // Rights in Action Exchange - Punto Luce Roma (looking for partner)
      { name: 'Giulia Ferraro', subject: 'Social Studies', school: 'Punto Luce Roma', country: 'Italy', flag: '🇮🇹', projectCount: 1, ageGroup: '16-18', project: 'Rights in Action Exchange' },
      { name: 'Marco Bianchi', subject: 'Art & Design', school: 'Punto Luce Roma', country: 'Italy', flag: '🇮🇹', projectCount: 1, ageGroup: '16-18', project: 'Rights in Action Exchange' },
      // Escuelas por los Derechos - Milano + Monterrey
      { name: 'Chiara Rossi', subject: 'History', school: 'Istituto Comprensivo Milano Centro', country: 'Italy', flag: '🇮🇹', projectCount: 1, ageGroup: '12-16', project: 'Escuelas por los Derechos' },
      { name: 'Luca Moretti', subject: 'Geography', school: 'Istituto Comprensivo Milano Centro', country: 'Italy', flag: '🇮🇹', projectCount: 1, ageGroup: '12-16', project: 'Escuelas por los Derechos' },
      { name: 'Valeria Soto', subject: 'English', school: 'Colegio Derechos Monterrey', country: 'Mexico', flag: '🇲🇽', projectCount: 1, ageGroup: '12-14', project: 'Escuelas por los Derechos' },
      { name: 'Alejandro Rios', subject: 'Social Development', school: 'Colegio Derechos Monterrey', country: 'Mexico', flag: '🇲🇽', projectCount: 1, ageGroup: '11-16', project: 'Escuelas por los Derechos' },
      // Diritti in Gioco - Palermo + Napoli
      { name: 'Paola Greco', subject: 'Environmental Science', school: 'Liceo Palermo Sud', country: 'Italy', flag: '🇮🇹', projectCount: 1, ageGroup: '12-16', project: 'Diritti in Gioco' },
      { name: 'Antonio Marino', subject: 'Civics', school: 'Liceo Palermo Sud', country: 'Italy', flag: '🇮🇹', projectCount: 1, ageGroup: '12-16', project: 'Diritti in Gioco' },
      { name: 'Francesca Rinaldi', subject: 'Global Citizenship', school: 'Scuola Comunitaria Napoli Nord', country: 'Italy', flag: '🇮🇹', projectCount: 1, ageGroup: '12-16', project: 'Diritti in Gioco' },
      { name: 'Davide Esposito', subject: 'Italian', school: 'Scuola Comunitaria Napoli Nord', country: 'Italy', flag: '🇮🇹', projectCount: 1, ageGroup: '12-16', project: 'Diritti in Gioco' },
      // Escuela Comunitaria CDMX - onboarding (no active project yet)
      { name: 'Sofia Hernandez', subject: 'Science', school: 'Escuela Comunitaria CDMX', country: 'Mexico', flag: '🇲🇽', projectCount: 0, ageGroup: '14-16', project: null },
      { name: 'Diego Perez', subject: 'Environmental Studies', school: 'Escuela Comunitaria CDMX', country: 'Mexico', flag: '🇲🇽', projectCount: 0, ageGroup: '14-18', project: null },
    ]
  }, [])

  // Student breakdown by program - always use hardcoded data for consistency
  const studentBreakdown = useMemo(() => {
    return [
      { program: 'Diritti in Gioco', students: 48, schools: 2, countries: 1, ageGroup: '12-14', partners: 'Save the Children Italy 🇮🇹' },
      { program: 'Escuelas por los Derechos', students: 52, schools: 2, countries: 1, ageGroup: '14-16', partners: 'Save the Children Mexico 🇲🇽' },
      { program: 'Rights in Action Exchange', students: 28, schools: 1, countries: 2, ageGroup: '16-18', partners: 'Save the Children Italy 🇮🇹 · Save the Children Mexico 🇲🇽', status: 'seeking partner' },
    ]
  }, [])

  const headlineMetrics = [
    {
      id: 'students',
      label: t('studentsReached'),
      value: programMetrics.students.toLocaleString(),
      caption: t('studentsReachedDesc'),
      icon: GraduationCap,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
    {
      id: 'educators',
      label: t('educatorsEngaged'),
      value: programMetrics.teachers.toString(),
      caption: t('educatorsEngagedDesc'),
      icon: Users,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
    },
    {
      id: 'schools',
      label: t('schoolsInstitutions'),
      value: programMetrics.institutions.toString(),
      caption: t('schoolsInstitutionsDesc'),
      icon: School,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      id: 'programs',
      label: t('programsMetric'),
      value: programMetrics.totalPrograms.toString(),
      caption: t('programsMetricDesc'),
      icon: BookOpen,
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
    },
    {
      id: 'projects',
      label: t('activeProjects'),
      value: programMetrics.activeProjects.toString(),
      caption: t('activeProjectsDesc'),
      icon: Target,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
    },
  ] as const

  // Transform data for interactive map - use hardcoded data with reliable coordinates
  // Active students: IT (28+26+24+24=102), MX (0+26+0=26) = 128 total matching projectDetails
  const mapCountryData = useMemo<CountryData[]>(() => {
    return [
      {
        id: 'it',
        name: 'Italy',
        flag: '🇮🇹',
        coordinates: [41.9028, 12.4964],
        metrics: { students: 2190, schools: 4, educators: 8, projects: 3, completedProjects: 0 },
        regions: ['Lazio', 'Lombardy', 'Campania', 'Sicily'],
        engagementScore: 4.2,
        growthRate: 0.15,
        schools: [
          { name: 'Punto Luce Roma', city: 'Rome', students: 850, activeStudents: 28, studentAgeRange: '16-19', educators: 2, projects: ['Rights in Action Exchange'], coordinates: [41.9028, 12.4964] as [number, number] },
          { name: 'Istituto Comprensivo Milano Centro', city: 'Milan', students: 540, activeStudents: 26, studentAgeRange: '12-16', educators: 2, projects: ['Escuelas por los Derechos'], coordinates: [45.4642, 9.19] as [number, number] },
          { name: 'Scuola Comunitaria Napoli Nord', city: 'Naples', students: 380, activeStudents: 24, studentAgeRange: '12-16', educators: 2, projects: ['Diritti in Gioco'], coordinates: [40.8518, 14.2681] as [number, number] },
          { name: 'Liceo Palermo Sud', city: 'Palermo', students: 420, activeStudents: 24, studentAgeRange: '12-16', educators: 2, projects: ['Diritti in Gioco'], coordinates: [38.1157, 13.3615] as [number, number] },
        ],
      },
      {
        id: 'mx',
        name: 'Mexico',
        flag: '🇲🇽',
        coordinates: [19.4326, -99.1332],
        metrics: { students: 1080, schools: 2, educators: 4, projects: 1, completedProjects: 0 },
        regions: ['Mexico City', 'Nuevo Leon'],
        engagementScore: 3.8,
        growthRate: 0.12,
        schools: [
          { name: 'Escuela Comunitaria CDMX', city: 'Mexico City', students: 620, activeStudents: 0, studentAgeRange: '12-18', educators: 2, projects: [], coordinates: [19.4326, -99.1332] as [number, number] },
          { name: 'Colegio Derechos Monterrey', city: 'Monterrey', students: 460, activeStudents: 26, studentAgeRange: '11-16', educators: 2, projects: ['Escuelas por los Derechos'], coordinates: [25.6866, -100.3161] as [number, number] },
        ],
      },
    ]
  }, [])

  useEffect(() => {
    setSession(getCurrentSession())
    loadOrganizationProfile()
  }, [])

  const loadOrganizationProfile = async () => {
    setLoading(true)
    try {
      const currentSession = getCurrentSession()
      if (!currentSession || currentSession.role !== 'parent') {
        return
      }

      const preset = getParentOrganizationProfilePreset(currentSession.organization)

      const sampleOrg: Organization = {
        id: 'demo-org-id',
        name: preset.name,
        organization_type: 'ngo',
        website: preset.website,
        logo: null,
        short_description: preset.shortDescription,
        primary_contacts: [],
        regions_of_operation: ['Global'],
        countries_of_operation: preset.countries,
        languages: preset.languages,
        sdg_tags: preset.sdgTags,
        thematic_tags: preset.thematicTags,
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
        const countryCount = 2 // Italy and Mexico

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
                <p className="text-sm font-medium text-purple-100">{t('totalStudentsReached')}</p>
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
                <h4 className="mb-4 text-base font-semibold text-gray-900">{t('ageDistribution')}</h4>
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
                <h4 className="mb-4 text-base font-semibold text-gray-900">{t('genderDistribution')}</h4>
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
              {/* Students by Country */}
              <motion.div
                className="rounded-xl border border-gray-100 bg-gray-50/30 p-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h4 className="mb-6 text-base font-semibold text-gray-900">{t('studentsByCountry')}</h4>
                <div className="space-y-6">
                  {/* Italy */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🇮🇹</span>
                        <span className="font-semibold text-gray-900">Italy</span>
                      </div>
                      <span className="text-2xl font-bold text-purple-600">102</span>
                    </div>
                    <div className="h-3 rounded-full bg-purple-100 overflow-hidden">
                      <motion.div
                        className="h-3 rounded-full bg-gradient-to-r from-purple-600 to-purple-400"
                        initial={{ width: 0 }}
                        animate={{ width: '80%' }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      />
                    </div>
                    <p className="text-sm text-gray-500">4 schools · 80% of students</p>
                  </div>
                  {/* Mexico */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🇲🇽</span>
                        <span className="font-semibold text-gray-900">Mexico</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">26</span>
                    </div>
                    <div className="h-3 rounded-full bg-blue-100 overflow-hidden">
                      <motion.div
                        className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
                        initial={{ width: 0 }}
                        animate={{ width: '20%' }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                      />
                    </div>
                    <p className="text-sm text-gray-500">1 school active · 20% of students</p>
                  </div>
                </div>
              </motion.div>

              {/* Program breakdown list */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
              >
                <h4 className="mb-6 text-base font-semibold text-gray-900">{t('programDetails')}</h4>
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
                                {item.schools} schools · Ages {item.ageGroup}
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className="text-sm text-gray-600">{item.partners}</span>
                                {item.status && (
                                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                    {item.status}
                                  </span>
                                )}
                              </div>
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
                <p className="text-sm font-medium text-blue-100">{t('partnerSchools')}</p>
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
              <h4 className="mb-6 text-base font-semibold text-gray-900">{t('schoolsByReach')}</h4>
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
                <p className="text-sm font-medium text-emerald-100">{t('classProjects')}</p>
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
                                    {t('lookingForPartner')}
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
                                  <p className="font-semibold text-amber-800">{t('lookingForPartner')}</p>
                                  <p className="text-sm text-amber-600 mt-0.5">{t('connectSchool')}</p>
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
        const activeEducators = educatorDetails.filter(e => e.project).length

        // Group educators by project
        const educatorsByProject = educatorDetails.reduce((acc, educator) => {
          const projectKey = educator.project || 'Onboarding'
          if (!acc[projectKey]) {
            acc[projectKey] = []
          }
          acc[projectKey].push(educator)
          return acc
        }, {} as Record<string, typeof educatorDetails>)

        // Project colors and status
        const projectInfo: Record<string, { color: string; status: string; description: string }> = {
          'Diritti in Gioco': { color: '#10b981', status: 'active', description: 'Palermo + Napoli collaboration' },
          'Escuelas por los Derechos': { color: '#3b82f6', status: 'active', description: 'Milan + Monterrey exchange' },
          'Rights in Action Exchange': { color: '#f59e0b', status: 'seeking partner', description: 'Punto Luce Roma seeking cross-country partner' },
          'Onboarding': { color: '#9ca3af', status: 'onboarding', description: 'Preparing for project participation' },
        }

        return (
          <div className="space-y-10">
            {/* Hero stat with animated counter */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 p-8 text-white">
              <div className="relative z-10">
                <p className="text-sm font-medium text-amber-100">Engaged Educators</p>
                <p className="mt-2 text-5xl font-bold">
                  <AnimatedCounter value={educatorDetails.length} />
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-amber-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">{activeEducators} in active projects</span>
                  </div>
                  <span className="text-sm">{uniqueSchools} schools · {uniqueCountries} countries</span>
                </div>
              </div>
              <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
            </div>

            {/* Educators grouped by project */}
            <div>
              <h4 className="mb-6 text-base font-semibold text-gray-900">{t('educatorsByProject')}</h4>
              <div className="space-y-6">
                {Object.entries(educatorsByProject).map(([project, educators], idx) => {
                  const info = projectInfo[project] || { color: '#9ca3af', status: 'unknown', description: '' }
                  return (
                    <motion.div
                      key={project}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + idx * 0.08 }}
                      className="rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg"
                      style={{ borderColor: `${info.color}40` }}
                    >
                      {/* Project header */}
                      <div
                        className="px-6 py-4"
                        style={{ backgroundColor: `${info.color}10` }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-bold text-gray-900">{project}</h3>
                              <span
                                className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                                style={{
                                  backgroundColor: info.status === 'active' ? '#dcfce7' : info.status === 'seeking partner' ? '#fef3c7' : '#f3f4f6',
                                  color: info.status === 'active' ? '#166534' : info.status === 'seeking partner' ? '#92400e' : '#4b5563',
                                }}
                              >
                                {info.status}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{info.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold" style={{ color: info.color }}>{educators.length}</p>
                            <p className="text-xs text-gray-500">educators</p>
                          </div>
                        </div>
                      </div>

                      {/* Educator cards */}
                      <div className="p-6 bg-white">
                        <div className="flex flex-wrap gap-3">
                          {educators.map((educator, educatorIdx) => (
                            <motion.div
                              key={educator.name}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.3 + idx * 0.05 + educatorIdx * 0.02 }}
                              className="flex items-center gap-3 rounded-lg bg-gray-50 border px-4 py-3 shadow-sm transition-all hover:bg-white hover:shadow-md"
                              style={{ borderColor: `${info.color}30` }}
                            >
                              {getEducatorAvatar(educator.name) ? (
                                <img
                                  src={getEducatorAvatar(educator.name)!}
                                  alt={educator.name}
                                  className="h-10 w-10 rounded-full object-cover shadow-sm ring-2"
                                  style={{ '--tw-ring-color': `${info.color}40` } as React.CSSProperties}
                                />
                              ) : (
                                <div
                                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shadow-sm"
                                  style={{
                                    background: `linear-gradient(135deg, ${info.color}20, ${info.color}40)`,
                                    color: info.color,
                                  }}
                                >
                                  {educator.name.split(' ').map(n => n[0]).join('')}
                                </div>
                              )}
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-800">{educator.name}</span>
                                <span className="text-xs text-gray-500">{educator.subject} · Ages {educator.ageGroup}</span>
                                <span className="text-xs text-gray-400">{educator.flag} {educator.school}</span>
                              </div>
                            </motion.div>
                          ))}
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
      case 'programs': {
        const totalStudents = studentBreakdown.reduce((sum, p) => sum + p.students, 0)
        const totalSchools = studentBreakdown.reduce((sum, p) => sum + p.schools, 0)

        return (
          <div className="space-y-10">
            {/* Hero stat with animated counter */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 p-8 text-white">
              <div className="relative z-10">
                <p className="text-sm font-medium text-indigo-100">{t('activePrograms')}</p>
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
              <h4 className="mb-6 text-base font-semibold text-gray-900">{t('sdgFocusAreas')}</h4>
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
              <h4 className="mb-6 text-base font-semibold text-gray-900">{t('crcFocusAreas')}</h4>
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
          <h2 className="mb-2 text-lg font-semibold text-gray-900">{tDash('noOrgProfile')}</h2>
          <p className="text-gray-600">{tDash('pleaseCreateProfile')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-10">
      <ProfilePageHeader
        title={t('title')}
        description={
          <>
            {t('subtitle')}
          </>
        }
        className="space-y-2"
      />

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
                {t('geographicReach')}
              </CardTitle>
              <CardDescription>
                {t('geographicReachDesc', { partner: organization?.name ?? 'parent' })}
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
