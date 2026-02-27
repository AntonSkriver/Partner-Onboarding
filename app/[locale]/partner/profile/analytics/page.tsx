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
import { getCurrentSession, isOnboardedUser } from '@/lib/auth/session'
import {
  EXCLUDED_INSTITUTION_IDS,
  TEACHER_AVATARS,
  type SchoolDetail,
  type ProjectDetail,
  type EducatorDetail,
} from '@/components/partner/analytics/shared'
import { StudentMetricModal } from '@/components/partner/analytics/student-metric-modal'
import { SchoolMetricModal } from '@/components/partner/analytics/school-metric-modal'
import { ProjectMetricModal } from '@/components/partner/analytics/project-metric-modal'
import { EducatorMetricModal } from '@/components/partner/analytics/educator-metric-modal'
import { ProgramMetricModal } from '@/components/partner/analytics/program-metric-modal'

type Organization = Database['public']['Tables']['organizations']['Row']

export default function PartnerAnalyticsPage() {
  const t = useTranslations('profile.analytics')
  const tDashboard = useTranslations('dashboard')
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [session] = useState(() => getCurrentSession())
  const { ready: prototypeReady, database } = usePrototypeDb()

  const normalizedOrganizationName = organization?.name
    ? organization.name.trim().toLowerCase()
    : null

  const partnerRecord = useMemo(() => {
    if (!database) return null
    if (isOnboardedUser(session)) return null
    if (normalizedOrganizationName) {
      const match = database.partners.find(
        (partner) => partner.organizationName.toLowerCase() === normalizedOrganizationName,
      )
      if (match) return match
    }
    return null
  }, [database, normalizedOrganizationName, session?.source])

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
      .map(({ _ids: _, ...school }) => {
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

    const educatorMap = new Map<string, EducatorDetail>()

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
    const groups: Record<string, { educators: EducatorDetail[]; status: string; description: string }> = {}

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
      const organizationName = session?.organization ?? 'Partner Organization'

      setOrganization({
        id: 'session-org',
        name: organizationName,
        organization_type: 'ngo',
        website: null,
        logo: null,
        short_description: null,
        primary_contacts: [],
        regions_of_operation: [],
        countries_of_operation: [],
        languages: [],
        sdg_tags: [],
        thematic_tags: [],
        verification_status: 'pending',
        brand_settings: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      })
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
        return (
          <StudentMetricModal
            programSummaries={programSummaries}
            studentsTotal={studentsTotal}
            countryImpact={countryImpact}
            focusCountries={focusCountries}
            studentBreakdown={studentBreakdown}
          />
        )
      case 'schools':
        return (
          <SchoolMetricModal
            schoolDetails={schoolDetails}
            activeStudentsBySchool={activeStudentsBySchool}
            schoolAgeRanges={schoolAgeRanges}
            filteredTotals={filteredTotals}
          />
        )
      case 'projects':
        return (
          <ProjectMetricModal
            projectDetails={projectDetails}
          />
        )
      case 'educators':
        return (
          <EducatorMetricModal
            educatorDetails={educatorDetails}
            educatorsByProject={educatorsByProject}
          />
        )
      case 'programs':
        return (
          <ProgramMetricModal
            programSummaries={programSummaries}
            studentBreakdown={studentBreakdown}
            countryImpact={countryImpact}
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

      {programSummaries.length === 0 ? (
        <Card>
          <CardContent className="space-y-4 p-10 text-center">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">{t('noAnalyticsTitle')}</h3>
            <p className="text-gray-500">{t('noAnalyticsDesc')}</p>
          </CardContent>
        </Card>
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}
