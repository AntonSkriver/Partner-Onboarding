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
  ChevronRight,
  BookOpen,
  TrendingUp,
  MapPin,
} from 'lucide-react'
import Image from 'next/image'
import { InteractiveMapWrapper, type CountryData } from '@/components/interactive-map-wrapper'
import { Database } from '@/lib/types/database'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import {
  buildProgramSummariesForPartner,
  type ProgramSummary,
} from '@/lib/programs/selectors'
import { getCountryDisplay } from '@/lib/countries'
import { getCurrentSession } from '@/lib/auth/session'
import { SDGIcon } from '@/components/sdg-icons'

type Organization = Database['public']['Tables']['organizations']['Row']

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
  return TEACHER_AVATARS[name] || null
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
  const t = useTranslations('profile.analytics')
  const tDashboard = useTranslations('dashboard')
  const tPrograms = useTranslations('programs')
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

        const creatorInstitutionId = creator?.institutionId
        const projectTeachers = creatorInstitutionId
          ? summary.teachers.filter(t => t.institutionId === creatorInstitutionId && !EXCLUDED_INSTITUTION_IDS.has(t.institutionId))
          : []

        const studentsReached = institution?.studentCount || 0
        const educatorsEngaged = projectTeachers.length || 1

        const template = project.templateId ? templateById.get(project.templateId) : null
        const projectName = template?.title || `${summary.program.name} Project ${projectIdx + 1}`

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
      project: string | null
    }>()

    programSummaries.forEach(summary => {
      summary.teachers.forEach(teacher => {
        if (EXCLUDED_INSTITUTION_IDS.has(teacher.institutionId)) return

        const institution = summary.institutions.find(i => i.id === teacher.institutionId)
        const { flag, name: countryName } = institution?.country
          ? getCountryDisplay(institution.country)
          : { flag: '', name: '' }

        const fullName = `${teacher.firstName} ${teacher.lastName}`.trim()
        const schoolName = institution?.name || 'Unknown'

        const key = `${fullName.toLowerCase()}-${schoolName.toLowerCase()}`

        if (educatorMap.has(key)) {
          const existing = educatorMap.get(key)!
          const additionalProjects = summary.projects.filter(p => p.createdById === teacher.id).length
          existing.projectCount += additionalProjects
          return
        }

        const projectCount = summary.projects.filter(p => p.createdById === teacher.id).length

        // Find the project this educator is associated with
        const associatedProject = summary.projects.find(p => {
          const projectCreator = summary.teachers.find(t => t.id === p.createdById)
          return projectCreator?.institutionId === teacher.institutionId
        })
        const templateById = new Map(
          (database?.programTemplates ?? []).map(t => [t.id, t])
        )
        const projectTemplate = associatedProject?.templateId ? templateById.get(associatedProject.templateId) : null
        const projectName = projectTemplate?.title || (associatedProject ? `${summary.program.name} Project` : null)

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
          project: projectName,
        })
      })
    })

    return Array.from(educatorMap.values()).sort((a, b) => b.projectCount - a.projectCount)
  }, [programSummaries, database])

  // Student breakdown by program
  const studentBreakdown = useMemo(() => {
    if (programSummaries.length === 0) return []

    return programSummaries.map(summary => {
      const validInstitutions = summary.institutions.filter(i => !EXCLUDED_INSTITUTION_IDS.has(i.id))
      const students = validInstitutions.reduce((sum, i) => sum + (i.studentCount || 0), 0)
      const countries = new Set(validInstitutions.map(i => i.country).filter(Boolean))
      const countryFlags = Array.from(countries).map(c => {
        const { flag, name } = getCountryDisplay(c)
        return `${name} ${flag}`
      }).join(' · ')

      return {
        program: summary.program.name,
        students,
        schools: validInstitutions.length,
        countries: countries.size,
        partners: countryFlags,
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

  // Derive focus countries — scoped to partner's own country
  const focusCountries = useMemo<string[]>(() => {
    if (partnerRecord?.country) return [partnerRecord.country]
    const countries = new Set<string>()
    programSummaries.forEach((summary) => {
      summary.institutions.forEach((inst) => {
        if (inst.country) countries.add(inst.country)
      })
    })
    return Array.from(countries)
  }, [programSummaries, partnerRecord])

  const focusSchoolCount = useMemo(() => {
    const focusSet = new Set<string>(focusCountries)
    const names = new Set<string>()

    programSummaries.forEach((summary) => {
      summary.institutions.forEach((inst) => {
        if (!focusSet.has(inst.country)) return
        const name = inst.name?.trim()
        if (name) {
          names.add(name.toLowerCase())
        }
      })
    })

    return names.size
  }, [programSummaries, focusCountries])

  const filteredTotals = useMemo(() => {
    const focusSet = new Set<string>(focusCountries)
    const programs = new Set<string>()

    programSummaries.forEach((summary) => {
      const hasFocusInstitution = summary.institutions.some((inst) =>
        focusSet.has(inst.country),
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

  // Active students per school (derived from project data)
  const activeStudentsBySchool = useMemo(() => {
    const map = new Map<string, number>()
    projectDetails.forEach(p => {
      if (p.partnerSchool && p.status === 'active') {
        const current = map.get(p.partnerSchool) || 0
        map.set(p.partnerSchool, current + p.studentsReached)
      }
    })
    return map
  }, [projectDetails])

  // Age ranges per school (derived from project data)
  const schoolAgeRanges = useMemo(() => {
    const map = new Map<string, Set<string>>()
    projectDetails.forEach(p => {
      if (p.partnerSchool) {
        if (!map.has(p.partnerSchool)) map.set(p.partnerSchool, new Set())
        map.get(p.partnerSchool)!.add(p.ageGroup)
      }
    })
    return map
  }, [projectDetails])

  // Educators grouped by project for richer display
  const educatorsByProject = useMemo(() => {
    const groups: Record<string, { educators: typeof educatorDetails; status: string; description: string }> = {}

    educatorDetails.forEach(educator => {
      const projectKey = educator.project || 'Onboarding'
      if (!groups[projectKey]) {
        groups[projectKey] = {
          educators: [],
          status: educator.project ? 'active' : 'onboarding',
          description: educator.project ? `${educator.school} collaboration` : 'Preparing for project participation',
        }
      }
      // Avoid duplicate educators in same project group
      if (!groups[projectKey].educators.find(e => e.name === educator.name)) {
        groups[projectKey].educators.push(educator)
      }
    })

    return groups
  }, [educatorDetails])

  // Map data for all focus countries
  const allMapData = useMemo<CountryData[]>(() => {
    const countryCoordinates: Record<string, [number, number]> = {
      'DK': [55.6761, 12.5683],
      'UK': [51.5074, -0.1278],
      'GB': [51.5074, -0.1278],
      'IT': [41.9028, 12.4964],
      'BR': [-23.5505, -46.6333],
      'MX': [19.4326, -99.1332],
      'IN': [12.9716, 77.5946],
    }
    const cityCoordinates: Record<string, [number, number]> = {
      Copenhagen: [55.6761, 12.5683],
      Aarhus: [56.1629, 10.2039],
      Aalborg: [57.0488, 9.9217],
      Odense: [55.4038, 10.4024],
      Esbjerg: [55.4765, 8.4594],
      London: [51.5074, -0.1278],
      Manchester: [53.4808, -2.2426],
      Birmingham: [52.4862, -1.8904],
      Palermo: [38.1157, 13.3615],
      Napoli: [40.8518, 14.2681],
      Roma: [41.9028, 12.4964],
      Catania: [37.5079, 15.0830],
      'São Paulo': [-23.5505, -46.6333],
      'Mexico City': [19.4326, -99.1332],
      Bangalore: [12.9716, 77.5946],
    }
    const schoolCoordinates: Record<string, [number, number]> = {
      'Ørestad Gymnasium': [55.6295, 12.6144],
      'Vesterbjerg Rettighedsskole': [57.0488, 9.9217],
      'Christianhavns rettighedskole': [55.6736, 12.5944],
      'Mørke Rettighedsskole': [56.3333, 10.4500],
      'London Rights School': [51.5074, -0.1278],
      'Manchester Rights School': [53.4808, -2.2426],
      'Punto Luce Palermo': [38.1157, 13.3615],
      'Punto Luce Napoli Sanità': [40.8518, 14.2681],
      'Punto Luce Roma Torre Maura': [41.8800, 12.5900],
      'Istituto Comprensivo Catania Est': [37.5079, 15.0830],
      'São Paulo Makerspace School': [-23.5505, -46.6333],
      'Escuela Creativa CDMX': [19.4326, -99.1332],
      'Bangalore Global School': [12.9716, 77.5946],
    }

    const focusSet = new Set<string>(focusCountries)

    return countryImpact
      .filter(entry => focusSet.has(entry.country))
      .map(entry => {
        const countrySchools = schoolDetails.filter(s => s.country === entry.countryLabel)

        return {
          id: entry.country.toLowerCase(),
          name: entry.countryLabel,
          flag: entry.flag,
          coordinates: countryCoordinates[entry.country] || [0, 0],
          metrics: {
            students: entry.students,
            schools: entry.institutions,
            educators: entry.teachers,
            projects: entry.projects,
            completedProjects: entry.completedProjects,
          },
          regions: entry.regions,
          engagementScore:
            entry.teachers > 0 && entry.projects > 0
              ? 4.0 + (entry.completedProjects / Math.max(entry.projects, 1)) * 0.5
              : 3.6,
          growthRate: 0.08,
          schools: countrySchools.length > 0
            ? countrySchools.map(school => ({
                name: school.name,
                city: school.city || '',
                students: school.students,
                activeStudents: activeStudentsBySchool.get(school.name) || 0,
                studentAgeRange: (() => {
                  const ranges = schoolAgeRanges.get(school.name)
                  return ranges ? Array.from(ranges).sort().join(', ') : undefined
                })(),
                educators: school.teachers,
                coordinates: schoolCoordinates[school.name] || (school.city ? cityCoordinates[school.city] : undefined),
              }))
            : [{
                name: entry.countryLabel,
                city: '',
                students: entry.students,
                educators: entry.teachers,
                coordinates: countryCoordinates[entry.country],
              }],
        }
      })
  }, [countryImpact, schoolDetails, focusCountries, activeStudentsBySchool, schoolAgeRanges])

  const headlineMetrics = [
    {
      id: 'students',
      label: t('studentsReached'),
      value: studentsTotal.toLocaleString(),
      caption: t('studentsReachedDesc'),
      icon: GraduationCap,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
    {
      id: 'educators',
      label: t('educatorsEngaged'),
      value: educatorDetails.length.toString(),
      caption: t('educatorsEngagedDesc'),
      icon: Users,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
    },
    {
      id: 'schools',
      label: t('schoolsInstitutions'),
      value: filteredTotals.institutions.toString(),
      caption: t('schoolsInstitutionsDesc'),
      icon: School,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      id: 'programs',
      label: t('programsMetric'),
      value: programSummaries.length.toString(),
      caption: t('programsMetricDesc'),
      icon: BookOpen,
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
    },
    {
      id: 'projects',
      label: t('activeProjects'),
      value: projectDetails.filter(p => p.status === 'active').length.toString(),
      caption: t('activeProjectsDesc'),
      icon: Target,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
    },
  ] as const

  useEffect(() => {
    loadOrganizationProfile()
  }, [])

  const loadOrganizationProfile = async () => {
    setLoading(true)
    try {
      const session = getCurrentSession()
      const organizationName =
        session?.organization ??
        database?.partners.find((partner) =>
          partner.organizationName.toLowerCase().includes('save the children italy'),
        )?.organizationName ??
        database?.partners[0]?.organizationName ??
        'Partner Organization'
      const matchedPartner = database?.partners.find(
        (partner) => partner.organizationName.toLowerCase() === organizationName.toLowerCase(),
      )

      const sampleOrg: Organization = {
        id: 'demo-org-id',
        name: organizationName,
        organization_type: 'ngo',
        website: matchedPartner?.website ?? 'https://class2class.org',
        logo: null,
        short_description:
          matchedPartner?.description ??
          'Connecting classrooms worldwide through collaborative learning experiences.',
        primary_contacts: [],
        regions_of_operation: ['Europe', 'Africa', 'Asia-Pacific'],
        countries_of_operation: ['Denmark', 'Mexico', 'Italy', 'Germany', 'Brazil', 'Finland'],
        languages: matchedPartner?.languages ?? ['English', 'Italian', 'Spanish'],
        sdg_tags: matchedPartner?.sdgFocus?.map((sdg) => sdg.replace('SDG ', '')) ?? ['4', '10', '16', '17'],
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
      case 'students': {
        const uniqueCountries = new Set<string>()
        programSummaries.forEach(summary => {
          summary.institutions
            .filter(i => !EXCLUDED_INSTITUTION_IDS.has(i.id) && i.country)
            .forEach(i => uniqueCountries.add(i.country))
        })

        // Age group distribution
        const ageGroupData = [
          { name: '12-14 years', value: Math.round(studentsTotal * 0.28), fill: '#8b5cf6' },
          { name: '14-16 years', value: Math.round(studentsTotal * 0.38), fill: '#a78bfa' },
          { name: '16-18 years', value: Math.round(studentsTotal * 0.34), fill: '#c4b5fd' },
        ]

        // Gender distribution
        const genderData = [
          { name: 'Female', value: Math.round(studentsTotal * 0.52), fill: '#ec4899' },
          { name: 'Male', value: Math.round(studentsTotal * 0.47), fill: '#3b82f6' },
          { name: 'Non-binary', value: Math.round(studentsTotal * 0.01), fill: '#8b5cf6' },
        ]

        // Country breakdown from countryImpact
        const focusImpact = countryImpact.filter(e => focusCountries.includes(e.country))
        const totalActiveStudents = focusImpact.reduce((sum, e) => sum + e.students, 0)

        return (
          <div className="space-y-10">
            {/* Hero stat with animated counter */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 p-8 text-white">
              <div className="relative z-10">
                <p className="text-sm font-medium text-purple-100">{t('totalStudentsReached')}</p>
                <p className="mt-2 text-5xl font-bold">
                  <AnimatedCounter value={studentsTotal} />
                </p>
                <div className="mt-4 flex items-center gap-2 text-purple-100">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Across {uniqueCountries.size} countries · {studentBreakdown.length} active programs</span>
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
                      const percent = studentsTotal > 0 ? Math.round((item.value / studentsTotal) * 100) : 0
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
                      const percent = studentsTotal > 0 ? Math.round((item.value / studentsTotal) * 100) : 0
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

            {/* Students by Country and Program breakdown */}
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
                  {focusImpact.map((entry, idx) => {
                    const percent = totalActiveStudents > 0 ? Math.round((entry.students / totalActiveStudents) * 100) : 0
                    const colors = idx === 0 ? { bg: 'bg-purple-100', bar: 'from-purple-600 to-purple-400', text: 'text-purple-600' } :
                                               { bg: 'bg-blue-100', bar: 'from-blue-600 to-blue-400', text: 'text-blue-600' }
                    return (
                      <div key={entry.country} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{entry.flag}</span>
                            <span className="font-semibold text-gray-900">{entry.countryLabel}</span>
                          </div>
                          <span className={`text-2xl font-bold ${colors.text}`}>{entry.students.toLocaleString()}</span>
                        </div>
                        <div className={`h-3 rounded-full ${colors.bg} overflow-hidden`}>
                          <motion.div
                            className={`h-3 rounded-full bg-gradient-to-r ${colors.bar}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 0.8, delay: 0.3 + idx * 0.1 }}
                          />
                        </div>
                        <p className="text-sm text-gray-500">{entry.institutions} schools · {percent}% of students</p>
                      </div>
                    )
                  })}
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
                    const percent = studentsTotal
                      ? Math.round((item.students / studentsTotal) * 100)
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
                              {item.partners && (
                                <p className="mt-2 text-sm text-gray-600">{item.partners}</p>
                              )}
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
        const totalActiveStudents = schoolDetails.reduce((sum, s) => sum + (activeStudentsBySchool.get(s.name) || 0), 0)
        const uniqueCountries = new Set(schoolDetails.map(s => s.country)).size

        return (
          <div className="space-y-10">
            {/* Hero stat with animated counter */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 p-8 text-white">
              <div className="relative z-10">
                <p className="text-sm font-medium text-blue-100">{t('partnerSchools')}</p>
                <p className="mt-2 text-5xl font-bold">
                  <AnimatedCounter value={filteredTotals.institutions} />
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-blue-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">{totalSchoolStudents.toLocaleString()} total students</span>
                  </div>
                  {totalActiveStudents > 0 && (
                    <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                      <Users className="h-3.5 w-3.5" />
                      <span className="text-sm">{totalActiveStudents.toLocaleString()} active in projects</span>
                    </div>
                  )}
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
                {schoolDetails.map((school, idx) => {
                  const activeStudents = activeStudentsBySchool.get(school.name) || 0
                  const ageRanges = schoolAgeRanges.get(school.name)
                  const ageRange = ageRanges ? Array.from(ageRanges).sort().join(', ') : null

                  return (
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
                              {ageRange && (
                                <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                                  Ages {ageRange}
                                </span>
                              )}
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
                          {activeStudents > 0 ? (
                            <p className="mt-1 text-sm font-medium text-emerald-600">{activeStudents} active</p>
                          ) : (
                            <p className="mt-1 text-sm text-gray-400">onboarding</p>
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

      case 'projects': {
        const activeProjectCount = projectDetails.filter(p => p.status === 'active').length
        const completedProjectCount = projectDetails.filter(p => p.status === 'completed').length
        const totalProjectStudents = projectDetails.reduce((sum, p) => sum + p.studentsReached, 0)

        return (
          <div className="space-y-10">
            {/* Hero stat with animated counter */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 text-white">
              <div className="relative z-10">
                <p className="text-sm font-medium text-emerald-100">{t('classProjects')}</p>
                <p className="mt-2 text-5xl font-bold">
                  <AnimatedCounter value={activeProjectCount + completedProjectCount} />
                </p>
                <div className="mt-4 flex items-center gap-4 text-emerald-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">{totalProjectStudents.toLocaleString()} students</span>
                  </div>
                  {completedProjectCount > 0 && (
                    <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                      <Target className="h-3.5 w-3.5" />
                      <span className="text-sm">{completedProjectCount} completed</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
            </div>

            {/* Project Cards */}
            <div>
              <h4 className="mb-6 text-base font-semibold text-gray-900">{t('projectsByImpact')}</h4>
              <div className="space-y-6">
                {projectDetails.map((project, idx) => {
                  const isCompleted = project.status === 'completed'

                  return (
                    <motion.div
                      key={project.name}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + idx * 0.08 }}
                      className={`group rounded-2xl border-2 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 ${
                        isCompleted
                          ? 'border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50'
                          : 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50'
                      }`}
                    >
                      {/* Project Header */}
                      <div className={`px-6 py-4 ${isCompleted ? 'bg-gray-100/50' : 'bg-emerald-100/50'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                isCompleted
                                  ? 'bg-gray-400 text-white'
                                  : 'bg-emerald-500 text-white'
                              }`}>
                                {isCompleted ? (
                                  'Completed'
                                ) : (
                                  <>
                                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                    Active
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex items-center gap-6 mt-4">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isCompleted ? 'bg-gray-200/50' : 'bg-emerald-200/50'}`}>
                            <GraduationCap className={`h-4 w-4 ${isCompleted ? 'text-gray-700' : 'text-emerald-700'}`} />
                            <span className={`text-sm font-semibold ${isCompleted ? 'text-gray-800' : 'text-emerald-800'}`}>
                              {project.studentsReached.toLocaleString()} students
                            </span>
                          </div>
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isCompleted ? 'bg-gray-200/50' : 'bg-emerald-200/50'}`}>
                            <Users className={`h-4 w-4 ${isCompleted ? 'text-gray-700' : 'text-emerald-700'}`} />
                            <span className={`text-sm font-semibold ${isCompleted ? 'text-gray-800' : 'text-emerald-800'}`}>
                              {project.educatorsEngaged} educators
                            </span>
                          </div>
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isCompleted ? 'bg-gray-200/50' : 'bg-emerald-200/50'}`}>
                            <BookOpen className={`h-4 w-4 ${isCompleted ? 'text-gray-700' : 'text-emerald-700'}`} />
                            <span className={`text-sm font-semibold ${isCompleted ? 'text-gray-800' : 'text-emerald-800'}`}>
                              Ages {project.ageGroup}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* School Info */}
                      {project.partnerSchool && (
                        <div className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${isCompleted ? 'bg-gray-100' : 'bg-emerald-100'}`}>
                              <School className={`h-5 w-5 ${isCompleted ? 'text-gray-600' : 'text-emerald-600'}`} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{project.partnerSchool}</p>
                              <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                                {project.flag && <span>{project.flag}</span>}
                                {project.country && (
                                  <>
                                    <MapPin className="h-3 w-3" />
                                    <span>{project.country}</span>
                                  </>
                                )}
                              </div>
                            </div>
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
        const activeEducators = educatorDetails.filter(e => e.project).length

        const projectColors = [
          '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4',
        ]

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
                {Object.entries(educatorsByProject).map(([project, data], idx) => {
                  const color = projectColors[idx % projectColors.length]
                  return (
                    <motion.div
                      key={project}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + idx * 0.08 }}
                      className="rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg"
                      style={{ borderColor: `${color}40` }}
                    >
                      {/* Project header */}
                      <div
                        className="px-6 py-4"
                        style={{ backgroundColor: `${color}10` }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-bold text-gray-900">{project}</h3>
                              <span
                                className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                                style={{
                                  backgroundColor: data.status === 'active' ? '#dcfce7' : '#f3f4f6',
                                  color: data.status === 'active' ? '#166534' : '#4b5563',
                                }}
                              >
                                {data.status}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{data.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold" style={{ color }}>{data.educators.length}</p>
                            <p className="text-xs text-gray-500">educators</p>
                          </div>
                        </div>
                      </div>

                      {/* Educator cards */}
                      <div className="p-6 bg-white">
                        <div className="flex flex-wrap gap-3">
                          {data.educators.map((educator, educatorIdx) => (
                            <motion.div
                              key={educator.name}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.3 + idx * 0.05 + educatorIdx * 0.02 }}
                              className="flex items-center gap-3 rounded-lg bg-gray-50 border px-4 py-3 shadow-sm transition-all hover:bg-white hover:shadow-md"
                              style={{ borderColor: `${color}30` }}
                            >
                              {getEducatorAvatar(educator.name) ? (
                                <img
                                  src={getEducatorAvatar(educator.name)!}
                                  alt={educator.name}
                                  className="h-10 w-10 rounded-full object-cover shadow-sm ring-2"
                                  style={{ '--tw-ring-color': `${color}40` } as React.CSSProperties}
                                />
                              ) : (
                                <div
                                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shadow-sm"
                                  style={{
                                    background: `linear-gradient(135deg, ${color}20, ${color}40)`,
                                    color,
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

        // Collect all SDGs from programs
        const allSdgs = new Set<number>()
        programSummaries.forEach(s => {
          (s.program.sdgFocus || []).forEach((sdg: number | string) => allSdgs.add(typeof sdg === 'number' ? sdg : parseInt(sdg)))
        })

        // Collect all CRC articles from programs
        const allCrcArticles = new Set<number>()
        programSummaries.forEach(s => {
          (s.program.crcFocus || []).forEach((article: string) => allCrcArticles.add(parseInt(article)))
        })

        return (
          <div className="space-y-10">
            {/* Hero stat with animated counter */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 p-8 text-white">
              <div className="relative z-10">
                <p className="text-sm font-medium text-indigo-100">{t('activePrograms')}</p>
                <p className="mt-2 text-5xl font-bold">
                  <AnimatedCounter value={programSummaries.length} />
                </p>
                <div className="mt-4 flex items-center gap-2 text-indigo-100">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">{totalStudents.toLocaleString()} students · {totalSchools} schools · {countryImpact.length} countries</span>
                </div>
              </div>
              <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
            </div>

            {/* Programs List */}
            <div>
              <h4 className="mb-6 text-base font-semibold text-gray-900">{tPrograms('programOverview')}</h4>
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
            {allSdgs.size > 0 && (
              <div className="rounded-xl border border-gray-100 bg-gray-50/30 p-6">
                <h4 className="mb-6 text-base font-semibold text-gray-900">{t('sdgFocusAreas')}</h4>
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
                  {Array.from(allSdgs).sort((a, b) => a - b).map((sdg) => (
                    <SDGIcon
                      key={sdg}
                      number={sdg}
                      size="lg"
                      showTitle={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* CRC Focus Areas */}
            {allCrcArticles.size > 0 && (
              <div className="rounded-xl border border-gray-100 bg-gray-50/30 p-6">
                <h4 className="mb-6 text-base font-semibold text-gray-900">{t('crcFocusAreas')}</h4>
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                  {Array.from(allCrcArticles).sort((a, b) => a - b).map((article) => {
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
            )}
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
          <h2 className="mb-2 text-lg font-semibold text-gray-900">{tDashboard('noOrgProfile')}</h2>
          <p className="text-gray-600">{tDashboard('pleaseCreateProfile')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-10">
      <ProfilePageHeader
        title={t('title')}
        description={t('subtitle')}
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
                {t('geographicReachDesc', { partner: partnerRecord?.organizationName ?? 'partner' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] w-full">
                <InteractiveMapWrapper countries={allMapData} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  )
}
