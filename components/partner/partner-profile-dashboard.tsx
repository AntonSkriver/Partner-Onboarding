'use client'

import { Link } from '@/i18n/navigation'
import { useState, useEffect, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building2,
  Globe,
  Edit,
  LogOut,
} from 'lucide-react'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import {
  buildProgramSummariesForPartner,
  aggregateProgramMetrics,
  buildProgramCatalog,
  type ProgramSummary,
} from '@/lib/programs/selectors'
import { Database } from '@/lib/types/database'
import { OverviewTab } from './dashboard-tabs/overview-tab'
import { ProgramsTab } from './dashboard-tabs/programs-tab'
import { ResourcesTab } from './dashboard-tabs/resources-tab'
import { AnalyticsTab } from './dashboard-tabs/analytics-tab'
import { NetworkTab } from './dashboard-tabs/network-tab'

type Organization = Database['public']['Tables']['organizations']['Row']

interface PartnerProfileDashboardProps {
  organization: Organization
  onEdit?: () => void
  isOwnProfile?: boolean
  initialTab?: 'overview' | 'programs' | 'resources' | 'analytics' | 'network'
}

export function PartnerProfileDashboard({
  organization,
  onEdit,
  isOwnProfile = false,
  initialTab = 'overview',
}: PartnerProfileDashboardProps) {
  const [analytics, setAnalytics] = useState<Array<{ id: string; period: string; metrics: { schoolsOnboarded: number; studentsReached: number; teachersActive: number; projectsThisQuarter: number } }>>([])
  const [resources, setResources] = useState<Array<{ id: string; title: string; description: string; type: string; category: string; ageRange: string; sdgAlignment: number[]; language: string; heroImageUrl: string; updated_at: string }>>([])
  const [, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(initialTab)
  const [countryCoordinators, setCountryCoordinators] = useState<Array<{id: string, name: string, country: string, email: string}>>([])
  const [educationalInstitutions, setEducationalInstitutions] = useState<Array<{id: string, name: string, country: string, category: string, pointOfContact: string, email: string}>>([])
  const [showInviteCoordinatorDialog, setShowInviteCoordinatorDialog] = useState(false)
  const [showInviteInstitutionDialog, setShowInviteInstitutionDialog] = useState(false)
  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])
  const { ready: prototypeReady, database } = usePrototypeDb()

  const partnerRecord = useMemo(() => {
    if (!database) return null
    const normalizedName = organization.name?.trim().toLowerCase()
    if (normalizedName) {
      const match = database.partners.find(
        (partner) => partner.organizationName.toLowerCase() === normalizedName,
      )
      if (match) return match
    }
    return database.partners.length > 0 ? database.partners[0] : null
  }, [database, organization.name])

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

  const programCatalog = useMemo(() => {
    if (!database || !partnerRecord) return []

    const allPrograms = buildProgramCatalog(database)

    // Filter to show only programs where this partner is the main host (partnerId)
    // or a supporting partner (supportingPartnerId)
    const filtered = allPrograms.filter((item) => {
      const prog = database.programs.find((p) => p.id === item.programId)
      return prog && (prog.partnerId === partnerRecord.id || prog.supportingPartnerId === partnerRecord.id)
    })

    return filtered
  }, [database, partnerRecord])

  useEffect(() => {
    loadOrganizationData()
  }, [organization.id])

  const loadOrganizationData = async () => {
    setLoading(true)
    try {
      const mockAnalytics = [
        {
          id: 'q1-2025',
          period: '2025-Q1',
          metrics: {
            schoolsOnboarded: 12,
            studentsReached: 1247,
            teachersActive: 48,
            projectsThisQuarter: 3
          }
        }
      ]

      const mockResources = [
        {
          id: 'children-rights-toolkit',
          title: 'Children\'s Rights Education Toolkit',
          description: 'Comprehensive guide for teaching children\'s rights concepts across cultures. Perfect for middle and high school students exploring global citizenship and human rights.',
          type: 'Document',
          category: 'Teaching Guide',
          ageRange: '13-19 years old',
          sdgAlignment: [16],
          language: 'English',
          heroImageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=480&fit=crop',
          updated_at: '2025-01-10T10:00:00Z'
        },
        {
          id: 'cultural-exchange-framework',
          title: 'Cultural Exchange Learning Framework',
          description: 'Structured approach to facilitating cross-cultural learning experiences. Includes activities, discussion prompts, and assessment tools for virtual exchange programs.',
          type: 'Video',
          category: 'Framework',
          ageRange: '9-13 years old',
          sdgAlignment: [4],
          language: 'English',
          heroImageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=480&fit=crop',
          updated_at: '2024-12-15T15:30:00Z'
        },
        {
          id: 'sustainability-action-guide',
          title: 'Climate Action for Young Leaders',
          description: 'Engaging guide to help students understand climate change and take meaningful action in their communities through hands-on projects and global collaboration.',
          type: 'Book',
          category: 'Action Guide',
          ageRange: '13-19 years old',
          sdgAlignment: [13],
          language: 'English',
          heroImageUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=480&fit=crop',
          updated_at: '2025-02-01T09:00:00Z'
        }
      ]

      const mockCoordinators = [
        {
          id: 'coord-1',
          name: 'Maria Garcia',
          country: 'Mexico',
          email: 'maria.garcia@unicef.org'
        },
        {
          id: 'coord-2',
          name: 'Lars Nielsen',
          country: 'Denmark',
          email: 'lars.nielsen@unicef.dk'
        },
        {
          id: 'coord-3',
          name: 'Giovanni Rossi',
          country: 'Italy',
          email: 'giovanni.rossi@unicef.it'
        }
      ]

      const mockInstitutions = [
        {
          id: 'inst-1',
          name: 'Ørestad Gymnasium',
          country: 'Denmark',
          category: 'School',
          pointOfContact: 'Anne Larsen',
          email: 'anne@orestad.dk'
        },
        {
          id: 'inst-2',
          name: 'Copenhagen Public Library',
          country: 'Denmark',
          category: 'Library',
          pointOfContact: 'Michael Jensen',
          email: 'michael@cphlib.dk'
        },
        {
          id: 'inst-3',
          name: 'Guadalajara Cultural Center',
          country: 'Mexico',
          category: 'Municipality Center',
          pointOfContact: 'Carmen Rodriguez',
          email: 'carmen@guadalajara.mx'
        },
        {
          id: 'inst-4',
          name: 'Liceo Scientifico Roma',
          country: 'Italy',
          category: 'School',
          pointOfContact: 'Francesco Bianchi',
          email: 'francesco@liceoroma.it'
        }
      ]

      setAnalytics(mockAnalytics)
      setResources(mockResources)
      setCountryCoordinators(mockCoordinators)
      setEducationalInstitutions(mockInstitutions)
    } catch (error) {
      console.error('Error loading organization data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLatestMetrics = () => {
    if (analytics.length === 0) return null
    return analytics[0].metrics
  }

  const primaryContacts = Array.isArray(organization.primary_contacts)
    ? organization.primary_contacts
    : []

  const primaryContact = primaryContacts.find(contact => contact.isPrimary) || primaryContacts[0]

  const normalizedSdgTags = Array.isArray(organization.sdg_tags)
    ? organization.sdg_tags
        .map((sdg) => (typeof sdg === 'string' ? Number.parseInt(sdg, 10) : sdg))
        .filter((sdg) => Number.isInteger(sdg))
    : []

  const sdgFocus = normalizedSdgTags.length > 0 ? normalizedSdgTags : [4] // Default to SDG 4 (Quality Education)
  const programDataLoading = !prototypeReady || !partnerRecord

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          {organization.logo && (
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={organization.logo}
                alt={`${organization.name} logo`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold">{organization.name}</h1>
              <Badge className="bg-blue-100 text-blue-700">
                <Building2 className="w-4 h-4 mr-1" />
                Partner Profile
              </Badge>
            </div>
            <p className="text-gray-600 max-w-2xl">{organization.short_description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center space-x-1">
                <Building2 className="w-4 h-4" />
                <span className="capitalize">{organization.organization_type.replace('_', ' ')}</span>
              </span>
              {organization.website && (
                <a
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 hover:text-blue-600"
                >
                  <Globe className="w-4 h-4" />
                  <span>Website</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {isOwnProfile && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button variant="outline" asChild>
              <Link href="/login">
                <LogOut className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </Button>
            {onEdit && (
              <Button onClick={onEdit} variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          {isOwnProfile && <TabsTrigger value="network">Network</TabsTrigger>}
          <TabsTrigger value="resources">Resources</TabsTrigger>
          {isOwnProfile && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
        </TabsList>

        {/* Overview Tab */}
        <OverviewTab
          organization={organization}
          primaryContact={primaryContact}
          primaryContacts={primaryContacts}
          sdgFocus={sdgFocus}
          programSummaries={programSummaries}
          resources={resources}
          getLatestMetrics={getLatestMetrics}
        />

        {/* Programs Tab */}
        <ProgramsTab
          isOwnProfile={isOwnProfile}
          programDataLoading={programDataLoading}
          programCatalog={programCatalog}
        />

        {/* Resources Tab */}
        <ResourcesTab
          isOwnProfile={isOwnProfile}
          resources={resources}
        />

        {/* Analytics Tab (for own profile only) */}
        {isOwnProfile && (
          <AnalyticsTab
            programMetrics={programMetrics}
            programSummaries={programSummaries}
          />
        )}

        {/* Network Tab */}
        {isOwnProfile && (
          <NetworkTab
            countryCoordinators={countryCoordinators}
            educationalInstitutions={educationalInstitutions}
            showInviteCoordinatorDialog={showInviteCoordinatorDialog}
            setShowInviteCoordinatorDialog={setShowInviteCoordinatorDialog}
            showInviteInstitutionDialog={showInviteInstitutionDialog}
            setShowInviteInstitutionDialog={setShowInviteInstitutionDialog}
          />
        )}
      </Tabs>
    </div>
  )
}
