'use client'

import { Link } from '@/i18n/navigation'
import { useMemo, useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Plus } from 'lucide-react'

import { ProfilePageHeader } from '@/components/profile/profile-page-header'
import { ProfileResourceCatalog } from '@/components/profile/profile-resource-catalog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { getResourcesForParent } from '@/lib/resources/selectors'
import { getCurrentSession } from '@/lib/auth/session'
import { getScopedParentPartnerIds } from '@/lib/parent/network'

export default function ParentResourcesPage() {
  const t = useTranslations('profile.resources')
  const { ready: prototypeReady, database } = usePrototypeDb()
  const [session, setSession] = useState(() => getCurrentSession())

  useEffect(() => {
    setSession(getCurrentSession())
  }, [])

  const resources = useMemo(() => {
    const allResources = database?.resources ?? []
    if (!database) {
      return getResourcesForParent(allResources)
    }

    const allowedPartnerIds = new Set(
      getScopedParentPartnerIds(database, session?.organization),
    )

    const scoped = allResources.filter((resource) => {
      if (resource.ownerRole === 'parent') {
        return true
      }

      if (!resource.ownerPartnerId) {
        return false
      }

      return allowedPartnerIds.has(resource.ownerPartnerId)
    })

    return getResourcesForParent(scoped)
  }, [database, session?.organization])

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
        description={t('subtitleParent')}
        action={
          <Button variant="profile" asChild>
            <Link href="/parent/content/upload">
              <Plus className="mr-2 h-4 w-4" />
              {t('uploadResource')}
            </Link>
          </Button>
        }
      />

      <ProfileResourceCatalog
        resources={resources}
        showOwnerOrganization
        showAvailabilityScope
        emptyTitle={t('noResources')}
        emptyDescription={t('noResourcesParentDesc')}
        emptyAction={
          <Button variant="profile" asChild>
            <Link href="/parent/content/upload">
              <Plus className="mr-2 h-4 w-4" />
              {t('uploadResource')}
            </Link>
          </Button>
        }
      />
    </div>
  )
}
