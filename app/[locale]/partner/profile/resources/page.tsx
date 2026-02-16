'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'

import { ProfilePageHeader } from '@/components/profile/profile-page-header'
import { ProfileResourceCatalog } from '@/components/profile/profile-resource-catalog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getCurrentSession } from '@/lib/auth/session'
import { resolvePartnerContext } from '@/lib/auth/partner-context'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { getResourcesForPartner } from '@/lib/resources/selectors'

export default function PartnerResourcesPage() {
  const t = useTranslations('profile.resources')
  const [session, setSession] = useState(() => getCurrentSession())
  const { ready: prototypeReady, database } = usePrototypeDb()

  useEffect(() => {
    setSession(getCurrentSession())
  }, [])

  const partnerContext = useMemo(
    () => resolvePartnerContext(session, database),
    [session, database],
  )

  const resources = useMemo(
    () => getResourcesForPartner(database?.resources ?? [], partnerContext.partnerId),
    [database, partnerContext.partnerId],
  )

  if (!prototypeReady) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ProfilePageHeader
        title={t('title')}
        description={t('subtitle')}
        action={
          <Button variant="profile" asChild>
            <Link href="/partner/content/upload">
              <Plus className="mr-2 h-4 w-4" />
              {t('addResources')}
            </Link>
          </Button>
        }
      />

      <ProfileResourceCatalog
        resources={resources}
        showOwnerOrganization
        emptyTitle={t('noResources')}
        emptyDescription={t('noResourcesDesc')}
        emptyAction={
          <Button variant="profile" asChild>
            <Link href="/partner/content/upload">
              <Plus className="mr-2 h-4 w-4" />
              {t('addResources')}
            </Link>
          </Button>
        }
      />
    </div>
  )
}
