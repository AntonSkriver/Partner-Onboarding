'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Tag,
  Award,
  Users,
  BookOpen,
  BarChart3,
  Edit,
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  School,
  GraduationCap,
  ChevronUp,
  ChevronDown,
  Plus,
  Target,
  CalendarDays,
  PenTool,
  LogOut,
  UserPlus,
  Send,
  MoreVertical,
  FileText,
} from 'lucide-react'
import { SDG_DATA } from '@/components/sdg-icons'
import { SDGIcon } from '../sdg-icons'
import { SDG_OPTIONS } from '../../contexts/partner-onboarding-context'
import { OrganizationAPI } from '@/lib/api/organizations'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import {
  buildProgramSummariesForPartner,
  aggregateProgramMetrics,
  buildProgramCatalog,
  type ProgramSummary,
} from '@/lib/programs/selectors'
import { Database } from '@/lib/types/database'
import { startTeacherPreviewSession } from '@/lib/auth/session'
import { ProgramCatalogCard } from '../program/program-catalog-card'

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
  const router = useRouter()
  const [analytics, setAnalytics] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedPrograms, setExpandedPrograms] = useState(new Set())
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

  const toggleProgramDetails = (programId: string) => {
    const newExpanded = new Set(expandedPrograms)
    if (newExpanded.has(programId)) {
      newExpanded.delete(programId)
    } else {
      newExpanded.add(programId)
    }
    setExpandedPrograms(newExpanded)
  }

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

  const getVerificationStatusIcon = (status: Organization['verification_status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getVerificationStatusColor = (status: Organization['verification_status']) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLatestMetrics = () => {
    if (analytics.length === 0) return null
    return analytics[0].metrics
  }

  const primaryContacts = Array.isArray(organization.primary_contacts) 
    ? organization.primary_contacts as any[] 
    : []

  const primaryContact = primaryContacts.find(contact => contact.isPrimary) || primaryContacts[0]

  const normalizedSdgTags = Array.isArray(organization.sdg_tags)
    ? organization.sdg_tags
        .map((sdg) => (typeof sdg === 'string' ? Number.parseInt(sdg, 10) : sdg))
        .filter((sdg) => Number.isInteger(sdg))
    : []

  const sdgFocus = normalizedSdgTags.length > 0 ? normalizedSdgTags : [4] // Default to SDG 4 (Quality Education)
  const programDataLoading = !prototypeReady || !partnerRecord

  const formatDate = (value?: string | null) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleTeacherPreview = () => {
    startTeacherPreviewSession()
    router.push('/teacher/dashboard')
  }

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
              <Link href="/partner/login">
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
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {primaryContact && (
                  <div className="space-y-2">
                    <div className="font-medium">{primaryContact.name}</div>
                    <div className="text-sm text-gray-600">{primaryContact.role}</div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="w-3 h-3" />
                      <span>{primaryContact.email}</span>
                    </div>
                    {primaryContact.phone && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="w-3 h-3" />
                        <span>{primaryContact.phone}</span>
                      </div>
                    )}
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
                  <MapPin className="w-4 h-4" />
                  Geographic Scope
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Countries</div>
                  <div className="flex flex-wrap gap-1">
                    {organization.countries_of_operation.map((country) => (
                      <Badge key={country} variant="secondary" className="text-xs">
                        {country}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Languages</div>
                  <div className="flex flex-wrap gap-1">
                    {organization.languages.map((language) => (
                      <Badge key={language} variant="outline" className="text-xs">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {programSummaries.length}
                    </div>
                    <div className="text-sm text-gray-600">Active Programs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {resources.length}
                    </div>
                    <div className="text-sm text-gray-600">Resources</div>
                  </div>
                </div>
                
                {getLatestMetrics() && (
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <div className="text-xl font-bold text-purple-600">
                        {getLatestMetrics().schoolsOnboarded || 0}
                      </div>
                      <div className="text-sm text-gray-600">Schools</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-orange-600">
                        {getLatestMetrics().studentsReached || 0}
                      </div>
                      <div className="text-sm text-gray-600">Students</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Mission Statement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                UNICEF Danmark works to secure all children's rights through fundraising, education and
                advocacy in Denmark. We collaborate with schools, organizations and communities to create
                awareness about children's global situation and mobilize resources for UNICEF's work
                worldwide.
              </p>
            </CardContent>
          </Card>

          {/* Focus Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SDG Focus */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  UN SDG Focus
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sdgFocus.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {sdgFocus.map((sdgId) => {
                      const sdg = SDG_OPTIONS.find(s => s.id === sdgId)
                      return sdg ? (
                        <div key={sdgId} className="flex flex-col items-center">
                          <SDGIcon
                            number={sdgId}
                            size="md"
                            showTitle={false}
                            className="w-16 h-16 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                          />
                          <p className="text-xs text-gray-600 text-center mt-1 leading-tight">
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
                  <Tag className="w-4 h-4" />
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
        </TabsContent>

        {/* Programs Tab */}
        <TabsContent value="programs" className="space-y-6">
          {/* Create Program Button - shown when there are programs */}
          {isOwnProfile && programCatalog.length > 0 && (
            <div className="flex justify-end">
              <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                <Link href="/partner/programs/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Program
                </Link>
              </Button>
            </div>
          )}

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
                      {isOwnProfile && (
                        <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                          <Link href={`/partner/programs/${item.programId}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Program
                          </Link>
                        </Button>
                      )}
                    </>
                  }
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-10 text-center space-y-4">
                <Users className="w-12 h-12 text-gray-400 mx-auto" />
                <h3 className="text-lg font-medium text-gray-900">No Programs Yet</h3>
                <p className="text-gray-500">
                  Create your first program to start collaborating with schools worldwide.
                </p>
                <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                  <Link href="/partner/programs/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Program
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          {/* Add Resources Button - shown when there are resources */}
          {isOwnProfile && resources.length > 0 && (
            <div className="flex justify-end">
              <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                <Link href="/partner/content/upload">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Resources
                </Link>
              </Button>
            </div>
          )}

          {resources.length > 0 ? (
            <div className="space-y-4">
              {resources.map((resource) => {
                // Get SDG data
                const sdgTitles = resource.sdgAlignment?.map((num: number) => {
                  const sdgData = SDG_DATA[num]
                  return sdgData ? `SDG #${num}: ${sdgData.title}` : `SDG ${num}`
                }) || []

                return (
                  <Card key={resource.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row gap-0">
                        {/* Thumbnail */}
                        <div className="sm:w-48 sm:h-48 h-40 flex-shrink-0 bg-gray-100 relative overflow-hidden">
                          {resource.heroImageUrl ? (
                            <img
                              src={resource.heroImageUrl}
                              alt={resource.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-50">
                              <FileText className="w-12 h-12 text-purple-300" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <h3 className="text-xl font-semibold text-gray-900 leading-tight">
                              {resource.title}
                            </h3>
                            <Button variant="ghost" size="sm" className="flex-shrink-0">
                              <MoreVertical className="h-4 w-4 text-gray-400" />
                            </Button>
                          </div>

                          {/* Metadata badges */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge className="bg-purple-600 hover:bg-purple-700 text-white">
                              {resource.type}
                            </Badge>

                            {resource.category && (
                              <Badge variant="outline" className="capitalize">
                                {resource.category}
                              </Badge>
                            )}

                            {resource.ageRange && (
                              <Badge variant="outline">
                                {resource.ageRange}
                              </Badge>
                            )}

                            {sdgTitles.length > 0 && (
                              <Badge variant="outline" className="text-orange-700 border-orange-300">
                                {sdgTitles[0]}
                              </Badge>
                            )}

                            <Badge className="bg-purple-600 hover:bg-purple-700 text-white">
                              {resource.language}
                            </Badge>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {resource.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No Resources Yet</h3>
                <p className="text-gray-500">
                  This organization hasn't shared any resources yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab (for own profile only) */}
        {isOwnProfile && (
          <TabsContent value="analytics" className="space-y-6">
            {/* Key Metrics Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {/* Active Projects */}
              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{programMetrics.activeProjects}</div>
                  <div className="text-xs text-gray-600 mt-1">Active Projects</div>
                </CardContent>
              </Card>

              {/* Finished Projects */}
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{programMetrics.completedProjects}</div>
                  <div className="text-xs text-gray-600 mt-1">Finished Projects</div>
                </CardContent>
              </Card>

              {/* Teachers */}
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{programMetrics.teachers}</div>
                  <div className="text-xs text-gray-600 mt-1">Teachers</div>
                </CardContent>
              </Card>

              {/* Students */}
              <Card>
                <CardContent className="p-4 text-center">
                  <GraduationCap className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{programMetrics.students.toLocaleString()}</div>
                  <div className="text-xs text-gray-600 mt-1">Students</div>
                </CardContent>
              </Card>

              {/* Institutions */}
              <Card>
                <CardContent className="p-4 text-center">
                  <School className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{programMetrics.institutions}</div>
                  <div className="text-xs text-gray-600 mt-1">Institutions</div>
                </CardContent>
              </Card>

              {/* Programs */}
              <Card>
                <CardContent className="p-4 text-center">
                  <BookOpen className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{programSummaries.length}</div>
                  <div className="text-xs text-gray-600 mt-1">Programs</div>
                </CardContent>
              </Card>

              {/* Country Reach */}
              <Card>
                <CardContent className="p-4 text-center">
                  <Globe className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{programMetrics.countryCount}</div>
                  <div className="text-xs text-gray-600 mt-1">Countries</div>
                </CardContent>
              </Card>
            </div>

            {/* Program Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Program Performance
                </CardTitle>
                <CardDescription>
                  Top performing programs by student engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {programSummaries.slice(0, 3).map(({ program, metrics }, index) => (
                    <div key={program.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">
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
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Network Tab */}
        {isOwnProfile && (
          <TabsContent value="network" className="space-y-6">
            {/* Country Coordinators Section */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Country Coordinators
                    </CardTitle>
                    <CardDescription>
                      Manage your organization's country coordinators
                    </CardDescription>
                  </div>
                  <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowInviteCoordinatorDialog(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Coordinator
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {countryCoordinators.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Country</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {countryCoordinators.map((coordinator) => (
                          <tr key={coordinator.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{coordinator.name}</td>
                            <td className="py-3 px-4">
                              <Badge variant="secondary">{coordinator.country}</Badge>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">{coordinator.email}</td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Mail className="w-3 h-3 mr-1" />
                                  Contact
                                </Button>
                                <Button size="sm" variant="outline">
                                  Edit
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">No Country Coordinators</h3>
                    <p className="text-gray-500 mb-4">
                      Invite country coordinators to help manage your organization's regional presence.
                    </p>
                    <Button onClick={() => setShowInviteCoordinatorDialog(true)}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite First Coordinator
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Educational Institutions Section */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <School className="w-4 h-4" />
                      Educational Institutions
                    </CardTitle>
                    <CardDescription>
                      Schools, libraries, municipality centers and other educational partners
                    </CardDescription>
                  </div>
                  <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowInviteInstitutionDialog(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Institution
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {educationalInstitutions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Country</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Point of Contact</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {educationalInstitutions.map((institution) => (
                          <tr key={institution.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{institution.name}</td>
                            <td className="py-3 px-4">
                              <Badge variant="secondary">{institution.country}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="outline">{institution.category}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm">
                                <div className="font-medium">{institution.pointOfContact}</div>
                                <div className="text-gray-600">{institution.email}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Mail className="w-3 h-3 mr-1" />
                                  Contact
                                </Button>
                                <Button size="sm" variant="outline">
                                  View
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <School className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">No Educational Institutions</h3>
                    <p className="text-gray-500 mb-4">
                      Connect with schools, libraries, and other educational institutions.
                    </p>
                    <Button onClick={() => setShowInviteInstitutionDialog(true)}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite First Institution
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invitation Dialogs Placeholder */}
            {showInviteCoordinatorDialog && (
              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Invite Country Coordinator</h3>
                      <p className="text-sm text-gray-600 mt-1">Send an invitation to a country coordinator</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowInviteCoordinatorDialog(false)}>
                      ✕
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Coordinator name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="coordinator@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Country"
                      />
                    </div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      <Send className="w-4 h-4 mr-2" />
                      Send Invitation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {showInviteInstitutionDialog && (
              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Invite Educational Institution</h3>
                      <p className="text-sm text-gray-600 mt-1">Send an invitation to an educational institution</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowInviteInstitutionDialog(false)}>
                      ✕
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="School or institution name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option>School</option>
                        <option>Library</option>
                        <option>Municipality Center</option>
                        <option>Cultural Center</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Country"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Point of Contact</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Contact person name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="contact@institution.edu"
                      />
                    </div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      <Send className="w-4 h-4 mr-2" />
                      Send Invitation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
