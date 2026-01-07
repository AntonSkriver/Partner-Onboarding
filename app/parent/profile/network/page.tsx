'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  UserPlus,
  Mail,
  Send,
  Building2,
} from 'lucide-react'
import { getCurrentSession } from '@/lib/auth/session'
import { Database } from '@/lib/types/database'

type Organization = Database['public']['Tables']['organizations']['Row']

export default function ParentNetworkPage() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [countryCoordinators, setCountryCoordinators] = useState<
    Array<{ id: string; name: string; country: string; email: string; role: string }>
  >([])
  const [showInviteCoordinatorDialog, setShowInviteCoordinatorDialog] = useState(false)

  useEffect(() => {
    loadOrganizationData()
  }, [])

  const loadOrganizationData = async () => {
    setLoading(true)
    try {
      const session = getCurrentSession()
      if (!session || session.role !== 'parent') {
        return
      }

      // For demo purposes - sample organization data
      const sampleOrg: Organization = {
        id: 'demo-org-id',
        name: 'UNICEF World Organization',
        organization_type: 'ngo',
        website: 'https://www.unicef.org',
        logo: null,
        short_description:
          'Connecting UNICEF country teams and partners to scale impact for children worldwide.',
        primary_contacts: [],
        regions_of_operation: ['Global'],
        countries_of_operation: ['Denmark', 'United Kingdom', 'Kenya', 'Bangladesh', 'Brazil'],
        languages: ['English', 'French', 'Spanish'],
        sdg_tags: ['4', '5', '10', '13', '16', '17'],
        thematic_tags: ["Children's Rights", 'Global Citizenship', 'Healthy Communities'],
        verification_status: 'verified',
        brand_settings: null,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-03-10T15:30:00Z',
        is_active: true,
      }

      const mockCoordinators = [
        {
          id: 'coord-dk-1',
          name: 'Christian Bindslev',
          country: 'Denmark',
          email: 'christian@unicef.dk',
          role: 'Project Leader',
        },
        {
          id: 'coord-dk-2',
          name: 'Mette Victoria',
          country: 'Denmark',
          email: 'mette@unicef.dk',
          role: 'Country Coordinator',
        },
        {
          id: 'coord-uk-1',
          name: 'Amelia Parker',
          country: 'United Kingdom',
          email: 'amelia.parker@unicef.org.uk',
          role: 'Regional Lead',
        },
        {
          id: 'coord-uk-2',
          name: 'James Turner',
          country: 'United Kingdom',
          email: 'james.turner@unicef.org.uk',
          role: 'Program Coordinator',
        },
        {
          id: 'coord-uk-3',
          name: 'Eleanor Shaw',
          country: 'United Kingdom',
          email: 'communities.uk@unicef.org',
          role: 'Country Coordinator',
        },
      ]

      setOrganization(sampleOrg)
      setCountryCoordinators(mockCoordinators)
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
            Manage country coordinators for your organization.
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
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Role</th>
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
                        <Badge variant="outline" className="text-xs">
                          {coordinator.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{coordinator.country}</Badge>
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
    </div>
  )
}
