'use client'

import { Link } from '@/i18n/navigation'
import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { ProfilePageHeader } from '@/components/profile/profile-page-header'
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
  MapPin,
  Layers,
  BookOpen,
  Users,
  Globe,
} from 'lucide-react'
import { getCurrentSession } from '@/lib/auth/session'
import { Database } from '@/lib/types/database'
import { SDGIcon } from '@/components/sdg-icons'
import { SDG_OPTIONS } from '@/contexts/partner-onboarding-context'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import {
  buildProgramSummary,
  aggregateProgramMetrics,
  type ProgramSummary,
} from '@/lib/programs/selectors'
import {
  getParentOrganizationProfilePreset,
  getScopedParentPartnerIds,
} from '@/lib/parent/network'

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

const parseContacts = (rawContacts: Organization['primary_contacts'] | null | undefined): OrganizationContact[] => {
  if (!rawContacts || !Array.isArray(rawContacts)) {
    return []
  }

  return (rawContacts as any[])
    .filter((entry) => typeof entry === 'object' && entry !== null)
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

export default function ParentOverviewPage() {
  const t = useTranslations('profile.overview')
  const tc = useTranslations('common')
  const tcrc = useTranslations('crc')
  const tDash = useTranslations('dashboard')
  const [session, setSession] = useState(() => getCurrentSession())
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [resources, setResources] = useState<PartnerResource[]>([])
  const [childRightsFocus, setChildRightsFocus] = useState<string[]>([])
  const { ready: prototypeReady, database } = usePrototypeDb()

  const programSummaries = useMemo<ProgramSummary[]>(() => {
    if (!prototypeReady || !database) {
      return []
    }
    const scopedPartnerIds = new Set(
      getScopedParentPartnerIds(database, session?.organization || organization?.name),
    )
    return database.programs
      .filter((program) => scopedPartnerIds.has(program.partnerId))
      .map((program) => buildProgramSummary(database, program))
  }, [prototypeReady, database, session?.organization, organization?.name])

  useEffect(() => {
    setSession(getCurrentSession())
    loadOrganizationProfile()
  }, [])

  const loadOrganizationProfile = async () => {
    setLoading(true)
    try {
      const session = getCurrentSession()
      if (!session || session.role !== 'parent') {
        return
      }

      const preset = getParentOrganizationProfilePreset(session.organization)

      // For demo purposes - sample parent organization data
      const sampleOrg: Organization = {
        id: 'parent-org-id',
        name: preset.name,
        organization_type: 'ngo',
        website: preset.website,
        logo: null,
        short_description: preset.shortDescription,
        primary_contacts: preset.contacts,
        regions_of_operation: ['Global'],
        countries_of_operation: preset.countries,
        languages: preset.languages,
        sdg_tags: preset.sdgTags,
        thematic_tags: preset.thematicTags,
        verification_status: 'verified',
        brand_settings: null,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-03-10T15:30:00Z',
        is_active: true,
      }

      const mockResources = [
        {
          id: 'global-toolkit',
          title: 'Country Team Onboarding Toolkit',
        },
        {
          id: 'country-playbook',
          title: 'Country Collaboration Playbook',
        },
        {
          id: 'impact-dashboard',
          title: 'Impact & Reporting Guide',
        },
      ]

      setOrganization(sampleOrg)
      setResources(mockResources)
      setChildRightsFocus(['12', '24', '28', '31'])
    } catch (err) {
      console.error('Error loading parent organization profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const primaryContacts = parseContacts(organization?.primary_contacts)
  const primaryContact = primaryContacts.find((contact) => contact.isPrimary) || primaryContacts[0]
  const countryCount = organization?.countries_of_operation?.length ?? 0

  const filteredProgramSummaries = useMemo(() => {
    return programSummaries
  }, [programSummaries])

  const parentPreset = useMemo(
    () => getParentOrganizationProfilePreset(session?.organization || organization?.name),
    [session?.organization, organization?.name],
  )

  const aggregatedMetrics = useMemo(() => {
    if (filteredProgramSummaries.length === 0) {
      return {
        programs: 2,
        resources: 3,
        countries: countryCount || 2,
        students: 5200,
      }
    }
    const agg = aggregateProgramMetrics(filteredProgramSummaries)
    return {
      programs: filteredProgramSummaries.length,
      resources: resources.length || 3,
      countries: agg.countryCount || countryCount || 2,
      students: agg.students || 5200,
    }
  }, [filteredProgramSummaries, resources.length, countryCount])

  const sdgFocusDisplay = useMemo(() => {
    const normalizedSdgTags = Array.isArray(organization?.sdg_tags)
      ? organization.sdg_tags
          .map((sdg) => (typeof sdg === 'string' ? Number.parseInt(sdg, 10) : sdg))
          .filter((sdg) => Number.isInteger(sdg))
      : []
    const sdgFocus = normalizedSdgTags.length > 0 ? normalizedSdgTags : [4]
    return sdgFocus.filter((sdgId) => sdgId !== 17)
  }, [organization?.sdg_tags])

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
          <h2 className="mb-2 text-lg font-semibold text-gray-900">{tDash('noOrgProfile')}</h2>
          <p className="text-gray-600">{tDash('pleaseCreateProfile')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="space-y-6">
        <ProfilePageHeader
          title={organization.name}
          description={t('subtitle')}
          action={
            <Button variant="outline" asChild>
              <Link href="/parent/profile/edit">
                <Edit className="mr-2 h-4 w-4" />
                {t('editProfile')}
              </Link>
            </Button>
          }
        />
      </div>

      {/* Detailed Information Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {t('contactInfo')}
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
                  {t('otherContacts')}
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
              {t('thematicAreas')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(organization.thematic_tags ?? []).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {(organization.thematic_tags ?? []).map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">{t('noThematicAreas')}</p>
            )}
          </CardContent>
        </Card>
        {/* Geographic Scope */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t('geographicScope')}
            </CardTitle>
            <CardDescription>{t('geographicScopeDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {organization.countries_of_operation.map((country) => (
                <Badge key={country} variant="secondary" className="text-xs">
                  {country}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mission Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            {t('ourMission')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-gray-700">
            {parentPreset.mission}
          </p>
        </CardContent>
      </Card>

      {/* Quick Stats (full width) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t('quickStats')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              {
                label: t('programs'),
                value: aggregatedMetrics.programs,
                icon: Layers,
                color: 'text-blue-700',
                bg: 'bg-blue-50',
              },
              {
                label: t('resources'),
                value: aggregatedMetrics.resources,
                icon: BookOpen,
                color: 'text-emerald-700',
                bg: 'bg-emerald-50',
              },
              {
                label: t('students'),
                value: aggregatedMetrics.students.toLocaleString(),
                icon: Users,
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
                  <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
                  <p className="text-xs uppercase tracking-wide text-gray-600">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Focus Areas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* SDG Focus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              {t('sdgFocus')}
            </CardTitle>
            <CardDescription>
              {t('sdgFocusDesc')}
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
              <p className="text-gray-500">{t('noSdgFocus')}</p>
            )}
          </CardContent>
        </Card>

        {/* Child Rights Focus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              {tcrc('childRightsFocus')}
            </CardTitle>
            <CardDescription>
              {tcrc('childRightsFocusDesc')}
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
                {tcrc('addFocusAreas')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
