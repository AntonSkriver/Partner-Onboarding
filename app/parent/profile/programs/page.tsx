'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
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

type Organization = Database['public']['Tables']['organizations']['Row']

export default function ParentProgramsPage() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const { ready: prototypeReady, database } = usePrototypeDb()

  const catalogItems = useMemo<ProgramCatalogItem[]>(() => {
    if (!prototypeReady || !database) return []
    const allowedHosts = new Set(['partner-unicef', 'partner-unicef-england'])
    const desiredOrder = [
      'program-communities-2025',
      'program-uk-climate-2025',
      'program-child-world-2025',
    ]

    return buildProgramCatalog(database)
      .filter((item) => {
        const hostId = item.hostPartner?.id
        const isAllowedHost = hostId && allowedHosts.has(hostId)
        const isExcluded = item.programId === 'program-build-the-change-2025' || item.programId === 'program-uk-digital-2025'
        return isAllowedHost && !isExcluded
      })
      .sort((a, b) => {
        const indexA = desiredOrder.indexOf(a.programId)
        const indexB = desiredOrder.indexOf(b.programId)
        if (indexA === -1 && indexB === -1) return 0
        if (indexA === -1) return 1
        if (indexB === -1) return -1
        return indexA - indexB
      })
  }, [prototypeReady, database])

  useEffect(() => {
    loadOrganizationProfile()
  }, [])

  const loadOrganizationProfile = async () => {
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
        countries_of_operation: ['Denmark', 'England'],
        languages: ['English', 'French', 'Spanish'],
        sdg_tags: ['4', '5', '10', '13', '16', '17'],
        thematic_tags: ["Children's Rights", 'Global Citizenship', 'Healthy Communities'],
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Programs</h1>
            <p className="text-sm text-gray-600">
              Parent view of programs across UNICEF country partners.
            </p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700" asChild>
            <Link href="/partner/programs/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Program
            </Link>
          </Button>
        </div>
      </div>

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
                    <Link href={`/partner/programs/${item.programId}`}>View Details</Link>
                  </Button>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                    <Link href={`/partner/programs/${item.programId}/edit`}>Edit Program</Link>
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
            <h3 className="text-lg font-medium text-gray-900">No Programs Yet</h3>
            <p className="text-gray-500">
              Create your first program to start collaborating with schools worldwide.
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700" asChild>
              <Link href="/partner/programs/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Program
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
