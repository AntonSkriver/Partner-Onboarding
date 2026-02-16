'use client'

import { Link } from '@/i18n/navigation'
import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { ProfilePageHeader } from '@/components/profile/profile-page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Users, Building2 } from 'lucide-react'
import { getCurrentSession } from '@/lib/auth/session'
import { Database } from '@/lib/types/database'
import type { ProgramCatalogItem } from '@/lib/programs/selectors'
import { ProgramCatalogCard } from '@/components/program/program-catalog-card'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { buildProgramCatalog } from '@/lib/programs/selectors'
import {
  getParentOrganizationProfilePreset,
  getScopedParentPartnerIds,
} from '@/lib/parent/network'

type Organization = Database['public']['Tables']['organizations']['Row']

export default function ParentProgramsPage() {
  const t = useTranslations('programs')
  const tDash = useTranslations('dashboard')
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(() => getCurrentSession())
  const { ready: prototypeReady, database } = usePrototypeDb()

  const catalogItems = useMemo<ProgramCatalogItem[]>(() => {
    if (!prototypeReady || !database) return []
    const allowedHosts = new Set(getScopedParentPartnerIds(database, session?.organization))

    return buildProgramCatalog(database)
      .filter((item) => {
        const hostId = item.hostPartner?.id
        return Boolean(hostId && allowedHosts.has(hostId))
      })
      .sort((a, b) => {
        return b.metrics.students - a.metrics.students
      })
  }, [prototypeReady, database, session?.organization])

  useEffect(() => {
    loadOrganizationProfile()
    setSession(getCurrentSession())
  }, [])

  const loadOrganizationProfile = async () => {
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
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
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
        description={t('subtitleParent')}
        action={
          <Button variant="profile" asChild>
            <Link href="/parent/profile/programs/create">
              <Plus className="mr-2 h-4 w-4" />
              {t('createProgram')}
            </Link>
          </Button>
        }
      />

      {/* Programs Grid */}
      {catalogItems.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {catalogItems.map((item) => (
            <ProgramCatalogCard
              key={item.programId}
              item={item}
              actions={
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/partner/programs/${item.programId}`}>{t('viewDetails')}</Link>
                  </Button>
                  <Button variant="profile" className="w-full" asChild>
                    <Link href={`/parent/profile/programs/${item.programId}/edit`}>{t('editProgram')}</Link>
                  </Button>
                </>
              }
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="space-y-4 p-10 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">{t('noPrograms')}</h3>
            <p className="text-gray-500">
              {t('noProgramsDesc')}
            </p>
            <Button variant="profile" asChild>
              <Link href="/parent/profile/programs/create">
                <Plus className="mr-2 h-4 w-4" />
                {t('createProgram')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
