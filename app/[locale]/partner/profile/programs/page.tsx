'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useState, useEffect, useMemo } from 'react'
import { ProfilePageHeader } from '@/components/profile/profile-page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Edit, Users, Building2 } from 'lucide-react'
import { getCurrentSession, isOnboardedUser } from '@/lib/auth/session'
import { Database } from '@/lib/types/database'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { buildProgramCatalog, getProgramsForPartner } from '@/lib/programs/selectors'
import { ProgramCatalogCard } from '@/components/program/program-catalog-card'

type Organization = Database['public']['Tables']['organizations']['Row']

export default function PartnerProgramsPage() {
  const t = useTranslations('programs')
  const tDashboard = useTranslations('dashboard')
  const [session] = useState(() => getCurrentSession())
  const sessionRole = session?.role ?? null
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const { ready: prototypeReady, database } = usePrototypeDb()

  const partnerRecord = useMemo(() => {
    if (!database) return null
    if (isOnboardedUser(session)) return null
    const normalizedName = organization?.name?.trim().toLowerCase()
    if (normalizedName) {
      const match = database.partners.find(
        (partner) => partner.organizationName.toLowerCase() === normalizedName,
      )
      if (match) return match
    }
    return null
  }, [database, organization?.name, session?.source])

  const programCatalog = useMemo(() => {
    if (!database) return []

    const catalog = buildProgramCatalog(database, { includePrivate: true })

    // Parents can see all programs; partners are limited to their own plus related ones
    if (sessionRole === 'parent') {
      return catalog
    }

    if (!partnerRecord) return []

    const relatedPrograms = getProgramsForPartner(database, partnerRecord.id, {
      includeRelatedPrograms: true,
    })
    const allowedProgramIds = new Set(relatedPrograms.map((program) => program.id))

    return catalog
      .filter((item) => allowedProgramIds.has(item.programId))
  }, [database, partnerRecord, sessionRole])

  // Once the prototype DB is ready, we can determine programs.
  // For fresh users without a seed partner match, show empty state (not perpetual loading).
  const programDataLoading = !prototypeReady || !database

  useEffect(() => {
    loadOrganizationProfile()
  }, [])

  const loadOrganizationProfile = async () => {
    setLoading(true)
    try {
      const session = getCurrentSession()
      const organizationName = session?.organization ?? 'Partner Organization'

      setOrganization({
        id: 'session-org',
        name: organizationName,
        organization_type: 'ngo',
        website: null,
        logo: null,
        short_description: null,
        primary_contacts: [],
        regions_of_operation: [],
        countries_of_operation: [],
        languages: [],
        sdg_tags: [],
        thematic_tags: [],
        verification_status: 'pending',
        brand_settings: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      })
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
        action={
          <Button variant="profile" asChild>
            <Link href="/partner/programs/create">
              <Plus className="mr-2 h-4 w-4" />
              {t('createProgram')}
            </Link>
          </Button>
        }
      />

      {/* Programs Grid */}
      {programDataLoading ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-gray-500">
            {t('loadingPrograms')}
          </CardContent>
        </Card>
      ) : programCatalog.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programCatalog.map((item) => (
            <ProgramCatalogCard
              key={item.programId}
              item={item}
              actions={
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/partner/programs/${item.programId}`}>{t('viewDetails')}</Link>
                  </Button>
                  <Button variant="profile" className="w-full" asChild>
                    <Link href={`/partner/programs/${item.programId}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      {t('editProgram')}
                    </Link>
                  </Button>
                </>
              }
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="space-y-5 p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-50">
              <Plus className="h-8 w-8 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{t('noPrograms')}</h3>
            <p className="mx-auto max-w-md text-gray-500">
              {t('noProgramsDesc')}
            </p>
            <Button variant="profile" size="lg" asChild>
              <Link href="/partner/programs/create">
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
