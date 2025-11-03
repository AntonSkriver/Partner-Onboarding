'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Target,
  CheckCircle,
  Users,
  GraduationCap,
  School,
  BookOpen,
  Globe,
  BarChart3,
  Building2,
} from 'lucide-react'
import { getCurrentSession } from '@/lib/auth/session'
import { Database } from '@/lib/types/database'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import {
  buildProgramSummariesForPartner,
  aggregateProgramMetrics,
  type ProgramSummary,
} from '@/lib/programs/selectors'

type Organization = Database['public']['Tables']['organizations']['Row']

export default function PartnerAnalyticsPage() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
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

  const programSummaries = useMemo<ProgramSummary[]>(() => {
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
  }, [])

  const loadOrganizationProfile = async () => {
    setLoading(true)
    try {
      const session = getCurrentSession()
      if (!session || session.role !== 'partner') {
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
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
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
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-600">
            Track your program performance and global reach metrics.
          </p>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
        {/* Active Projects */}
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="mx-auto mb-2 h-6 w-6 text-purple-600" />
            <div className="text-2xl font-bold text-gray-900">{programMetrics.activeProjects}</div>
            <div className="mt-1 text-xs text-gray-600">Active Projects</div>
          </CardContent>
        </Card>

        {/* Finished Projects */}
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="mx-auto mb-2 h-6 w-6 text-green-600" />
            <div className="text-2xl font-bold text-gray-900">
              {programMetrics.completedProjects}
            </div>
            <div className="mt-1 text-xs text-gray-600">Finished Projects</div>
          </CardContent>
        </Card>

        {/* Teachers */}
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="mx-auto mb-2 h-6 w-6 text-purple-600" />
            <div className="text-2xl font-bold text-gray-900">{programMetrics.teachers}</div>
            <div className="mt-1 text-xs text-gray-600">Teachers</div>
          </CardContent>
        </Card>

        {/* Students */}
        <Card>
          <CardContent className="p-4 text-center">
            <GraduationCap className="mx-auto mb-2 h-6 w-6 text-orange-600" />
            <div className="text-2xl font-bold text-gray-900">
              {programMetrics.students.toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-gray-600">Students</div>
          </CardContent>
        </Card>

        {/* Institutions */}
        <Card>
          <CardContent className="p-4 text-center">
            <School className="mx-auto mb-2 h-6 w-6 text-indigo-600" />
            <div className="text-2xl font-bold text-gray-900">{programMetrics.institutions}</div>
            <div className="mt-1 text-xs text-gray-600">Institutions</div>
          </CardContent>
        </Card>

        {/* Programs */}
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="mx-auto mb-2 h-6 w-6 text-pink-600" />
            <div className="text-2xl font-bold text-gray-900">{programSummaries.length}</div>
            <div className="mt-1 text-xs text-gray-600">Programs</div>
          </CardContent>
        </Card>

        {/* Country Reach */}
        <Card>
          <CardContent className="p-4 text-center">
            <Globe className="mx-auto mb-2 h-6 w-6 text-teal-600" />
            <div className="text-2xl font-bold text-gray-900">{programMetrics.countryCount}</div>
            <div className="mt-1 text-xs text-gray-600">Countries</div>
          </CardContent>
        </Card>
      </div>

      {/* Program Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Program Performance
          </CardTitle>
          <CardDescription>Top performing programs by student engagement</CardDescription>
        </CardHeader>
        <CardContent>
          {programSummaries.length > 0 ? (
            <div className="space-y-4">
              {programSummaries.slice(0, 5).map(({ program, metrics }, index) => (
                <div key={program.id} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-700">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {program.displayTitle ?? program.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      {metrics.studentCount} students • {metrics.institutionCount} institutions
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-600">
                      {metrics.activeProjectCount} active
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-gray-500">No program data available yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Impact Summary Card */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <CardTitle className="text-purple-900">Global Reach</CardTitle>
            <CardDescription>Your organization's international impact</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Active in</span>
                <span className="text-lg font-semibold text-purple-900">
                  {programMetrics.countryCount} countries
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Total educators</span>
                <span className="text-lg font-semibold text-purple-900">
                  {programMetrics.teachers} teachers
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Students reached</span>
                <span className="text-lg font-semibold text-purple-900">
                  {programMetrics.students.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-100 bg-gradient-to-br from-green-50 to-white">
          <CardHeader>
            <CardTitle className="text-green-900">Project Success</CardTitle>
            <CardDescription>Collaboration outcomes and completion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Active projects</span>
                <span className="text-lg font-semibold text-green-900">
                  {programMetrics.activeProjects}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Completed projects</span>
                <span className="text-lg font-semibold text-green-900">
                  {programMetrics.completedProjects}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Total programs</span>
                <span className="text-lg font-semibold text-green-900">
                  {programSummaries.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
