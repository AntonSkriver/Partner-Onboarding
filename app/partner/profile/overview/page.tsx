'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Mail,
  BarChart3,
  Award,
  Tag,
  Target,
  Edit,
  Building2,
  ShieldCheck,
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

const CRC_ARTICLE_DETAILS: Record<
  string,
  { title: string }
> = {
  '12': {
    title: 'Respect for the views of the child',
  },
  '13': {
    title: 'Freedom of expression',
  },
  '24': {
    title: 'Health and health services',
  },
  '28': {
    title: 'Right to education',
  },
  '31': {
    title: 'Leisure, play, and culture',
  },
}

type PartnerResource = {
  id: string
  title: string
}

type OrganizationContact = {
  name?: string
  email?: string
  phone?: string | null
  role?: string | null
  isPrimary?: boolean | null
}

type ChildRightsEntry = {
  article: string
  title: string
  iconSrc: string
}

const parseContacts = (rawContacts: Organization['primary_contacts']): OrganizationContact[] => {
  if (!rawContacts || !Array.isArray(rawContacts)) {
    return []
  }

  return rawContacts
    .map((entry) => (typeof entry === 'object' && entry !== null ? entry : null))
    .filter((entry): entry is Record<string, unknown> => entry !== null)
    .map((entry) => ({
      name: typeof entry.name === 'string' ? entry.name : undefined,
      email: typeof entry.email === 'string' ? entry.email : undefined,
      phone: typeof entry.phone === 'string' ? entry.phone : undefined,
      role: typeof entry.role === 'string' ? entry.role : undefined,
      isPrimary: typeof entry.isPrimary === 'boolean' ? entry.isPrimary : undefined,
    }))
}

const extractChildRightsFocus = (org: Organization | null): string[] => {
  if (!org) return []
  const raw = (org as unknown as { child_rights_focus?: unknown }).child_rights_focus
  if (!raw || !Array.isArray(raw)) {
    return []
  }
  return raw
    .map((value) => (value === null || value === undefined ? '' : String(value).trim()))
    .filter((value): value is string => value.length > 0)
}

export default function PartnerOverviewPage() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [resources, setResources] = useState<PartnerResource[]>([])
  const [childRightsFocus, setChildRightsFocus] = useState<string[]>([])
  const { ready: prototypeReady, database } = usePrototypeDb()

  const normalizedOrganizationName = organization?.name
    ? organization.name.trim().toLowerCase()
    : null

  const partnerRecord = useMemo(() => {
    if (!database) return null
    if (normalizedOrganizationName) {
      const match = database.partners.find(
        (partner) => partner.organizationName.toLowerCase() === normalizedOrganizationName,
      )
      if (match) return match
    }
    return database.partners.length > 0 ? database.partners[0] : null
  }, [database, normalizedOrganizationName])

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

      // For demo purposes - sample organization data
      const sampleOrg: Organization = {
        id: 'demo-org-id',
        name: 'UNICEF Denmark',
        organization_type: 'ngo',
        website: 'https://unicef.dk',
        logo: null,
        short_description:
          'Connecting classrooms worldwide through collaborative learning experiences aligned with UN Sustainable Development Goals',
        primary_contacts: [
          {
            name: 'Christian Bindslev',
            email: 'Christian@unicef.dk',
            role: 'Project Leader',
            isPrimary: true,
          },
          {
            name: 'Mette Victoria',
            email: 'Mette@unicef.dk',
            role: 'Country Coordinator',
            isPrimary: false,
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
          'Healthy Communities',
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
      setChildRightsFocus(['12', '24', '28'])
    } catch (err) {
      console.error('Error loading organization profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const primaryContacts = parseContacts(organization?.primary_contacts ?? null)
  const primaryContact = primaryContacts.find((contact) => contact.isPrimary) || primaryContacts[0]

  const normalizedSdgTags = Array.isArray(organization?.sdg_tags)
    ? organization.sdg_tags
        .map((sdg) => (typeof sdg === 'string' ? Number.parseInt(sdg, 10) : sdg))
        .filter((sdg) => Number.isInteger(sdg))
    : []

  const sdgFocus = normalizedSdgTags.length > 0 ? normalizedSdgTags : [4]
  const sdgFocusDisplay = useMemo(
    () => sdgFocus.filter((sdgId) => sdgId !== 17),
    [sdgFocus],
  )

  const organizationChildRights = extractChildRightsFocus(organization)

  const normalizedChildRights = useMemo(() => {
    const base = organizationChildRights.length > 0 ? organizationChildRights : childRightsFocus
    const seen = new Set<string>()
    const collected: string[] = []
    base.forEach((value) => {
      if (value === null || value === undefined) return
      const key = String(value).trim()
      if (!key) return
      if (!seen.has(key)) {
        seen.add(key)
        collected.push(key)
      }
    })
    return collected
  }, [organizationChildRights, childRightsFocus])

  const childRightsEntries: ChildRightsEntry[] = useMemo(() => {
    if (normalizedChildRights.length === 0) {
      return []
    }
    return normalizedChildRights.map((article) => {
      const fallback = {
        title: `Article ${article}`,
      }
      const details = CRC_ARTICLE_DETAILS[article] ?? fallback
      const padded = article.padStart(2, '0')

      return {
        article,
        title: details.title,
        iconSrc: `/crc/icons/article-${padded}.png`,
      }
    })
  }, [normalizedChildRights])

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
                  <span className="text-gray-800">{primaryContact.email}</span>
                </div>
              </div>
            )}
            {primaryContacts.length > 1 && (
              <div className="space-y-3 border-t border-gray-100 pt-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Other contacts
                </div>
                <div className="space-y-3">
                  {primaryContacts
                    .filter((contact) => contact !== primaryContact)
                    .map((contact, index) => (
                      <div key={`${contact.email ?? contact.name ?? index}`} className="space-y-1">
                        <div className="text-sm font-medium">{contact.name}</div>
                        {contact.role && (
                          <div className="text-xs text-gray-600">{contact.role}</div>
                        )}
                        {contact.email && (
                          <div className="flex items-center space-x-2 text-sm text-gray-800">
                            <Mail className="h-3 w-3" />
                            <span>{contact.email}</span>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Thematic Areas */}
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
            UNICEF Danmark works to secure all children&rsquo;s rights through fundraising,
            education and advocacy in Denmark. We collaborate with schools, organizations and
            communities to create awareness about children&rsquo;s global situation and mobilize
            resources for UNICEF&rsquo;s work worldwide.
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
            <CardDescription>
              Priority Sustainable Development Goals this partnership advances.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sdgFocusDisplay.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {sdgFocusDisplay.map((sdgId) => {
                  const sdg = SDG_OPTIONS.find((s) => s.id === sdgId)
                  return sdg ? (
                    <div key={sdgId} className="flex flex-col items-center gap-2">
                      <SDGIcon number={sdgId} size="lg" showTitle={false} />
                      <p className="text-center text-xs leading-tight text-gray-900">
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

        {/* Child Rights Focus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              CRC Child Rights Focus
            </CardTitle>
            <CardDescription>
              Priority articles from the UN Convention on the Rights of the Child supported through
              this partnership.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {childRightsEntries.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {childRightsEntries.map((entry) => (
                  <div key={entry.article} className="flex flex-col items-center gap-2">
                    <div className="relative h-24 w-24">
                      <Image
                        src={entry.iconSrc}
                        alt={entry.title}
                        fill
                        sizes="96px"
                        className="rounded object-contain"
                      />
                    </div>
                    <p className="text-center text-xs leading-tight text-gray-900">
                      {entry.title}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Add your Convention on the Rights of the Child focus areas to highlight key articles
                you champion.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
