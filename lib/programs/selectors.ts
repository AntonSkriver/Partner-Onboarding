import type {
  PrototypeDatabase,
  PrototypeTableKey,
  StoredPartner,
} from '@/lib/storage/prototype-db'
import type {
  Program,
  ProgramPartner,
  CountryCoordinator,
  EducationalInstitution,
  InstitutionTeacher,
  ProgramProject,
  ProgramProjectTemplate,
  ProgramInvitation,
  ProgramActivity,
} from '@/lib/types/program'

export interface ProgramSummary {
  program: Program
  coPartners: Array<{
    relationship: ProgramPartner
    partner?: StoredPartner
  }>
  coordinators: CountryCoordinator[]
  institutions: EducationalInstitution[]
  teachers: InstitutionTeacher[]
  projects: ProgramProject[]
  templates: ProgramProjectTemplate[]
  invitations: ProgramInvitation[]
  activities: ProgramActivity[]
  metrics: ProgramSummaryMetrics
}

export interface ProgramSummaryMetrics {
  studentCount: number
  institutionCount: number
  activeInstitutionCount: number
  teacherCount: number
  coordinatorCount: number
  coPartnerCount: number
  projectCount: number
  activeProjectCount: number
  templateCount: number
  pendingInvitations: number
  countries: string[]
}

export interface PartnerProgramMetrics {
  totalPrograms: number
  activePrograms: number
  coPartners: number
  coordinators: number
  institutions: number
  teachers: number
  students: number
  projects: number
  activeProjects: number
  templates: number
  pendingInvitations: number
  countryCount: number
}

export interface ProgramCatalogItem {
  programId: string
  name: string
  displayTitle: string
  marketingTagline?: string
  description: string
  status: Program['status']
  isPublic: boolean
  hostPartner?: StoredPartner
  supportingPartner?: StoredPartner
  supportingRole?: 'co_host' | 'sponsor'
  coverImageUrl?: string
  brandColor?: string
  sdgFocus: number[]
  startMonthLabel?: string
  metrics: {
    templates: number
    activeProjects: number
    institutions: number
    countries: number
    students: number
  }
  templates: ProgramProjectTemplate[]
}

interface ProgramSummaryOptions {
  includeRelatedPrograms?: boolean
}

const computeMetrics = (
  program: Program,
  coPartners: ProgramSummary['coPartners'],
  coordinators: CountryCoordinator[],
  institutions: EducationalInstitution[],
  teachers: InstitutionTeacher[],
  projects: ProgramProject[],
  templates: ProgramProjectTemplate[],
  invitations: ProgramInvitation[],
): ProgramSummaryMetrics => {
  const acceptedCoPartners = coPartners.filter(
    ({ relationship }) => relationship.status === 'accepted',
  )

  const studentCount = institutions.reduce((total, institution) => {
    return total + (institution.studentCount ?? 0)
  }, 0)

  const activeInstitutionCount = institutions.filter(
    (institution) => institution.status === 'active',
  ).length

  const pendingInvitations = invitations.filter(
    (invitation) => invitation.status === 'pending',
  ).length

  const countries = new Set<string>(program.countriesInScope)
  coordinators.forEach((coordinator) => countries.add(coordinator.country))
  institutions.forEach((institution) => {
    if (institution.country) {
      countries.add(institution.country)
    }
  })

  return {
    studentCount,
    institutionCount: institutions.length,
    activeInstitutionCount,
    teacherCount: teachers.length,
    coordinatorCount: coordinators.length,
    coPartnerCount: acceptedCoPartners.length,
    projectCount: projects.length,
    activeProjectCount: projects.filter((project) => project.status === 'active').length,
    templateCount: templates.length,
    pendingInvitations,
    countries: Array.from(countries),
  }
}

const dedupePrograms = (programs: Program[]): Program[] => {
  const map = new Map<string, Program>()
  for (const program of programs) {
    map.set(program.id, program)
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf(),
  )
}

export const getProgramsForPartner = (
  database: PrototypeDatabase,
  partnerId: string,
  options: ProgramSummaryOptions = {},
): Program[] => {
  const ownedPrograms = database.programs.filter((program) => program.partnerId === partnerId)

  if (!options.includeRelatedPrograms) {
    return dedupePrograms(ownedPrograms)
  }

  const relatedProgramIds = new Set(
    database.programPartners
      .filter((relationship) => relationship.partnerId === partnerId)
      .map((relationship) => relationship.programId),
  )

  const relatedPrograms = database.programs.filter((program) =>
    relatedProgramIds.has(program.id),
  )

  return dedupePrograms([...ownedPrograms, ...relatedPrograms])
}

export const buildProgramSummary = (
  database: PrototypeDatabase,
  program: Program,
): ProgramSummary => {
  const coPartners = database.programPartners
    .filter((relationship) => relationship.programId === program.id)
    .map((relationship) => ({
      relationship,
      partner: database.partners.find((partner) => partner.id === relationship.partnerId),
    }))

  const coordinators = database.coordinators.filter(
    (coordinator) => coordinator.programId === program.id,
  )

  const institutions = database.institutions.filter(
    (institution) => institution.programId === program.id,
  )

  const teachers = database.institutionTeachers.filter(
    (teacher) => teacher.programId === program.id,
  )

  const projects = database.programProjects.filter(
    (project) => project.programId === program.id,
  )

  const templates = database.programTemplates.filter(
    (template) => template.programId === program.id,
  )

  const invitations = database.invitations.filter(
    (invitation) => invitation.programId === program.id,
  )

  const activities = database.activities.filter(
    (activity) => activity.programId === program.id,
  )

  return {
    program,
    coPartners,
    coordinators,
    institutions,
    teachers,
    projects,
    templates,
    invitations,
    activities,
    metrics: computeMetrics(
      program,
      coPartners,
      coordinators,
      institutions,
      teachers,
      projects,
      templates,
      invitations,
    ),
  }
}

export const buildProgramSummariesForPartner = (
  database: PrototypeDatabase,
  partnerId: string,
  options: ProgramSummaryOptions = {},
): ProgramSummary[] => {
  const programs = getProgramsForPartner(database, partnerId, options)
  return programs.map((program) => buildProgramSummary(database, program))
}

export const findProgramSummaryById = (
  database: PrototypeDatabase,
  programId: string,
): ProgramSummary | null => {
  const program = database.programs.find((entry) => entry.id === programId)
  if (!program) return null
  return buildProgramSummary(database, program)
}

export const aggregateProgramMetrics = (
  summaries: ProgramSummary[],
): PartnerProgramMetrics => {
  if (summaries.length === 0) {
    return {
      totalPrograms: 0,
      activePrograms: 0,
      coPartners: 0,
      coordinators: 0,
      institutions: 0,
      teachers: 0,
      students: 0,
      projects: 0,
      activeProjects: 0,
      templates: 0,
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
  let activeProjects = 0
  let templates = 0
  let pendingInvitations = 0

  for (const summary of summaries) {
    coPartners += summary.metrics.coPartnerCount
    coordinators += summary.metrics.coordinatorCount
    institutions += summary.metrics.institutionCount
    teachers += summary.metrics.teacherCount
    students += summary.metrics.studentCount
    projects += summary.metrics.projectCount
    activeProjects += summary.metrics.activeProjectCount
    templates += summary.metrics.templateCount
    pendingInvitations += summary.metrics.pendingInvitations

    summary.metrics.countries.forEach((country) => countries.add(country))
  }

  const activePrograms = summaries.filter(
    (summary) => summary.program.status === 'active',
  ).length

  return {
    totalPrograms: summaries.length,
    activePrograms,
    coPartners,
    coordinators,
    institutions,
    teachers,
    students,
    projects,
    activeProjects,
    templates,
    pendingInvitations,
    countryCount: countries.size,
  }
}

const toMonthLabel = (value?: string): string | undefined => {
  if (!value) {
    return undefined
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }

  const monthOnly = trimmed.replace(/\s+/g, ' ')
  const capitalised = monthOnly.charAt(0).toUpperCase() + monthOnly.slice(1)
  return capitalised
}

const formatMonthFromDate = (isoDate?: string): string | undefined => {
  if (!isoDate) {
    return undefined
  }
  const date = new Date(isoDate)
  if (Number.isNaN(date.valueOf())) {
    return undefined
  }
  return new Intl.DateTimeFormat(undefined, { month: 'long' }).format(date)
}

export const buildProgramCatalog = (
  database: PrototypeDatabase,
  options: { includePrivate?: boolean } = {},
): ProgramCatalogItem[] => {
  const includePrivate = options.includePrivate ?? false
  const candidates = includePrivate
    ? database.programs
    : database.programs.filter((program) => program.isPublic)

  return candidates.map((program) => {
    const summary = buildProgramSummary(database, program)
    const hostRelationship =
      summary.coPartners.find(({ relationship }) => relationship.role === 'host') ?? null
    const supportingRelationship = program.supportingPartnerId
      ? summary.coPartners.find(
          ({ relationship }) => relationship.partnerId === program.supportingPartnerId,
        ) ?? null
      : null

    const hostPartner =
      hostRelationship?.partner ??
      database.partners.find((partner) => partner.id === program.partnerId)

    const supportingPartner = supportingRelationship?.partner ?? null

    const coverImageUrl =
      summary.templates.find((template) => Boolean(template.heroImageUrl))?.heroImageUrl ??
      program.logo ??
      hostPartner?.logo ??
      undefined

    const recommendedMonth = summary.templates.find(
      (template) => Boolean(template.recommendedStartMonth),
    )?.recommendedStartMonth

    const startMonthLabel =
      toMonthLabel(recommendedMonth) ?? formatMonthFromDate(program.startDate) ?? undefined

    return {
      programId: program.id,
      name: program.name,
      displayTitle: program.displayTitle ?? program.name,
      marketingTagline: program.marketingTagline,
      description: program.description,
      status: program.status,
      isPublic: program.isPublic,
      hostPartner: hostPartner ?? undefined,
      supportingPartner: supportingPartner ?? undefined,
      supportingRole: program.supportingPartnerRole,
      coverImageUrl,
      brandColor: program.brandColor,
      sdgFocus: program.sdgFocus,
      startMonthLabel,
      metrics: {
        templates: summary.metrics.templateCount,
        activeProjects: summary.metrics.activeProjectCount,
        institutions: summary.metrics.institutionCount,
        countries: summary.metrics.countries.length,
        students: summary.metrics.studentCount,
      },
      templates: summary.templates,
    }
  })
}

export const cascadeDeleteProgram = (
  database: PrototypeDatabase | null,
  programId: string,
  deleteRecord: <K extends PrototypeTableKey>(table: K, id: string) => boolean,
): void => {
  if (!database) return

  const tablesToClean: Array<[PrototypeTableKey, string[]]> = [
    [
      'programPartners',
      database.programPartners
        .filter((record) => record.programId === programId)
        .map((record) => record.id),
    ],
    [
      'coordinators',
      database.coordinators
        .filter((record) => record.programId === programId)
        .map((record) => record.id),
    ],
    [
      'institutions',
      database.institutions
        .filter((record) => record.programId === programId)
        .map((record) => record.id),
    ],
    [
      'institutionTeachers',
      database.institutionTeachers
        .filter((record) => record.programId === programId)
        .map((record) => record.id),
    ],
    [
      'programProjects',
      database.programProjects
        .filter((record) => record.programId === programId)
        .map((record) => record.id),
    ],
    [
      'programTemplates',
      database.programTemplates
        .filter((record) => record.programId === programId)
        .map((record) => record.id),
    ],
    [
      'invitations',
      database.invitations
        .filter((record) => record.programId === programId)
        .map((record) => record.id),
    ],
    [
      'activities',
      database.activities
        .filter((record) => record.programId === programId)
        .map((record) => record.id),
    ],
  ]

  for (const [table, ids] of tablesToClean) {
    ids.forEach((id) => deleteRecord(table, id))
  }

  deleteRecord('programs', programId)
}
