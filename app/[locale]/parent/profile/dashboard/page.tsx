'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Building2 } from 'lucide-react'

import { ProfileDashboardGrid } from '@/components/profile/profile-dashboard-grid'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getCurrentSession } from '@/lib/auth/session'
import { buildProfileDashboardCards } from '@/lib/profile/dashboard-cards'
import { Database } from '@/lib/types/database'
import { getParentOrganizationProfilePreset } from '@/lib/parent/network'

type Organization = Database['public']['Tables']['organizations']['Row']
export default function ParentDashboardPage() {
  const t = useTranslations('dashboard')
  const tc = useTranslations('common')

  const parentDashboardCards = buildProfileDashboardCards('/parent/profile', {
    resources: {
      description: t('reviewResources'),
      ctaLabel: tc('browse'),
    },
  })
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<ReturnType<typeof getCurrentSession>>(null)
  useEffect(() => {
    loadOrganizationProfile()
    setSession(getCurrentSession())
  }, [])

  const loadOrganizationProfile = async () => {
    setLoading(true)
    try {
      const currentSession = getCurrentSession()
      if (!currentSession || currentSession.role !== 'parent') {
        return
      }

      const preset = getParentOrganizationProfilePreset(currentSession.organization)

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

      setOrganization(sampleOrg)
    } catch (err) {
      console.error('Error loading organization profile:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!organization) {
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <Building2 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h2 className="mb-2 text-lg font-semibold text-gray-900">{t('noOrgProfile')}</h2>
          <p className="text-gray-600">{t('pleaseCreateProfile')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <ProfileDashboardGrid greeting={t('hi', { name: session?.organization ?? 'Parent' })} cards={parentDashboardCards} />
  )
}
