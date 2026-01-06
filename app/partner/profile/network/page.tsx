'use client'

import { useState, useEffect } from 'react'
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
  const [countryCoordinators, setCountryCoordinators] = useState<
    Array<{ id: string; name: string; country: Country; email: string }>
  >([])
  const [educationalInstitutions, setEducationalInstitutions] = useState<
    Array<{
      id: string
      name: string
      country: Country
      category: string
      pointOfContact: string
      email: string
    }>
  >([])
  const [showInviteCoordinatorDialog, setShowInviteCoordinatorDialog] = useState(false)
  const [showInviteInstitutionDialog, setShowInviteInstitutionDialog] = useState(false)

  useEffect(() => {
    loadOrganizationData()
  }, [])

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

      const mockCoordinators = [
        {
          id: 'coord-1',
          name: 'Christian Bindslev',
          country: 'Denmark',
          email: 'christian@unicef.dk',
        },
        {
          id: 'coord-2',
          name: 'Mette Victoria',
          country: 'Denmark',
          email: 'mette.victoria@unicef.dk',
        },
        {
          id: 'coord-3',
          name: 'Amelia Parker',
          country: 'England',
          email: 'amelia.parker@unicef.org.uk',
        },
        {
          id: 'coord-4',
          name: 'James Whitaker',
          country: 'England',
          email: 'james.whitaker@unicef.org.uk',
        },
      ]

      const mockInstitutions = [
        {
          id: 'inst-1',
          name: 'Mørke Rettighedskole',
          country: 'Denmark',
          category: 'School',
          pointOfContact: 'Anne Larsen',
          email: 'anne@moerke-rette.dk',
        },
        {
          id: 'inst-2',
          name: 'Vesterbjerg Rettighedskole',
          country: 'Denmark',
          category: 'School',
          pointOfContact: 'Michael Jensen',
          email: 'michael@vesterbjerg.dk',
        },
        {
          id: 'inst-3',
          name: 'Manchester Rights School',
          country: 'England',
          category: 'School',
          pointOfContact: 'Priya Shah',
          email: 'priya.shah@mancc.ac.uk',
        },
      ]

      setOrganization(sampleOrg)
      setCountryCoordinators(mockCoordinators)
      setEducationalInstitutions(mockInstitutions)
    } catch (err) {
      console.error('Error loading network data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Country</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {countryCoordinators.map((coordinator) => (
                    <tr key={coordinator.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{coordinator.name}</td>
                      <td className="px-4 py-3">
                        {countryBadge(coordinator.country)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{coordinator.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Mail className="mr-1 h-3 w-3" />
                            Contact
                          </Button>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Country</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Category</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Point of Contact</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {educationalInstitutions.map((institution) => (
                    <tr key={institution.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{institution.name}</td>
                      <td className="px-4 py-3">
                        {countryBadge(institution.country)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{institution.category}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <div className="font-medium">{institution.pointOfContact}</div>
                          <div className="text-gray-600">{institution.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Mail className="mr-1 h-3 w-3" />
                            Contact
                          </Button>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
