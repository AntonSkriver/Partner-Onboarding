'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useState, useEffect, useMemo } from 'react'
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
  const t = useTranslations('profile.overview')
  const tc = useTranslations('common')
  const tCrc = useTranslations('crc')
  const tDashboard = useTranslations('dashboard')
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

  const schoolCount = useMemo(() => {
    const uniqueNames = new Set<string>()

    programSummaries.forEach((summary) => {
      summary.institutions.forEach((institution) => {
        const name = institution.name?.trim()
        if (name) {
          uniqueNames.add(name.toLowerCase())
        }
      })
    })

    return uniqueNames.size
  }, [programSummaries])

  useEffect(() => {
    loadOrganizationProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prototypeReady, database])

  const loadOrganizationProfile = async () => {
    setLoading(true)
    try {
      const session = getCurrentSession()
      const fallbackOrganization =
        database?.partners.find((partner) =>
          partner.organizationName.toLowerCase().includes('save the children italy'),
        )?.organizationName ??
        database?.partners[0]?.organizationName ??
        'Partner Organization'
      const orgName = session?.organization ?? fallbackOrganization

      // Build dynamic org data from prototype database when available
      const partnerUsers = database?.partnerUsers ?? []
      const matchedPartner = database?.partners.find(
        (p) => p.organizationName.toLowerCase() === orgName.trim().toLowerCase(),
      )

      // Build contacts from partner users linked to this partner
      const contacts = matchedPartner
        ? partnerUsers
            .filter((u) => u.partnerId === matchedPartner.id && u.isActive)
            .map((u, i) => ({
              name: `${u.firstName} ${u.lastName}`,
              email: u.email,
              role: u.role === 'admin' ? 'Director' : 'Coordinator',
              isPrimary: i === 0,
            }))
        : []

      // If no partner users, use partner contact as fallback
      if (contacts.length === 0 && matchedPartner) {
        contacts.push({
          name: orgName,
          email: matchedPartner.contactEmail,
          role: 'Primary Contact',
          isPrimary: true,
        })
      }

      // Build countries from programs
      const programs = database?.programs ?? []
      const programPartners = database?.programPartners ?? []
      const linkedProgramIds = matchedPartner
        ? new Set([
            ...programs.filter((p) => p.partnerId === matchedPartner.id).map((p) => p.id),
            ...programPartners.filter((pp) => pp.partnerId === matchedPartner.id).map((pp) => pp.programId),
          ])
        : new Set<string>()
      const linkedPrograms = programs.filter((p) => linkedProgramIds.has(p.id))
      const countriesSet = new Set<string>()
      linkedPrograms.forEach((p) => p.countriesInScope?.forEach((c: string) => countriesSet.add(c)))

      // Build SDG tags from partner record
      const sdgTags = matchedPartner?.sdgFocus
        ? matchedPartner.sdgFocus.map((s) => s.replace('SDG ', ''))
        : ['4']

      // Build thematic tags from program pedagogical frameworks
      const thematicSet = new Set<string>()
      linkedPrograms.forEach((p) => {
        p.pedagogicalFramework?.forEach((f: string) => {
          const labels: Record<string, string> = {
            pbl: 'Project-Based Learning',
            design_thinking: 'Design Thinking',
            global_citizenship: 'Global Citizenship',
            steam: 'STEAM Education',
          }
          thematicSet.add(labels[f] ?? f)
        })
        p.projectTypes?.forEach((t: string) => {
          const labels: Record<string, string> = {
            cultural_exchange: 'Cultural Exchange',
            explore_global_challenges: 'Global Challenges',
            create_solutions: 'Solution Design',
          }
          if (labels[t]) thematicSet.add(labels[t])
        })
      })

      // Build CRC focus from programs
      const crcSet = new Set<string>()
      linkedPrograms.forEach((p) => {
        p.crcFocus?.forEach((c: string) => crcSet.add(c))
      })

      const sampleOrg: Organization = {
        id: matchedPartner?.id ?? 'demo-org-id',
        name: orgName,
        organization_type: matchedPartner?.organizationType ?? 'ngo',
        website: matchedPartner?.website ?? null,
        logo: matchedPartner?.logo ?? null,
        short_description: matchedPartner?.description ?? 'Partner organization on Class2Class.',
        primary_contacts: contacts,
        regions_of_operation: [],
        countries_of_operation: Array.from(countriesSet),
        languages: matchedPartner?.languages ?? ['en'],
        sdg_tags: sdgTags,
        thematic_tags: Array.from(thematicSet),
        verification_status: matchedPartner?.verificationStatus ?? 'verified',
        brand_settings: null,
        created_at: matchedPartner?.createdAt ?? '2024-01-15T10:00:00Z',
        updated_at: matchedPartner?.updatedAt ?? '2024-03-10T15:30:00Z',
        is_active: matchedPartner?.isActive ?? true,
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
      setChildRightsFocus(Array.from(crcSet))
    } catch (err) {
      console.error('Error loading organization profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const primaryContacts = parseContacts(organization?.primary_contacts ?? null)
  const primaryContact = primaryContacts.find((contact) => contact.isPrimary) || primaryContacts[0]

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
          <h2 className="mb-2 text-lg font-semibold text-gray-900">{tDashboard('noOrgProfile')}</h2>
          <p className="text-gray-600">{tDashboard('pleaseCreateProfile')}</p>
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
              <Link href="/partner/profile/edit">
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
            {organization.thematic_tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {organization.thematic_tags.map((tag) => (
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

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t('quickStats')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold text-purple-600">{programSummaries.length}</div>
                <div className="text-sm text-gray-600">{t('programs')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{schoolCount}</div>
                <div className="text-sm text-gray-600">{t('schools')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{resources.length}</div>
                <div className="text-sm text-gray-600">{t('resources')}</div>
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
            {t('ourMission')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-gray-700">
            {partnerRecord?.mission ?? organization?.short_description ?? t('noMission')}
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
              {tCrc('childRightsFocus')}
            </CardTitle>
            <CardDescription>
              {tCrc('childRightsFocusDesc')}
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
                {tCrc('addFocusAreas')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
