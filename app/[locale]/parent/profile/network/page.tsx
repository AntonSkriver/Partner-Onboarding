'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { ProfilePageHeader } from '@/components/profile/profile-page-header'
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
import { getParentOrganizationProfilePreset } from '@/lib/parent/network'

type Organization = Database['public']['Tables']['organizations']['Row']

export default function ParentNetworkPage() {
  const t = useTranslations('profile.network')
  const tDash = useTranslations('dashboard')
  const tc = useTranslations('common')
  const tSchools = useTranslations('schools')
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

      const preset = getParentOrganizationProfilePreset(session.organization)

      // For demo purposes - sample organization data
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

      const mockCoordinators = [
        {
          id: 'coord-it-1',
          name: 'Giulia Ferraro',
          country: 'Italy',
          email: 'direttore@savethechildren.it',
          role: 'Country Program Lead',
        },
        {
          id: 'coord-it-2',
          name: 'Marco Bianchi',
          country: 'Italy',
          email: 'coordinamento@savethechildren.it',
          role: 'Regional Coordinator',
        },
        {
          id: 'coord-mx-1',
          name: 'Valeria Soto',
          country: 'Mexico',
          email: 'coordinacion@savethechildren.mx',
          role: 'Country Program Lead',
        },
        {
          id: 'coord-mx-2',
          name: 'Alejandro Rios',
          country: 'Mexico',
          email: 'programas@savethechildren.mx',
          role: 'Program Coordinator',
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
          <h2 className="mb-2 text-lg font-semibold text-gray-900">{tDash('noOrgProfile')}</h2>
          <p className="text-gray-600">{tDash('pleaseCreateProfile')}</p>
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

      {/* Country Coordinators Section */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('countryCoordinators')}
              </CardTitle>
              <CardDescription>{t('countryCoordinatorsDesc', { organization: organization?.name ?? '' })}</CardDescription>
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
          {countryCoordinators.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium text-gray-700">{tc('name')}</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">{tc('status')}</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">{tc('country')}</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">{tc('email')}</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700"></th>
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
                            {tc('edit')}
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

      {/* Invitation Dialogs */}
      {showInviteCoordinatorDialog && (
        <Card className="border-purple-200 bg-purple-50">
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
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{tc('email')}</label>
                <input
                  type="email"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{tc('country')}</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
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
    </div>
  )
}
