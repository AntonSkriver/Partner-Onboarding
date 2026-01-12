'use client'

import { useState, useEffect, useMemo, useRef, type FormEvent } from 'react'
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

type Organization = Database['public']['Tables']['organizations']['Row']
type Country = 'Denmark' | 'England'

const countryBadge = (country: Country) => {
  const styles =
    country === 'Denmark'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : 'bg-blue-100 text-blue-800 border-blue-200'
  const label = country === 'Denmark' ? 'Denmark (DK)' : 'England (UK)'
  return (
    <Badge variant="outline" className={styles}>
      {label}
    </Badge>
  )
}

interface PendingInvitation {
  id: string
  name: string
  country: Country
  category: string
  pointOfContact: string
  email: string
  programName: string
  invitedAt: string
}

export default function PartnerNetworkPage() {
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
    country: 'Denmark',
    contactName: '',
    email: '',
  })
  const coordinatorFormRef = useRef<HTMLDivElement>(null)
  const institutionFormRef = useRef<HTMLDivElement>(null)
  const { ready: prototypeReady, database } = usePrototypeDb()

  useEffect(() => {
    loadOrganizationData()
  }, [prototypeReady])

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

  const loadOrganizationData = async () => {
    setLoading(true)
    try {
      // Use sample data for prototype - no strict session check needed
      // For demo purposes - sample organization data
      const sampleOrg: Organization = {
        id: 'demo-org-id',
        name: 'UNICEF Denmark',
        organization_type: 'ngo',
        website: 'https://unicef.dk',
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
  }

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

  // Team coordinators are part of UNICEF Denmark (DK)
  const teamCoordinators = useMemo(() => {
    const coordinators: Array<{ id: string; name: string; country: Country; email: string }> = []
    const seenEmails = new Set<string>()

    programSummaries.forEach((summary) => {
      summary.coordinators.forEach((coord) => {
        if (coord.country !== 'DK') return // Only DK coordinators are team members
        const email = coord.email?.toLowerCase()
        if (!email || seenEmails.has(email)) return
        seenEmails.add(email)
        const fullName = [coord.firstName, coord.lastName].filter(Boolean).join(' ').trim() || 'Coordinator'
        coordinators.push({
          id: coord.id,
          name: fullName,
          country: 'Denmark' as Country,
          email: coord.email,
        })
      })
    })

    return coordinators
  }, [programSummaries])

  // Program connections are coordinators from other organizations (e.g., UNICEF England)
  const programConnections = useMemo(() => {
    const connections: Array<{ id: string; name: string; country: Country; email: string; programName: string; organization: string }> = []
    const seenEmails = new Set<string>()

    programSummaries.forEach((summary) => {
      const programName = summary.program.displayTitle || summary.program.name
      summary.coordinators.forEach((coord) => {
        if (coord.country === 'DK') return // Skip DK coordinators - they're team members
        const email = coord.email?.toLowerCase()
        if (!email || seenEmails.has(email)) return
        seenEmails.add(email)
        const fullName = [coord.firstName, coord.lastName].filter(Boolean).join(' ').trim() || 'Coordinator'
        const countryLabel = coord.country === 'UK' ? 'England' : coord.country
        // Infer organization from country
        const organization = coord.country === 'UK' ? 'UNICEF England' : `UNICEF ${countryLabel}`
        connections.push({
          id: coord.id,
          name: fullName,
          country: countryLabel as Country,
          email: coord.email,
          programName,
          organization,
        })
      })
    })

    return connections
  }, [programSummaries])

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
      country: Country
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
            country: inst.country === 'DK' ? 'Denmark' : 'England',
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
      country: institutionForm.country === 'England' ? 'England' : 'Denmark',
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
      country: 'Denmark',
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
          <h2 className="mb-2 text-lg font-semibold text-gray-900">No Organization Profile</h2>
          <p className="text-gray-600">Please create an organization profile to get started.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Network</h1>
          <p className="text-sm text-gray-600">
            Manage country coordinators and educational institution partnerships.
          </p>
        </div>
      </div>

      {showInvitationSentDialog && pendingInvitations.length > 0 && (
        <div className="flex items-start justify-between rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="space-y-0.5">
              <p className="font-semibold text-gray-900">Invitation sent</p>
              <p className="text-sm text-gray-700">
                We emailed {pendingInvitations[0].pointOfContact} at {pendingInvitations[0].name}. Status: awaiting response.
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowInvitationSentDialog(false)}>
            Dismiss
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
                Country Coordinators
              </CardTitle>
              <CardDescription>Team members who manage UNICEF Denmark programs</CardDescription>
            </div>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => setShowInviteCoordinatorDialog(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Coordinator
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
                    {countryBadge(coordinator.country)}
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
              <h3 className="mb-2 font-medium text-gray-900">No Country Coordinators</h3>
              <p className="mb-4 text-gray-500">
                Invite country coordinators to help manage your organization&apos;s regional presence.
              </p>
              <Button onClick={() => setShowInviteCoordinatorDialog(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite First Coordinator
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
                Program Connections
              </CardTitle>
              <CardDescription>
                Coordinators from partner organizations you collaborate with on shared programs
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
                    {countryBadge(connection.country)}
                  </div>
                  <div className="mt-2">
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
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
                Educational Institutions
              </CardTitle>
              <CardDescription>
                Schools, libraries, municipality centers and other educational partners
              </CardDescription>
            </div>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => setShowInviteInstitutionDialog(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Institution
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
                      {countryBadge(invitation.country)}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1 border-amber-200 bg-amber-50 text-amber-700 text-xs">
                        <Clock className="h-3 w-3" />
                        Awaiting response
                      </Badge>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
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
                      {countryBadge(institution.country)}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {institution.programNames.map((programName) => (
                        <Badge key={programName} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
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
              <h3 className="mb-2 font-medium text-gray-900">No Educational Institutions</h3>
              <p className="mb-4 text-gray-500">
                Connect with schools, libraries, and other educational institutions.
              </p>
              <Button onClick={() => setShowInviteInstitutionDialog(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite First Institution
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
                <h3 className="text-lg font-semibold">Invite Country Coordinator</h3>
                <p className="mt-1 text-sm text-gray-600">Send an invitation to a country coordinator</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowInviteCoordinatorDialog(false)}>
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Coordinator name"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="coordinator@email.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Country</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Country"
                />
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <Send className="mr-2 h-4 w-4" />
                Send Invitation
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
                <h3 className="text-lg font-semibold">Invite Educational Institution</h3>
                <p className="mt-1 text-sm text-gray-600">Send an invitation to an educational institution</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowInviteInstitutionDialog(false)}>
                ✕
              </Button>
            </div>
            <form className="space-y-4" onSubmit={handleSendInstitutionInvitation}>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Institution Name</label>
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
                <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={institutionForm.category}
                  onChange={(e) => handleInstitutionFormChange('category', e.target.value)}
                >
                  <option>School</option>
                  <option>Library</option>
                  <option>Municipality Center</option>
                  <option>Cultural Center</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Assign Program</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={institutionForm.programId}
                  onChange={(e) => handleInstitutionFormChange('programId', e.target.value)}
                >
                  {programSummaries.length > 0 ? (
                    <>
                      <option value="">Select a program</option>
                      {programSummaries.map((summary) => (
                        <option key={summary.program.id} value={summary.program.id}>
                          {summary.program.displayTitle || summary.program.name}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value="">No programs available yet</option>
                  )}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Pick the program this school should land with so resources are ready in their profile.
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Country</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={institutionForm.country}
                  onChange={(e) => handleInstitutionFormChange('country', e.target.value)}
                >
                  <option value="Denmark">Denmark (DK)</option>
                  <option value="England">England (UK)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Point of Contact</label>
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
                <label className="mb-1 block text-sm font-medium text-gray-700">Contact Email</label>
                <input
                  type="email"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="contact@institution.edu"
                  value={institutionForm.email}
                  onChange={(e) => handleInstitutionFormChange('email', e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                <Send className="mr-2 h-4 w-4" />
                Send Invitation
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
