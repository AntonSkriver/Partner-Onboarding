'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Mail,
  MapPin,
  BarChart3,
  Award,
  Tag,
  Target,
  Edit,
  Building2,
} from 'lucide-react'
import { getCurrentSession } from '@/lib/auth/session'
import { Database } from '@/lib/types/database'
import { SDGIcon } from '@/components/sdg-icons'
import { SDG_OPTIONS } from '@/contexts/partner-onboarding-context'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import {
  buildProgramSummariesForPartner,
  type ProgramSummary,
} from '@/lib/programs/selectors'

type Organization = Database['public']['Tables']['organizations']['Row']

export default function PartnerOverviewPage() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [resources, setResources] = useState<any[]>([])
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
        name: 'UNICEF Learning Lab',
        organization_type: 'ngo',
        website: 'https://unicef.dk',
        logo: null,
        short_description:
          'Connecting classrooms worldwide through collaborative learning experiences aligned with UN Sustainable Development Goals',
        primary_contacts: [
          {
            name: 'Sarah Hansen',
            email: 'sarah@unicef.dk',
            phone: '+45 35 27 35 35',
            role: 'Program Director',
            isPrimary: true,
          },
        ],
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

      const mockResources = [
        {
          id: 'children-rights-toolkit',
          title: "Children's Rights Education Toolkit",
        },
        {
          id: 'cultural-exchange-framework',
          title: 'Cultural Exchange Learning Framework',
        },
        {
          id: 'sustainability-action-guide',
          title: 'Climate Action for Young Leaders',
        },
      ]

      setOrganization(sampleOrg)
      setResources(mockResources)
    } catch (err) {
      console.error('Error loading organization profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const primaryContacts = Array.isArray(organization?.primary_contacts)
    ? (organization.primary_contacts as any[])
    : []
  const primaryContact = primaryContacts.find((contact) => contact.isPrimary) || primaryContacts[0]

  const normalizedSdgTags = Array.isArray(organization?.sdg_tags)
    ? organization.sdg_tags
        .map((sdg) => (typeof sdg === 'string' ? Number.parseInt(sdg, 10) : sdg))
        .filter((sdg) => Number.isInteger(sdg))
    : []

  const sdgFocus = normalizedSdgTags.length > 0 ? normalizedSdgTags : [4]

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-48 rounded-2xl" />
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
          <h1 className="text-3xl font-semibold text-gray-900">{organization.name}</h1>
          <Button variant="outline" asChild>
            <Link href="/partner/profile/edit">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Organization Overview</h2>
          <p className="text-sm text-gray-600">
            View your organization profile and key information.
          </p>
        </div>
      </div>

      {/* Detailed Information Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {primaryContact && (
              <div className="space-y-2">
                <div className="font-medium">{primaryContact.name}</div>
                <div className="text-sm text-gray-600">{primaryContact.role}</div>
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-3 w-3" />
                  <span>{primaryContact.email}</span>
                </div>
              </div>
            )}
            {primaryContacts.length > 1 && (
              <div className="text-sm text-gray-500">
                +{primaryContacts.length - 1} more contact{primaryContacts.length > 2 ? 's' : ''}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Geographic Scope */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Geographic Scope
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 text-sm font-medium text-gray-700">Countries</div>
              <div className="flex flex-wrap gap-1">
                {organization.countries_of_operation.slice(0, 3).map((country) => (
                  <Badge key={country} variant="secondary" className="text-xs">
                    {country}
                  </Badge>
                ))}
                {organization.countries_of_operation.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{organization.countries_of_operation.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-purple-600">{programSummaries.length}</div>
                <div className="text-sm text-gray-600">Active Programs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{resources.length}</div>
                <div className="text-sm text-gray-600">Resources</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mission Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Our Mission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-gray-700">
            UNICEF Danmark works to secure all children's rights through fundraising, education and
            advocacy in Denmark. We collaborate with schools, organizations and communities to
            create awareness about children's global situation and mobilize resources for UNICEF's
            work worldwide.
          </p>
        </CardContent>
      </Card>

      {/* Focus Areas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* SDG Focus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              UN SDG Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sdgFocus.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {sdgFocus.map((sdgId) => {
                  const sdg = SDG_OPTIONS.find((s) => s.id === sdgId)
                  return sdg ? (
                    <div key={sdgId} className="flex flex-col items-center">
                      <SDGIcon
                        number={sdgId}
                        size="md"
                        showTitle={false}
                        className="h-16 w-16 rounded-lg object-cover shadow-sm transition-shadow hover:shadow-md"
                      />
                      <p className="mt-1 text-center text-xs leading-tight text-gray-600">
                        {sdg.title}
                      </p>
                    </div>
                  ) : null
                })}
              </div>
            ) : (
              <p className="text-gray-500">No SDG focus areas specified</p>
            )}
          </CardContent>
        </Card>

        {/* Thematic Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Thematic Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {organization.thematic_tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {organization.thematic_tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No thematic areas specified</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
