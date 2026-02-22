'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { getCurrentSession, clearSession } from '@/lib/auth/session'
import { useRouter } from '@/i18n/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import {
  Plus,
  Target,
  Edit3,
  Clock,
  UserCheck,
  School,
  Megaphone,
  PenTool,
  MapPin,
  Mail,
  Users,
  ChevronDown,
  ChevronUp,
  Phone,
} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { usePrototypeDb } from '@/hooks/use-prototype-db'

const toStartCase = (value: string): string =>
  value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const formatProjectName = (projectId: string): string => {
  const normalized = projectId.replace(/^project[-_]/, '')
  return toStartCase(normalized || projectId)
}

const formatRelativeTime = (timestamp: string): string => {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) {
    return timestamp
  }

  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)

  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  }

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  }

  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 4) {
    return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`
  }

  return date.toLocaleDateString()
}

export default function PartnerDashboard() {
  const t = useTranslations('dashboard')
  const tc = useTranslations('common')
  const [activeTab, setActiveTab] = useState("overview")
  const [progress] = useState(78)
  const [session, setSession] = useState(getCurrentSession())
  const [expandedProjects, setExpandedProjects] = useState(new Set())
  const router = useRouter()
  const { ready: dataReady, database, selectors } = usePrototypeDb()
  const {
    programsForPartner,
    coPartnersForProgram,
    coordinatorsForProgram,
    institutionsForProgram,
    teachersForProgram,
    invitationsForProgram,
  } = selectors

  const partnerId = useMemo(() => {
    if (!dataReady || !session) return null

    const partners = database?.partners ?? []
    const normalizedOrganization = session.organization?.trim().toLowerCase()

    if (normalizedOrganization) {
      const directMatch = partners.find(
        (partner) => partner.organizationName.toLowerCase() === normalizedOrganization
      )
      if (directMatch) {
        return directMatch.id
      }
    }

    const email = session.email?.toLowerCase() ?? ''
    if (email.includes('lego')) return 'partner-lego-foundation'
    if (email.includes('unicef')) return 'partner-unicef'
    if (email.includes('ngo')) return 'partner-save-the-children'
    if (email.includes('partner')) return 'partner-save-the-children'

    return partners.length > 0 ? partners[0].id : null
  }, [dataReady, session, database])

  const partnerRecord = useMemo(() => {
    if (!dataReady || !partnerId || !database) return null
    return database.partners.find((partner) => partner.id === partnerId) ?? null
  }, [dataReady, partnerId, database])

  const partnerUser = useMemo(() => {
    if (!dataReady || !database || !session?.email) return null
    const normalizedEmail = session.email.toLowerCase()
    return database.partnerUsers.find(
      (user) => user.email.toLowerCase() === normalizedEmail,
    ) ?? null
  }, [dataReady, database, session?.email])

  const partnerPrograms = useMemo(() => {
    if (!partnerId || !database) return []

    const ownedPrograms = programsForPartner(partnerId)
    const relatedProgramIds = database.programPartners
      .filter((relationship) => relationship.partnerId === partnerId)
      .map((relationship) => relationship.programId)

    const relatedPrograms = database.programs.filter((program) =>
      relatedProgramIds.includes(program.id),
    )

    const map = new Map<string, (typeof database.programs)[number]>()
    for (const program of [...ownedPrograms, ...relatedPrograms]) {
      map.set(program.id, program)
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf(),
    )
  }, [database, partnerId, programsForPartner])

  const programSummaries = useMemo(() => {
    if (!database) return []

    return partnerPrograms.map((program) => {
      const coPartnerEntries = coPartnersForProgram(program.id).filter(
        ({ relationship }) => relationship.status === 'accepted',
      )
      const coordinators = coordinatorsForProgram(program.id)
      const institutions = institutionsForProgram(program.id)
      const teachers = teachersForProgram(program.id)
      const projects = database.programProjects.filter((project) => project.programId === program.id)
      const invitations = invitationsForProgram(program.id)
      const activities = database.activities.filter((activity) => activity.programId === program.id)
      const studentCount = institutions.reduce(
        (total, institution) => total + (institution.studentCount ?? 0),
        0,
      )
      const activeInstitutionCount = institutions.filter(
        (institution) => institution.status === 'active',
      ).length
      const countrySet = new Set<string>([
        ...program.countriesInScope,
        ...institutions.map((institution) => institution.country),
        ...coordinators.map((coordinator) => coordinator.country),
      ])

      return {
        program,
        coPartners: coPartnerEntries,
        coordinators,
        institutions,
        teachers,
        projects,
        invitations,
        activities,
        metrics: {
          studentCount,
          institutionCount: institutions.length,
          activeInstitutionCount,
          teacherCount: teachers.length,
          coordinatorCount: coordinators.length,
          coPartnerCount: coPartnerEntries.length,
          projectCount: projects.length,
          pendingInvitations: invitations.filter((invitation) => invitation.status === 'pending')
            .length,
          countries: Array.from(countrySet),
        },
      }
    })
  }, [
    database,
    partnerPrograms,
    coPartnersForProgram,
    coordinatorsForProgram,
    institutionsForProgram,
    teachersForProgram,
    invitationsForProgram,
  ])

  const partnerMetrics = useMemo(() => {
    if (programSummaries.length === 0) {
      return {
        totalPrograms: 0,
        activePrograms: 0,
        coPartners: 0,
        coordinators: 0,
        institutions: 0,
        teachers: 0,
        students: 0,
        projects: 0,
        pendingInvitations: 0,
        countryCount: 0,
      }
    }

    const countries = new Set<string>()
    let coPartners = 0
    let coordinators = 0
    let institutions = 0
    let teachers = 0
    let students = 0
    let projects = 0
    let pendingInvitations = 0

    for (const summary of programSummaries) {
      coPartners += summary.metrics.coPartnerCount
      coordinators += summary.metrics.coordinatorCount
      institutions += summary.metrics.institutionCount
      teachers += summary.metrics.teacherCount
      students += summary.metrics.studentCount
      projects += summary.metrics.projectCount
      pendingInvitations += summary.metrics.pendingInvitations

      summary.metrics.countries.forEach((country) => {
        countries.add(country)
      })
    }

    return {
      totalPrograms: programSummaries.length,
      activePrograms: programSummaries.filter((summary) => summary.program.status === 'active')
        .length,
      coPartners,
      coordinators,
      institutions,
      teachers,
      students,
      projects,
      pendingInvitations,
      countryCount: countries.size,
    }
  }, [programSummaries])

  const recentActivity = useMemo(() => {
    const items = programSummaries.flatMap((summary) =>
      summary.activities.map((activity) => ({
        activity,
        program: summary.program,
      })),
    )

    return items
      .sort(
        (a, b) =>
          new Date(b.activity.timestamp).valueOf() - new Date(a.activity.timestamp).valueOf(),
      )
      .slice(0, 6)
  }, [programSummaries])

  const programProjectGroups = useMemo(() => {
    if (!database) return []

    const resolveCreatedByName = (type: string, id: string): string => {
      if (type === 'partner') {
        const partnerUserRecord = database.partnerUsers.find((user) => user.id === id)
        return partnerUserRecord
          ? `${partnerUserRecord.firstName ?? ''} ${partnerUserRecord.lastName ?? ''}`.trim() ||
              partnerUserRecord.email
          : 'Partner Team'
      }

      if (type === 'coordinator') {
        const coordinator = database.coordinators.find((item) => item.id === id)
        return coordinator
          ? `${coordinator.firstName} ${coordinator.lastName}`.trim()
          : 'Program Coordinator'
      }

      if (type === 'teacher') {
        const teacher = database.institutionTeachers.find((item) => item.id === id)
        return teacher
          ? `${teacher.firstName} ${teacher.lastName}`.trim()
          : 'Teacher Team'
      }

      return 'Class2Class Team'
    }

    return programSummaries.map((summary) => ({
      program: summary.program,
      metrics: summary.metrics,
      coPartners: summary.coPartners,
      coordinators: summary.coordinators,
      institutions: summary.institutions,
      teachers: summary.teachers,
      projects: summary.projects.map((project) => {
        const associatedCoPartner = summary.coPartners.find(
          ({ relationship }) => relationship.id === project.associatedCoPartnerId,
        )

        return {
          ...project,
          displayName: formatProjectName(project.projectId),
          createdByName: resolveCreatedByName(project.createdByType, project.createdById),
          associatedCoPartnerName: associatedCoPartner?.partner?.organizationName,
        }
      }),
    }))
  }, [database, programSummaries])

  

  const isProgramsLoading = !dataReady || !partnerId
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  
  useEffect(() => {
    const currentSession = getCurrentSession()
    if (!currentSession || currentSession.role !== 'partner') {
      router.push('/partner/login')
      return
    }
    setSession(currentSession)
  }, [router])

  const handleLogout = () => {
    clearSession()
    router.push('/partner/login')
  }

  const toggleProjectDetails = (projectId: string) => {
    const newExpanded = new Set(expandedProjects)
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId)
    } else {
      newExpanded.add(projectId)
    }
    setExpandedProjects(newExpanded)
  }

  if (!session) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p>{tc('loading')}</p>
      </div>
    </div>
  }

  const greetingName =
    (partnerUser
      ? `${partnerUser.firstName ?? ''} ${partnerUser.lastName ?? ''}`.trim() || partnerUser.email
      : session.name?.trim()) || 'Partner User'

  const organizationTypeLabel = partnerRecord
    ? toStartCase(partnerRecord.organizationType)
    : 'Partner'

  const partnerRoleLabel = partnerUser?.role ? toStartCase(partnerUser.role) : 'Partner Team'

  const keyMetrics = [
    { id: 'programs', label: 'Programs', value: partnerMetrics.totalPrograms },
    { id: 'activePrograms', label: 'Active Programs', value: partnerMetrics.activePrograms },
    { id: 'projects', label: 'Projects', value: partnerMetrics.projects },
    { id: 'coPartners', label: 'Co-Partners', value: partnerMetrics.coPartners },
    { id: 'coordinators', label: 'Coordinators', value: partnerMetrics.coordinators },
    { id: 'institutions', label: 'Institutions', value: partnerMetrics.institutions },
    { id: 'teachers', label: 'Teachers', value: partnerMetrics.teachers },
    { id: 'students', label: 'Students (est.)', value: partnerMetrics.students, isLargeNumber: true },
    { id: 'countries', label: 'Countries', value: partnerMetrics.countryCount },
    { id: 'pendingInvites', label: 'Pending Invites', value: partnerMetrics.pendingInvitations },
  ]

  // Post-onboarding action items based on documentation
  const nextStepActions = [
    {
      id: "connect_schools",
      title: "Connect with Schools",
      description: "Connect and network with schools worldwide to join your projects",
      icon: School,
      action: "Connect with Schools",
      completed: false,
      priority: "high",
      href: "/connect"
    },
    {
      id: "create_content", 
      title: "Upload Educational Content",
      description: "Share your educational resources with partner schools",
      icon: PenTool,
      action: "Upload Content",
      completed: false,
      priority: "high",
      href: "/partner/content/upload"
    },
    {
      id: "launch_marketing",
      title: "Promote Your Mission",
      description: "Use marketing tools to attract schools to your cause",
      icon: Megaphone,
      action: "Start Campaign",
      completed: false,
      priority: "medium"
    },
    {
      id: "setup_projects",
      title: "Launch Collaborative Projects",
      description: "Create project frameworks for school collaboration",
      icon: Target,
      action: "Create Project",
      completed: false,
      priority: "medium",
      href: "/partner/projects/create"
    }
  ]

  const onboardingTasks = [
    { id: 1, text: "Complete organization profile", completed: true },
    { id: 2, text: "Select your SDG focus areas", completed: true },
    { id: 3, text: "Add mission statement and description", completed: true },
    { id: 4, text: "Upload organization logo and media", completed: true },
    { id: 5, text: "Set up team roles and permissions", completed: false },
    { id: 6, text: "Create your first project outline", completed: false }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 c2c-purple-bg rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">C2C</span>
            </div>
            <span className="font-semibold text-gray-800">Partner Dashboard</span>
          </div>
          
          {/* Navigation Items */}
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full text-left px-4 py-3 rounded-lg border border-gray-200 diagonal-stripes ${
                activeTab === "overview"
                  ? "bg-gray-100 text-gray-800 font-medium"
                  : "text-gray-500"
              }`}
            >
              <span className="text-sm">Overview</span>
            </button>
            <button
              onClick={() => setActiveTab("projects")}
              className={`w-full text-left px-4 py-3 rounded-lg border border-gray-200 diagonal-stripes ${
                activeTab === "projects"
                  ? "bg-gray-100 text-gray-800 font-medium"
                  : "text-gray-500"
              }`}
            >
              <span className="text-sm">Projects</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header Section - More Prominent */}
        <div className="bg-white border-b-2 border-gray-200 px-6 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-primary text-2xl font-bold text-gray-800 mb-1">{t('hi', { name: greetingName })}</h1>
              <p className="text-base text-c2c-purple font-semibold">{partnerRoleLabel}</p>
              <p className="text-sm text-gray-600 mt-2">
                {t('welcomeMessage', { type: organizationTypeLabel })}
              </p>
            </div>
            <div className="flex gap-3">
              <Link 
                href="/"
                className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700 shadow-sm"
              >
                {t('backToHome')}
              </Link>
              <button className="px-5 py-2.5 border border-purple-200 rounded-lg text-sm font-medium hover:bg-purple-50 text-purple-700 shadow-sm">
                Export report
              </button>
              <Link
                href="/partner/programs/create"
                className="px-5 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 shadow-sm"
              >
                + New program
              </Link>
              <button className="px-5 py-2.5 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 shadow-sm">
                + New project
              </button>
              <button 
                onClick={handleLogout}
                className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-red-50 text-red-700 shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>


        {/* Main Dashboard Content */}
        <div className="flex-1 p-6 bg-gray-50">
          <div className="bg-white rounded-xl border-2 border-purple-200 p-6 shadow-lg">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Onboarding Progress */}
            <Card className="bg-gradient-to-r from-purple-100 to-indigo-100 border-purple-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900">Complete Your Setup</CardTitle>
                  <Badge variant="secondary" className="bg-white/50">
                    {progress}% Complete
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={progress} className="mb-6" />
                <div className="grid md:grid-cols-2 gap-4">
                  {onboardingTasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3 p-2 rounded-lg bg-white/50">
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        task.completed 
                          ? 'bg-purple-600 border-purple-600' 
                          : 'border-gray-300 bg-white'
                      }`}>
                        {task.completed && (
                          <div className="w-full h-full flex items-center justify-center">
                            <UserCheck className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <span className={`text-sm ${
                        task.completed ? 'text-gray-600 line-through' : 'text-gray-900 font-medium'
                      }`}>
                        {task.text}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Programs Overview (Prototype Data) */}
            <Card className="border-purple-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <MapPin className="h-5 w-5 text-purple-600" />
                    Active Programs
                  </CardTitle>
                  {partnerId && (
                    <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                      {programSummaries.length} program{programSummaries.length === 1 ? '' : 's'}
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Programs seeded from the prototype data layer. Upcoming flows will persist changes to localStorage.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isProgramsLoading ? (
                  <div className="flex items-center justify-center py-10 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
                      Loading program data…
                    </div>
                  </div>
                ) : programSummaries.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-purple-200 bg-purple-50/60 p-6 text-sm text-purple-700 space-y-3">
                    <p>No programs yet. Create one to start inviting co-partners, coordinators, and institutions.</p>
                    <Link
                      href="/partner/programs/create"
                      className="inline-flex items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                    >
                      Launch program builder
                    </Link>
                  </div>
                ) : (
                  programSummaries.map((summary) => {
                    const { program, metrics } = summary

                    return (
                      <div
                        key={program.id}
                        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-lg font-semibold text-gray-900">{program.name}</h4>
                              <Badge variant="outline" className="capitalize">
                                {program.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">
                              {program.description}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {program.projectTypes.slice(0, 3).map((type) => (
                                <Badge key={type} variant="secondary" className="bg-purple-50 text-purple-700">
                                  {type.replace(/_/g, ' ')}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 text-sm text-gray-500 md:text-right">
                            <span>Timeline</span>
                            <span className="font-medium text-gray-900">
                              {formatDate(program.startDate)} – {formatDate(program.endDate)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {metrics.countries.length} country{metrics.countries.length === 1 ? '' : 'ies'} • {program.targetAgeRanges.join(', ')}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                          <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-center">
                            <div className="text-xs font-medium text-gray-500 uppercase">Co-Partners</div>
                            <div className="mt-1 text-lg font-semibold text-gray-900">{metrics.coPartnerCount}</div>
                          </div>
                          <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-center">
                            <div className="text-xs font-medium text-gray-500 uppercase">Coordinators</div>
                            <div className="mt-1 text-lg font-semibold text-gray-900">{metrics.coordinatorCount}</div>
                          </div>
                          <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-center">
                            <div className="text-xs font-medium text-gray-500 uppercase">Institutions</div>
                            <div className="mt-1 text-lg font-semibold text-gray-900">{metrics.institutionCount}</div>
                          </div>
                          <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-center">
                            <div className="text-xs font-medium text-gray-500 uppercase">Active Institutions</div>
                            <div className="mt-1 text-lg font-semibold text-gray-900">{metrics.activeInstitutionCount}</div>
                          </div>
                          <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-center">
                            <div className="text-xs font-medium text-gray-500 uppercase">Teachers</div>
                            <div className="mt-1 text-lg font-semibold text-gray-900">{metrics.teacherCount}</div>
                          </div>
                          <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-center">
                            <div className="text-xs font-medium text-gray-500 uppercase">Students (est.)</div>
                            <div className="mt-1 text-lg font-semibold text-gray-900">{metrics.studentCount.toLocaleString()}</div>
                          </div>
                          <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-center">
                            <div className="text-xs font-medium text-gray-500 uppercase">Pending Invites</div>
                            <div className="mt-1 text-lg font-semibold text-gray-900">{metrics.pendingInvitations}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>

            {/* Next Steps Action Items */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Ready to Get Started? Here&apos;s What You Can Do Next</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {nextStepActions.map((action) => (
                  <Card key={action.id} className="hover:shadow-lg transition-shadow border-purple-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <action.icon className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{action.title}</CardTitle>
                            <CardDescription className="mt-1">{action.description}</CardDescription>
                          </div>
                        </div>
                        <Badge variant={action.priority === 'high' ? 'default' : 'secondary'}>
                          {action.priority}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardFooter>
                      {action.href ? (
                        <Link href={action.href} className="w-full">
                          <Button className="w-full bg-purple-600 hover:bg-purple-700">
                            {action.action}
                          </Button>
                        </Link>
                      ) : action.id === 'launch_marketing' ? (
                        <Link href="/partner/marketing" className="w-full">
                          <Button className="w-full bg-purple-600 hover:bg-purple-700">
                            {action.action}
                          </Button>
                        </Link>
                      ) : (
                        <Button className="w-full bg-purple-600 hover:bg-purple-700">
                          {action.action}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-purple-200 bg-purple-50/60 p-6 text-sm text-purple-700">
                    Activity from your programs will appear here once coordinators, institutions, and teachers start collaborating.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map(({ activity, program }) => (
                      <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            <span className="font-semibold text-gray-800">{program.name}</span>
                            <span className="text-gray-500"> · </span>
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500">{formatRelativeTime(activity.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            {/* Key Metrics - Only shown in Projects */}
            <div className="mb-8">
              <h2 className="text-sm font-medium text-gray-600 mb-4 uppercase tracking-wide">Key Metrics</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
                {keyMetrics.map((metric) => (
                  <div
                    key={metric.id}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center diagonal-stripes hover:shadow-md transition-shadow"
                  >
                    <div className="font-medium text-gray-800 mb-1 text-sm">{metric.label}</div>
                    <div className="text-xl font-bold text-gray-900">
                      {metric.isLargeNumber
                        ? metric.value.toLocaleString()
                        : metric.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Project Management</h3>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Create New Project
              </Button>
            </div>
            
            <div className="grid gap-6">
              {programProjectGroups.length === 0 ? (
                <Card className="border-dashed border-purple-200 bg-purple-50/60">
                  <CardHeader>
                    <CardTitle className="text-lg text-purple-800">No program projects yet</CardTitle>
                    <CardDescription>
                      Create your first project to connect coordinators, institutions, and teachers inside your program.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Program Project
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                programProjectGroups.map((group) => {
                  const programMetrics = [
                    { id: 'coPartners', label: 'Co-Partners', value: group.metrics.coPartnerCount },
                    { id: 'coordinators', label: 'Coordinators', value: group.metrics.coordinatorCount },
                    { id: 'institutions', label: 'Institutions', value: group.metrics.institutionCount },
                    { id: 'activeInstitutions', label: 'Active Institutions', value: group.metrics.activeInstitutionCount },
                    { id: 'teachers', label: 'Teachers', value: group.metrics.teacherCount },
                    { id: 'students', label: 'Students (est.)', value: group.metrics.studentCount, isLargeNumber: true },
                    { id: 'pendingInvites', label: 'Pending Invites', value: group.metrics.pendingInvitations },
                  ]

                  return (
                    <Card key={group.program.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <CardTitle className="text-lg">{group.program.name}</CardTitle>
                            <p className="mt-2 text-sm text-gray-600">
                              {group.program.description}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Badge variant="outline" className="capitalize">
                                {group.program.status.replace('_', ' ')}
                              </Badge>
                              {group.program.projectTypes.slice(0, 3).map((type) => (
                                <Badge key={type} variant="secondary" className="bg-purple-50 text-purple-700">
                                  {type.replace(/_/g, ' ')}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 lg:text-right">
                            <div className="font-medium text-gray-700">
                              {formatDate(group.program.startDate)} – {formatDate(group.program.endDate)}
                            </div>
                            <div className="mt-1">
                              {group.metrics.countries.length} country{group.metrics.countries.length === 1 ? '' : 'ies'} in scope
                            </div>
                            <div className="mt-1">
                              {group.metrics.projectCount} project{group.metrics.projectCount === 1 ? '' : 's'} published
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                          {programMetrics.map((metric) => (
                            <div key={metric.id} className="rounded-md border border-gray-200 bg-gray-50 p-3 text-center">
                              <div className="text-xs font-medium text-gray-500 uppercase">{metric.label}</div>
                              <div className="mt-1 text-lg font-semibold text-gray-900">
                                {metric.isLargeNumber ? metric.value.toLocaleString() : metric.value}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-4">
                          {group.projects.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-600">
                              No projects have been created in this program yet. Use the button above to add one.
                            </div>
                          ) : (
                            group.projects.map((project) => (
                              <div key={project.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <h4 className="text-base font-semibold text-gray-900">{project.displayName}</h4>
                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                                      <Badge variant={
                                        project.status === 'active' ? 'default' :
                                        project.status === 'completed' ? 'secondary' : 'outline'
                                      }>
                                        {project.status}
                                      </Badge>
                                      <span>Created {formatDate(project.createdAt)}</span>
                                      <span>by {project.createdByName}</span>
                                      {project.associatedCoPartnerName && (
                                        <Badge variant="outline" className="text-xs">
                                          Linked to {project.associatedCoPartnerName}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="sm">
                                    <Edit3 className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="mt-4 border-t pt-4">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleProjectDetails(project.id)}
                                    className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700 hover:text-purple-600"
                                  >
                                    <School className="h-4 w-4" />
                                    Participating Institutions ({group.institutions.length})
                                    {expandedProjects.has(project.id) ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </Button>

                                  {expandedProjects.has(project.id) && (
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                      {group.institutions.map((institution) => (
                                        <div key={institution.id} className="bg-gray-50 rounded-lg p-3 border">
                                          <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                              <h4 className="font-medium text-sm text-gray-900">{institution.name}</h4>
                                              <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                                                <MapPin className="h-3 w-3" />
                                                <span>
                                                  {[institution.city, institution.country].filter(Boolean).join(', ')}
                                                </span>
                                              </div>
                                            </div>
                                            <Badge
                                              variant={
                                                institution.status === 'active'
                                                  ? 'default'
                                                  : institution.status === 'invited'
                                                  ? 'outline'
                                                  : 'secondary'
                                              }
                                              className="text-xs capitalize"
                                            >
                                              {institution.status}
                                            </Badge>
                                          </div>

                                          <div className="grid grid-cols-2 gap-3 mb-2">
                                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                              <Users className="h-3 w-3" />
                                              <span>
                                                {(institution.teacherCount ?? 0).toLocaleString()} teachers, {(institution.studentCount ?? 0).toLocaleString()} students
                                              </span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              Joined: {institution.joinedAt ? formatDate(institution.joinedAt) : '—'}
                                            </div>
                                          </div>

                                          <div className="flex flex-col gap-1 text-xs text-gray-600">
                                            {institution.contactEmail && (
                                              <div className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                <a
                                                  href={`mailto:${institution.contactEmail}`}
                                                  className="font-medium text-purple-600 hover:text-purple-700"
                                                >
                                                  {institution.contactEmail}
                                                </a>
                                              </div>
                                            )}
                                            {institution.contactPhone && (
                                              <div className="flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                <span>{institution.contactPhone}</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}

            </div>

            </TabsContent>

            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
