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
import { GraduationCap } from 'lucide-react'

type Organization = Database['public']['Tables']['organizations']['Row']

export default function ParentDashboardPage() {
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

  const filteredProgramSummaries = useMemo(() => {
    const allowedHosts = new Set(['partner-unicef', 'partner-unicef-england'])
    const excluded = new Set(['program-build-the-change-2025', 'program-uk-digital-2025'])
    return programSummaries.filter(
      (summary) => allowedHosts.has(summary.program.partnerId) && !excluded.has(summary.program.id),
    )
  }, [programSummaries])

  const programMetrics = useMemo(() => aggregateProgramMetrics(filteredProgramSummaries), [filteredProgramSummaries])

  const displayStats = useMemo(() => {
    if (filteredProgramSummaries.length === 0) {
      return {
        programs: 2,
        countries: 2,
        teachers: 8,
        students: 5200,
      }
    }
    const allowedCountries = new Set(['DK', 'UK'])
    const countrySet = new Set<string>()
    filteredProgramSummaries.forEach((summary) => {
      summary.metrics.countries.forEach((c) => {
        if (allowedCountries.has(c)) {
          countrySet.add(c)
        }
      })
    })
    return {
      programs: filteredProgramSummaries.length,
      countries: countrySet.size || programMetrics.countryCount || 2,
      teachers: programMetrics.teachers,
      students: programMetrics.students,
    }
  }, [filteredProgramSummaries, programMetrics])

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
        countries_of_operation: ['Denmark', 'United Kingdom'],
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
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-gray-900">
            Hi, {session?.organization ?? 'Parent'}
          </h1>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              {
                label: 'Countries',
                value: displayStats.countries,
                icon: Globe,
                color: 'text-purple-700',
                bg: 'bg-purple-50',
              },
              {
                label: 'Programs',
                value: displayStats.programs,
                icon: Layers,
                color: 'text-blue-700',
                bg: 'bg-blue-50',
              },
              {
                label: 'Teachers',
                value: displayStats.teachers,
                icon: Users,
                color: 'text-emerald-700',
                bg: 'bg-emerald-50',
              },
              {
                label: 'Students',
                value: displayStats.students.toLocaleString(),
                icon: GraduationCap,
                color: 'text-amber-700',
                bg: 'bg-amber-50',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                  <p className="text-xs uppercase tracking-wide text-gray-500">{stat.label}</p>
                </div>
              </div>
            ))}
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
