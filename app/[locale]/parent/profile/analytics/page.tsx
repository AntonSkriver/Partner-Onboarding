'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
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
import { InteractiveMapWrapper, type CountryData } from '@/components/interactive-map-wrapper'
import {
  getParentOrganizationProfilePreset,
} from '@/lib/parent/network'
import { StudentMetricModal } from '@/components/parent/analytics/student-metric-modal'
import { SchoolMetricModal } from '@/components/parent/analytics/school-metric-modal'
import { ProjectMetricModal } from '@/components/parent/analytics/project-metric-modal'
import { EducatorMetricModal } from '@/components/parent/analytics/educator-metric-modal'
import { ProgramMetricModal } from '@/components/parent/analytics/program-metric-modal'

type Organization = Database['public']['Tables']['organizations']['Row']

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
      case 'students':
        return (
          <StudentMetricModal
            totalStudents={programMetrics.students}
            studentBreakdown={studentBreakdown}
            t={t}
          />
        )
      case 'schools':
        return (
          <SchoolMetricModal
            schoolDetails={schoolDetails}
            totalInstitutions={programMetrics.institutions}
            t={t}
          />
        )
      case 'projects':
        return (
          <ProjectMetricModal
            projectDetails={projectDetails}
            t={t}
          />
        )
      case 'educators':
        return (
          <EducatorMetricModal
            educatorDetails={educatorDetails}
            t={t}
          />
        )
      case 'programs':
        return (
          <ProgramMetricModal
            studentBreakdown={studentBreakdown}
            totalPrograms={programMetrics.totalPrograms}
            countryCount={programMetrics.countryCount}
            t={t}
          />
        )
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
