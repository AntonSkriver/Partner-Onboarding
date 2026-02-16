'use client'

import { useState, useEffect, useMemo, useRef, useCallback, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { ProfilePageHeader } from '@/components/profile/profile-page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  School,
  UserPlus,
  Mail,
  Send,
  Building2,
  Link2,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { Database } from '@/lib/types/database'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { buildProgramSummariesForPartner, type ProgramSummary } from '@/lib/programs/selectors'
import { getCurrentSession } from '@/lib/auth/session'
import { resolvePartnerContext } from '@/lib/auth/partner-context'

type Organization = Database['public']['Tables']['organizations']['Row']

const COUNTRY_ALIAS_TO_CODE: Record<string, string> = {
  DK: 'DK',
  DENMARK: 'DK',
  UK: 'UK',
  ENGLAND: 'UK',
  'UNITED KINGDOM': 'UK',
  IT: 'IT',
  ITALY: 'IT',
  MX: 'MX',
  MEXICO: 'MX',
}

const toCountryCode = (value: string | undefined | null): string => {
  const normalized = value?.trim().toUpperCase() ?? ''
  if (!normalized) return ''
  return COUNTRY_ALIAS_TO_CODE[normalized] ?? normalized
}

const getCountryName = (value: string | undefined | null): string => {
  const countryCode = toCountryCode(value)
  if (!countryCode) return 'Unknown country'

  if (countryCode.length !== 2) {
    return value?.trim() || countryCode
  }

  const displayName = new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode)
  return displayName ?? countryCode
}

const formatCountryLabel = (value: string | undefined | null): string => {
  const countryCode = toCountryCode(value)
  if (!countryCode) return 'Unknown'
  if (countryCode.length !== 2) return countryCode
  return `${getCountryName(countryCode)} (${countryCode})`
}

const countryBadge = (country: string, primaryCountryCode: string) => {
  const normalizedCountry = toCountryCode(country)
  const styles =
    normalizedCountry && normalizedCountry === primaryCountryCode
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : 'bg-blue-100 text-blue-800 border-blue-200'

  return (
    <Badge variant="outline" className={styles}>
      {formatCountryLabel(country)}
    </Badge>
  )
}

interface PendingInvitation {
  id: string
  name: string
  country: string
  category: string
  pointOfContact: string
  email: string
  programName: string
  invitedAt: string
}

export default function PartnerNetworkPage() {
  const t = useTranslations('profile.network')
  const tc = useTranslations('common')
  const tDashboard = useTranslations('dashboard')
  const tSchools = useTranslations('schools')
  const [session, setSession] = useState(() => getCurrentSession())
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInviteCoordinatorDialog, setShowInviteCoordinatorDialog] = useState(false)
  const [showInviteInstitutionDialog, setShowInviteInstitutionDialog] = useState(false)
  const [showInvitationSentDialog, setShowInvitationSentDialog] = useState(false)
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([])
  const [institutionForm, setInstitutionForm] = useState({
    name: '',
    category: 'School',
    programId: '',
    country: '',
    contactName: '',
    email: '',
  })
  const coordinatorFormRef = useRef<HTMLDivElement>(null)
  const institutionFormRef = useRef<HTMLDivElement>(null)
  const { ready: prototypeReady, database } = usePrototypeDb()

  useEffect(() => {
    setSession(getCurrentSession())
  }, [])

  const partnerContext = useMemo(
    () => resolvePartnerContext(session, database),
    [session, database],
  )

  const partnerRecord = useMemo(() => {
    if (partnerContext.partnerRecord) return partnerContext.partnerRecord
    if (!database) return null
    return database.partners.length > 0 ? database.partners[0] : null
  }, [database, partnerContext.partnerRecord])

  const primaryCountryCode = toCountryCode(partnerRecord?.country)
  const organizationDisplayName =
    partnerRecord?.organizationName || organization?.name || 'your organization'

  // Scroll to form when dialog opens
  useEffect(() => {
    if (showInviteCoordinatorDialog && coordinatorFormRef.current) {
      coordinatorFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [showInviteCoordinatorDialog])

  useEffect(() => {
    if (showInviteInstitutionDialog && institutionFormRef.current) {
      institutionFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [showInviteInstitutionDialog])

  useEffect(() => {
    if (!showInvitationSentDialog) return
    const timer = window.setTimeout(() => setShowInvitationSentDialog(false), 3600)
    return () => window.clearTimeout(timer)
  }, [showInvitationSentDialog])

  const loadOrganizationData = useCallback(async () => {
    setLoading(true)
    try {
      // Use sample data for prototype - no strict session check needed
      // For demo purposes - sample organization data
      const sampleOrg: Organization = {
        id: 'demo-org-id',
        name: session?.organization ?? partnerRecord?.organizationName ?? 'Partner Organization',
        organization_type: 'ngo',
        website: partnerRecord?.website ?? 'https://class2class.org',
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
      console.error('Error loading network data:', err)
    } finally {
      setLoading(false)
    }
  }, [partnerRecord?.organizationName, partnerRecord?.website, session?.organization])

  useEffect(() => {
    loadOrganizationData()
  }, [prototypeReady, loadOrganizationData])

  const programSummaries = useMemo<ProgramSummary[]>(() => {
    if (!prototypeReady || !database || !partnerRecord) {
      return []
    }
    return buildProgramSummariesForPartner(database, partnerRecord.id, {
      includeRelatedPrograms: true,
    })
  }, [prototypeReady, database, partnerRecord])

  const availableCountryCodes = useMemo(() => {
    const countries = new Set<string>()
    if (primaryCountryCode) {
      countries.add(primaryCountryCode)
    }

    programSummaries.forEach((summary) => {
      summary.coordinators.forEach((coord) => {
        const countryCode = toCountryCode(coord.country)
        if (countryCode) countries.add(countryCode)
      })
      summary.institutions.forEach((institution) => {
        const countryCode = toCountryCode(institution.country)
        if (countryCode) countries.add(countryCode)
      })
      summary.program.countriesInScope.forEach((countryCode) => {
        const normalized = toCountryCode(countryCode)
        if (normalized) countries.add(normalized)
      })
    })

    return Array.from(countries)
  }, [primaryCountryCode, programSummaries])

  useEffect(() => {
    if (!institutionForm.country && availableCountryCodes.length > 0) {
      setInstitutionForm((prev) => ({
        ...prev,
        country: availableCountryCodes[0],
      }))
    }
  }, [availableCountryCodes, institutionForm.country])

  const teamCoordinators = useMemo(() => {
    const coordinators: Array<{ id: string; name: string; country: string; email: string }> = []
    const seenEmails = new Set<string>()

    programSummaries.forEach((summary) => {
      summary.coordinators.forEach((coord) => {
        const coordinatorCountryCode = toCountryCode(coord.country)
        if (primaryCountryCode && coordinatorCountryCode !== primaryCountryCode) return
        const email = coord.email?.toLowerCase()
        if (!email || seenEmails.has(email)) return
        seenEmails.add(email)
        const fullName = [coord.firstName, coord.lastName].filter(Boolean).join(' ').trim() || 'Coordinator'
        coordinators.push({
          id: coord.id,
          name: fullName,
          country: coordinatorCountryCode,
          email: coord.email,
        })
      })
    })

    return coordinators
  }, [programSummaries, primaryCountryCode])

  const programConnections = useMemo(() => {
    const connections: Array<{
      id: string
      name: string
      country: string
      email: string
      programName: string
      organization: string
    }> = []
    const seenEmails = new Set<string>()

    programSummaries.forEach((summary) => {
      const programName = summary.program.displayTitle || summary.program.name
      summary.coordinators.forEach((coord) => {
        const coordinatorCountryCode = toCountryCode(coord.country)
        if (primaryCountryCode && coordinatorCountryCode === primaryCountryCode) return
        const email = coord.email?.toLowerCase()
        if (!email || seenEmails.has(email)) return
        seenEmails.add(email)
        const fullName = [coord.firstName, coord.lastName].filter(Boolean).join(' ').trim() || 'Coordinator'
        const organization =
          database?.partners.find(
            (partner) =>
              partner.id !== partnerRecord?.id &&
              toCountryCode(partner.country) === coordinatorCountryCode,
          )?.organizationName ?? `Partner in ${getCountryName(coordinatorCountryCode)}`

        connections.push({
          id: coord.id,
          name: fullName,
          country: coordinatorCountryCode,
          email: coord.email,
          programName,
          organization,
        })
      })
    })

    return connections
  }, [database, partnerRecord?.id, primaryCountryCode, programSummaries])

  useEffect(() => {
    if (!institutionForm.programId && programSummaries.length > 0) {
      setInstitutionForm((prev) => ({
        ...prev,
        programId: programSummaries[0].program.id,
      }))
    }
  }, [programSummaries, institutionForm.programId])

  const educationalInstitutions = useMemo(() => {
    const institutionMap = new Map<string, {
      id: string
      name: string
      country: string
      category: string
      pointOfContact: string
      email: string
      programNames: string[]
    }>()

    programSummaries.forEach((summary) => {
      const programName = summary.program.displayTitle || summary.program.name
      summary.institutions.forEach((inst) => {
        const key = inst.name.toLowerCase()
        const existing = institutionMap.get(key)
        if (existing) {
          // Add program name if not already included
          if (!existing.programNames.includes(programName)) {
            existing.programNames.push(programName)
          }
        } else {
          institutionMap.set(key, {
            id: inst.id,
            name: inst.name,
            country: toCountryCode(inst.country),
            category: 'School',
            pointOfContact: inst.principalName || 'Lead contact',
            email: inst.contactEmail,
            programNames: [programName],
          })
        }
      })
    })

    return Array.from(institutionMap.values())
  }, [programSummaries])

  const handleInstitutionFormChange = (field: keyof typeof institutionForm, value: string) => {
    setInstitutionForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSendInstitutionInvitation = (event: FormEvent) => {
    event.preventDefault()
    const program = programSummaries.find(
      (summary) => summary.program.id === institutionForm.programId,
    )
    const programName = program ? program.program.displayTitle || program.program.name : 'Assigned Program'
    const newInvitation: PendingInvitation = {
      id: crypto.randomUUID ? crypto.randomUUID() : `pending-${Date.now()}`,
      name: institutionForm.name || 'New Institution',
      country: toCountryCode(institutionForm.country),
      category: institutionForm.category || 'School',
      pointOfContact: institutionForm.contactName || 'Point of contact',
      email: institutionForm.email,
      programName,
      invitedAt: new Date().toISOString(),
    }

    setPendingInvitations((prev) => [newInvitation, ...prev])
    setShowInvitationSentDialog(true)
    setShowInviteInstitutionDialog(false)
    setInstitutionForm({
      name: '',
      category: 'School',
      programId: programSummaries[0]?.program.id ?? '',
      country: availableCountryCodes[0] ?? '',
      contactName: '',
      email: '',
    })
  }

  const hasInstitutions = pendingInvitations.length > 0 || educationalInstitutions.length > 0

  if (loading || !prototypeReady) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
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
    <div className="space-y-6">
      <ProfilePageHeader
        title={t('title')}
        description={t('subtitle')}
      />

      {showInvitationSentDialog && pendingInvitations.length > 0 && (
        <div className="flex items-start justify-between rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="space-y-0.5">
              <p className="font-semibold text-gray-900">{t('invitationSent')}</p>
              <p className="text-sm text-gray-700">
                {t('invitationSentDesc', { contact: pendingInvitations[0].pointOfContact, institution: pendingInvitations[0].name })}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowInvitationSentDialog(false)}>
            {tc('dismiss')}
          </Button>
        </div>
      )}

      {/* Team Coordinators Section */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('countryCoordinators')}
              </CardTitle>
              <CardDescription>{t('countryCoordinatorsDesc', { organization: organizationDisplayName })}</CardDescription>
            </div>
            <Button
              variant="profile"
              onClick={() => setShowInviteCoordinatorDialog(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {t('inviteCoordinator')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {teamCoordinators.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {teamCoordinators.map((coordinator) => (
                <div key={coordinator.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{coordinator.name}</p>
                      <p className="text-sm text-gray-500">{coordinator.email}</p>
                    </div>
                    {countryBadge(coordinator.country, primaryCountryCode)}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline">
                      <Mail className="mr-1 h-3 w-3" />
                      Contact
                    </Button>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 font-medium text-gray-900">{t('noCoordinators')}</h3>
              <p className="mb-4 text-gray-500">
                {t('noCoordinatorsDesc')}
              </p>
              <Button variant="profile" onClick={() => setShowInviteCoordinatorDialog(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                {t('inviteFirstCoordinator')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Program Connections Section */}
      {programConnections.length > 0 && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                {t('programConnections')}
              </CardTitle>
              <CardDescription>
                {t('programConnectionsDesc')}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {programConnections.map((connection) => (
                <div key={connection.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{connection.name}</p>
                      <p className="text-sm text-gray-600">{connection.organization}</p>
                      <p className="text-xs text-gray-500">{connection.email}</p>
                    </div>
                    {countryBadge(connection.country, primaryCountryCode)}
                  </div>
                  <div className="mt-2">
                    <Badge variant="profileSoft" className="text-xs">
                      {connection.programName}
                    </Badge>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline">
                      <Mail className="mr-1 h-3 w-3" />
                      Contact
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Educational Institutions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <School className="h-4 w-4" />
                {t('educationalInstitutions')}
              </CardTitle>
              <CardDescription>
                {t('educationalInstitutionsDesc')}
              </CardDescription>
            </div>
            <Button
              variant="profile"
              onClick={() => setShowInviteInstitutionDialog(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {t('inviteInstitution')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {hasInstitutions ? (
            <div className="grid gap-3 md:grid-cols-2">
              {pendingInvitations.map((invitation) => (
                <div
                  key={`pending-${invitation.id}`}
                  className="rounded-lg border border-dashed border-purple-300 bg-white p-4 shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">{invitation.name}</p>
                        <p className="text-sm text-gray-500">{invitation.pointOfContact}</p>
                        <p className="text-xs text-gray-500">{invitation.email}</p>
                      </div>
                      {countryBadge(invitation.country, primaryCountryCode)}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1 border-amber-200 bg-amber-50 text-amber-700 text-xs">
                        <Clock className="h-3 w-3" />
                        Awaiting response
                      </Badge>
                      <Badge variant="profileSoft" className="text-xs">
                        {invitation.programName}
                      </Badge>
                      <Badge variant="outline" className="border-gray-200 text-gray-700 text-xs">
                        {invitation.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      Invited{' '}
                      {new Date(invitation.invitedAt).toLocaleDateString('en-GB', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {educationalInstitutions.map((institution) => (
                <div key={institution.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">{institution.name}</p>
                        <p className="text-sm text-gray-500">{institution.pointOfContact}</p>
                        <p className="text-xs text-gray-500">{institution.email}</p>
                      </div>
                      {countryBadge(institution.country, primaryCountryCode)}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {institution.programNames.map((programName) => (
                        <Badge key={programName} variant="profileSoft" className="text-xs">
                          {programName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline">
                      <Mail className="mr-1 h-3 w-3" />
                      Contact
                    </Button>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <School className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 font-medium text-gray-900">{t('noInstitutions')}</h3>
              <p className="mb-4 text-gray-500">
                {t('noInstitutionsDesc')}
              </p>
              <Button variant="profile" onClick={() => setShowInviteInstitutionDialog(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                {t('inviteFirstInstitution')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invitation Dialogs */}
      {showInviteCoordinatorDialog && (
        <Card ref={coordinatorFormRef} className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{tSchools('inviteCoordinatorTitle')}</h3>
                <p className="mt-1 text-sm text-gray-600">{tSchools('inviteCoordinatorDesc')}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowInviteCoordinatorDialog(false)}>
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{tc('name')}</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Coordinator name"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{tc('email')}</label>
                <input
                  type="email"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="coordinator@email.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{tc('country')}</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Country"
                />
              </div>
              <Button variant="profile" className="w-full">
                <Send className="mr-2 h-4 w-4" />
                {tSchools('send')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showInviteInstitutionDialog && (
        <Card ref={institutionFormRef} className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{tSchools('inviteInstitutionTitle')}</h3>
                <p className="mt-1 text-sm text-gray-600">{tSchools('inviteInstitutionDesc')}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowInviteInstitutionDialog(false)}>
                ✕
              </Button>
            </div>
            <form className="space-y-4" onSubmit={handleSendInstitutionInvitation}>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{tSchools('schoolName')}</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="School or institution name"
                  value={institutionForm.name}
                  onChange={(e) => handleInstitutionFormChange('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{tSchools('category')}</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={institutionForm.category}
                  onChange={(e) => handleInstitutionFormChange('category', e.target.value)}
                >
                  <option>{tSchools('categorySchool')}</option>
                  <option>{tSchools('categoryLibrary')}</option>
                  <option>{tSchools('categoryMunicipalityCenter')}</option>
                  <option>{tSchools('categoryCulturalCenter')}</option>
                  <option>{tSchools('categoryOther')}</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{tSchools('assignProgram')}</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={institutionForm.programId}
                  onChange={(e) => handleInstitutionFormChange('programId', e.target.value)}
                >
                  {programSummaries.length > 0 ? (
                    <>
                      <option value="">{tSchools('selectProgram')}</option>
                      {programSummaries.map((summary) => (
                        <option key={summary.program.id} value={summary.program.id}>
                          {summary.program.displayTitle || summary.program.name}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value="">{tSchools('noPrograms')}</option>
                  )}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {tSchools('pickProgram')}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{tc('country')}</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={institutionForm.country}
                  onChange={(e) => handleInstitutionFormChange('country', e.target.value)}
                >
                  {availableCountryCodes.length > 0 ? (
                    availableCountryCodes.map((countryCode) => (
                      <option key={countryCode} value={countryCode}>
                        {formatCountryLabel(countryCode)}
                      </option>
                    ))
                  ) : (
                    <option value="">{tSchools('noCountries')}</option>
                  )}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{tSchools('pointOfContact')}</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Contact person name"
                  value={institutionForm.contactName}
                  onChange={(e) => handleInstitutionFormChange('contactName', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{tSchools('contactEmail')}</label>
                <input
                  type="email"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="contact@institution.edu"
                  value={institutionForm.email}
                  onChange={(e) => handleInstitutionFormChange('email', e.target.value)}
                  required
                />
              </div>
              <Button variant="profile" type="submit" className="w-full">
                <Send className="mr-2 h-4 w-4" />
                {tSchools('send')}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
