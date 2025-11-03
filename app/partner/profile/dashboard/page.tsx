'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Building2,
  Layers,
  BookOpen,
  BarChart3,
  Users,
  Globe,
  Mail,
} from 'lucide-react'
import { getCurrentSession } from '@/lib/auth/session'
import { Database } from '@/lib/types/database'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import {
  buildProgramSummariesForPartner,
  aggregateProgramMetrics,
} from '@/lib/programs/selectors'

type Organization = Database['public']['Tables']['organizations']['Row']

export default function PartnerDashboardPage() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const { ready: prototypeReady, database } = usePrototypeDb()

  const partnerRecord = useMemo(() => {
    if (!database || !organization) return null
    const normalizedName = organization.name?.trim().toLowerCase()
    if (normalizedName) {
      const match = database.partners.find(
        (partner) => partner.organizationName.toLowerCase() === normalizedName,
      )
      if (match) return match
    }
    return database.partners.length > 0 ? database.partners[0] : null
  }, [database, organization?.name])

  const programSummaries = useMemo(() => {
    if (!prototypeReady || !database || !partnerRecord) {
      return []
    }
    return buildProgramSummariesForPartner(database, partnerRecord.id, {
      includeRelatedPrograms: true,
    })
  }, [prototypeReady, database, partnerRecord])

  const programMetrics = useMemo(
    () => aggregateProgramMetrics(programSummaries),
    [programSummaries],
  )

  useEffect(() => {
    loadOrganizationProfile()
    setSession(getCurrentSession())
  }, [])

  const loadOrganizationProfile = async () => {
    setLoading(true)
    try {
      const currentSession = getCurrentSession()
      if (!currentSession || currentSession.role !== 'partner') {
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
          <h2 className="mb-2 text-lg font-semibold text-gray-900">No Organization Profile</h2>
          <p className="text-gray-600">Please create an organization profile to get started.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-gray-900">
            Hi, {session?.organization ?? 'Partner'}
          </h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-600" />
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">{programMetrics.countryCount}</p>
                <p className="text-xs text-gray-600">Countries</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-600" />
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">{programSummaries.length}</p>
                <p className="text-xs text-gray-600">Programs</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">{programMetrics.teachers}</p>
                <p className="text-xs text-gray-600">Teachers</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Your Global Learning Hub</h2>
          <p className="text-sm text-gray-600">
            Everything you need for global classroom partnerships.
          </p>
        </div>

        {/* Grid of Navigation Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Overview Card */}
          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Overview</h3>
                <p className="text-sm text-gray-600">
                  View your organization profile and key information.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="px-0 text-sm text-purple-600 hover:text-purple-700">
                  Learn More
                </Button>
                <Button
                  className="bg-purple-600 text-white hover:bg-purple-700"
                  size="sm"
                  asChild
                >
                  <Link href="/partner/profile/overview">View</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Programs Card */}
          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Layers className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">My Programs</h3>
                <p className="text-sm text-gray-600">
                  Create and manage your global education programs.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="px-0 text-sm text-purple-600 hover:text-purple-700">
                  Learn More
                </Button>
                <Button
                  className="bg-purple-600 text-white hover:bg-purple-700"
                  size="sm"
                  asChild
                >
                  <Link href="/partner/profile/programs">Go to programs</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resources Card */}
          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Resources</h3>
                <p className="text-sm text-gray-600">
                  Manage educational resources and teaching materials.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="px-0 text-sm text-purple-600 hover:text-purple-700">
                  Learn More
                </Button>
                <Button
                  className="bg-purple-600 text-white hover:bg-purple-700"
                  size="sm"
                  asChild
                >
                  <Link href="/partner/profile/resources">Explore</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analytics Card */}
          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                <p className="text-sm text-gray-600">
                  Track your program performance and global reach.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="px-0 text-sm text-purple-600 hover:text-purple-700">
                  Learn More
                </Button>
                <Button
                  className="bg-purple-600 text-white hover:bg-purple-700"
                  size="sm"
                  asChild
                >
                  <Link href="/partner/profile/analytics">View metrics</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Network Card */}
          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Network</h3>
                <p className="text-sm text-gray-600">
                  Manage coordinators and educational institutions.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="px-0 text-sm text-purple-600 hover:text-purple-700">
                  Learn More
                </Button>
                <Button
                  className="bg-purple-600 text-white hover:bg-purple-700"
                  size="sm"
                  asChild
                >
                  <Link href="/partner/profile/network">Manage</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contact Card */}
          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                <p className="text-sm text-gray-600">View and update your contact details.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="px-0 text-sm text-purple-600 hover:text-purple-700">
                  Learn More
                </Button>
                <Button
                  className="bg-purple-600 text-white hover:bg-purple-700"
                  size="sm"
                  asChild
                >
                  <Link href="/partner/profile/overview">View</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
