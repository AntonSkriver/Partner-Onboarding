'use client'

import { useState, useEffect, useMemo } from 'react'
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
} from 'lucide-react'
import { getCurrentSession } from '@/lib/auth/session'
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

export default function PartnerNetworkPage() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInviteCoordinatorDialog, setShowInviteCoordinatorDialog] = useState(false)
  const [showInviteInstitutionDialog, setShowInviteInstitutionDialog] = useState(false)
  const { ready: prototypeReady, database } = usePrototypeDb()

  useEffect(() => {
    loadOrganizationData()
  }, [prototypeReady])

  const loadOrganizationData = async () => {
    setLoading(true)
    try {
      const session = getCurrentSession()
      if (!session || session.role !== 'partner') {
        return
      }

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

  const countryCoordinators = useMemo(() => {
    const coordinators: Array<{ id: string; name: string; country: Country; email: string }> = []
    const seenEmails = new Set<string>()

    programSummaries.forEach((summary) => {
      summary.coordinators.forEach((coord) => {
        const email = coord.email?.toLowerCase()
        if (!email || seenEmails.has(email)) return
        seenEmails.add(email)
        const fullName = [coord.firstName, coord.lastName].filter(Boolean).join(' ').trim() || 'Coordinator'
        const countryLabel = coord.country === 'DK' ? 'Denmark' : 'England'
        coordinators.push({
          id: coord.id,
          name: fullName,
          country: countryLabel as Country,
          email: coord.email,
        })
      })
    })

    return coordinators
  }, [programSummaries])

  const educationalInstitutions = useMemo(() => {
    const institutions: Array<{
      id: string
      name: string
      country: Country
      category: string
      pointOfContact: string
      email: string
    }> = []
    const seen = new Set<string>()

    programSummaries.forEach((summary) => {
      summary.institutions.forEach((inst) => {
        const key = inst.name.toLowerCase()
        if (seen.has(key)) return
        seen.add(key)
        institutions.push({
          id: inst.id,
          name: inst.name,
          country: inst.country === 'DK' ? 'Denmark' : 'England',
          category: 'School',
          pointOfContact: inst.principalName || 'Lead contact',
          email: inst.contactEmail,
        })
      })
    })

    return institutions
  }, [programSummaries])

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

      {/* Country Coordinators Section */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Country Coordinators
              </CardTitle>
              <CardDescription>Manage your organization's country coordinators</CardDescription>
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
          {countryCoordinators.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {countryCoordinators.map((coordinator) => (
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
                Invite country coordinators to help manage your organization's regional presence.
              </p>
              <Button onClick={() => setShowInviteCoordinatorDialog(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite First Coordinator
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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
          {educationalInstitutions.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {educationalInstitutions.map((institution) => (
                <div key={institution.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{institution.name}</p>
                      <p className="text-sm text-gray-500">{institution.pointOfContact}</p>
                      <p className="text-xs text-gray-500">{institution.email}</p>
                    </div>
                    {countryBadge(institution.country)}
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
        <Card className="border-purple-200 bg-purple-50">
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
        <Card className="border-purple-200 bg-purple-50">
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
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Institution Name</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="School or institution name"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                <select className="w-full rounded-md border border-gray-300 px-3 py-2">
                  <option>School</option>
                  <option>Library</option>
                  <option>Municipality Center</option>
                  <option>Cultural Center</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Assign Program</label>
                <select className="w-full rounded-md border border-gray-300 px-3 py-2">
                  {programSummaries.length > 0 ? (
                    programSummaries.map((summary) => (
                      <option key={summary.program.id} value={summary.program.id}>
                        {summary.program.displayTitle || summary.program.name}
                      </option>
                    ))
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
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Country"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Point of Contact</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Contact person name"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Contact Email</label>
                <input
                  type="email"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="contact@institution.edu"
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
    </div>
  )
}
