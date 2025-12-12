'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Edit, Users, Building2 } from 'lucide-react'
import { getCurrentSession } from '@/lib/auth/session'
import { Database } from '@/lib/types/database'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { buildProgramCatalog, getProgramsForPartner } from '@/lib/programs/selectors'
import { ProgramCatalogCard } from '@/components/program/program-catalog-card'

type Organization = Database['public']['Tables']['organizations']['Row']

export default function PartnerProgramsPage() {
  const [sessionRole] = useState<'partner' | 'parent' | 'teacher' | 'student' | null>(
    () => getCurrentSession()?.role ?? null,
  )
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const { ready: prototypeReady, database } = usePrototypeDb()

  const partnerRecord = useMemo(() => {
    if (!database) return null
    const normalizedName = organization?.name?.trim().toLowerCase()
    if (normalizedName) {
      const match = database.partners.find(
        (partner) => partner.organizationName.toLowerCase() === normalizedName,
      )
      if (match) return match
    }
    return database.partners.length > 0 ? database.partners[0] : null
  }, [database, organization?.name])

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
      .filter((item) => !item.name.includes('Save the Children'))
  }, [database, partnerRecord, sessionRole])

  const programDataLoading = !prototypeReady || !database || (sessionRole !== 'parent' && !partnerRecord)

  useEffect(() => {
    loadOrganizationProfile()
  }, [])

  const loadOrganizationProfile = async () => {
    setLoading(true)
    try {
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
              Manage and create programs for schools and educators worldwide.
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
      {programDataLoading ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-gray-500">
            Loading programs…
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
                    <Link href={`/partner/programs/${item.programId}`}>View Details</Link>
                  </Button>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                    <Link href={`/partner/programs/${item.programId}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Program
                    </Link>
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
