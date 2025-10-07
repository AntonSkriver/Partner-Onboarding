'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
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
  ChevronUp,
  ChevronDown,
  Plus,
  Target
} from 'lucide-react'
import { SDGIcon } from '../sdg-icons'
import { SDG_OPTIONS } from '../../contexts/partner-onboarding-context'
import { OrganizationAPI } from '@/lib/api/organizations'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import {
  buildProgramSummariesForPartner,
  aggregateProgramMetrics,
  type ProgramSummary,
} from '@/lib/programs/selectors'
import { Database } from '@/lib/types/database'

type Organization = Database['public']['Tables']['organizations']['Row']

interface PartnerProfileDashboardProps {
  organization: Organization
  onEdit?: () => void
  isOwnProfile?: boolean
  initialTab?: 'overview' | 'programs' | 'resources' | 'analytics' | 'dashboard'
}

export function PartnerProfileDashboard({
  organization,
  onEdit,
  isOwnProfile = false,
  initialTab = 'overview',
}: PartnerProfileDashboardProps) {
  const [analytics, setAnalytics] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedPrograms, setExpandedPrograms] = useState(new Set())
  const [activeTab, setActiveTab] = useState(initialTab)
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
          description: 'Comprehensive guide for teaching children\'s rights concepts across cultures',
          type: 'teaching_guide',
          language: 'English',
          updated_at: '2025-01-10T10:00:00Z'
        },
        {
          id: 'cultural-exchange-framework',
          title: 'Cultural Exchange Learning Framework',
          description: 'Structured approach to facilitating cross-cultural learning experiences',
          type: 'framework',
          language: 'Multiple',
          updated_at: '2024-12-15T15:30:00Z'
        }
      ]

      setAnalytics(mockAnalytics)
      setResources(mockResources)
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
              <Badge className={getVerificationStatusColor(organization.verification_status)}>
                {getVerificationStatusIcon(organization.verification_status)}
                <span className="ml-1 capitalize">{organization.verification_status}</span>
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
        
        {isOwnProfile && onEdit && (
          <Button onClick={onEdit} variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          {isOwnProfile && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
          {isOwnProfile && <TabsTrigger value="dashboard">Dashboard</TabsTrigger>}
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
        <TabsContent value="programs" className="space-y-4">
          {programDataLoading ? (
            <Card>
              <CardContent className="p-10 text-center text-sm text-gray-500">
                Loading program insights…
              </CardContent>
            </Card>
          ) : programSummaries.length > 0 ? (
            <div className="grid gap-4">
              {programSummaries.map(({ program, institutions, metrics }) => {
                const isExpanded = expandedPrograms.has(program.id)
                const visibleInstitutions = isExpanded ? institutions : institutions.slice(0, 2)

                return (
                  <Card key={program.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="space-y-6 p-6">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg text-gray-900">{program.name}</h3>
                            <Badge variant="outline" className="capitalize">
                              {program.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{program.description}</p>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                            {program.projectTypes.map((type) => (
                              <Badge key={type} variant="secondary" className="bg-purple-50 text-purple-700">
                                {type.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 text-left md:text-right">
                          <div className="font-medium text-gray-700">
                            {formatDate(program.startDate)} – {formatDate(program.endDate)}
                          </div>
                          <div>
                            {metrics.countries.length} countr{metrics.countries.length === 1 ? 'y' : 'ies'} •{' '}
                            {metrics.teacherCount} teacher{metrics.teacherCount === 1 ? '' : 's'}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-center">
                          <div className="text-xs font-medium text-gray-500 uppercase">Co-Partners</div>
                          <div className="mt-1 text-lg font-semibold text-gray-900">
                            {metrics.coPartnerCount}
                          </div>
                        </div>
                        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-center">
                          <div className="text-xs font-medium text-gray-500 uppercase">Coordinators</div>
                          <div className="mt-1 text-lg font-semibold text-gray-900">
                            {metrics.coordinatorCount}
                          </div>
                        </div>
                        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-center">
                          <div className="text-xs font-medium text-gray-500 uppercase">Institutions</div>
                          <div className="mt-1 text-lg font-semibold text-gray-900">
                            {metrics.institutionCount}
                          </div>
                        </div>
                        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-center">
                          <div className="text-xs font-medium text-gray-500 uppercase">Students (est.)</div>
                          <div className="mt-1 text-lg font-semibold text-gray-900">
                            {metrics.studentCount.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/partner/programs/${program.id}`}>Open overview</Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/partner/programs/${program.id}/edit`}>Edit program</Link>
                        </Button>
                      </div>

                      {institutions.length > 0 && (
                        <div className="border-t pt-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleProgramDetails(program.id)}
                            className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700 hover:text-purple-600"
                          >
                            <School className="h-4 w-4" />
                            Participating institutions ({institutions.length})
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {visibleInstitutions.map((institution) => (
                              <div key={institution.id} className="border rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-900">{institution.name}</h4>
                                    <p className="text-xs text-gray-500">
                                      {institution.city ? `${institution.city}, ` : ''}
                                      {institution.country}
                                    </p>
                                  </div>
                                  <Badge variant="outline" className="capitalize">
                                    {institution.status}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <p className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {institution.teacherCount ?? 0} teachers • {institution.studentCount ?? 0} students
                                  </p>
                                  {institution.contactEmail && (
                                    <p className="flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      <a
                                        href={`mailto:${institution.contactEmail}`}
                                        className="text-purple-600 hover:text-purple-700"
                                      >
                                        {institution.contactEmail}
                                      </a>
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {institutions.length > 2 && !isExpanded && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleProgramDetails(program.id)}
                              className="mt-3 w-full text-sm text-purple-600 hover:text-purple-700"
                            >
                              View all institutions
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-10 text-center space-y-4">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-gray-900">No Programs Yet</h3>
                <p className="text-gray-500">
                  Create your first program to start collaborating with partner schools.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href="/partner/programs/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Program
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          {resources.length > 0 ? (
            <div className="grid gap-4">
              {resources.map((resource) => (
                <Card key={resource.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <h3 className="font-semibold">{resource.title}</h3>
                          <Badge variant="outline">{resource.type}</Badge>
                        </div>
                        {resource.description && (
                          <p className="text-gray-600 text-sm">{resource.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{resource.language}</span>
                          <span>Updated {new Date(resource.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
            {analytics.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Analytics cards would go here */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Quarterly Impact
                    </CardTitle>
                    <CardDescription>
                      Your organization's impact metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getLatestMetrics() && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-2xl font-bold">{getLatestMetrics().schoolsOnboarded}</div>
                            <div className="text-sm text-gray-600">Schools Onboarded</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold">{getLatestMetrics().studentsReached}</div>
                            <div className="text-sm text-gray-600">Students Reached</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold">{getLatestMetrics().teachersActive}</div>
                            <div className="text-sm text-gray-600">Active Teachers</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold">{getLatestMetrics().projectsThisQuarter}</div>
                            <div className="text-sm text-gray-600">Projects This Quarter</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Additional analytics cards */}
                <Card>
                  <CardHeader>
                    <CardTitle>Export Data</CardTitle>
                    <CardDescription>
                      Download your organization's data for reporting
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full">
                      Export Quarterly Report
                    </Button>
                    <Button variant="outline" className="w-full">
                      Export School Data (CSV)
                    </Button>
                    <Button variant="outline" className="w-full">
                      Export Program Metrics
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">No Analytics Data</h3>
                  <p className="text-gray-500">
                    Analytics data will appear here once your organization starts participating in programs.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        {/* Dashboard Tab */}
        {isOwnProfile && (
          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/partner/programs/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Program
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/partner/schools/invite">
                      <School className="w-4 h-4 mr-2" />
                      Invite Schools
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/partner/content/upload">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Upload Resources
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <div className="font-medium">New school joined</div>
                      <div className="text-gray-600">Ørestad Gymnasium - 2 hours ago</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">Program updated</div>
                      <div className="text-gray-600">Children's Rights Across Cultures - 1 day ago</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">Resource uploaded</div>
                      <div className="text-gray-600">Human Rights Toolkit - 3 days ago</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Organization Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Organization Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {programSummaries.length}
                        </div>
                        <div className="text-sm text-gray-600">Active Programs</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {programMetrics.countryCount}
                        </div>
                        <div className="text-sm text-gray-600">Countries</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      <div>
                        <div className="text-xl font-bold text-purple-600">
                          {programMetrics.institutions}
                        </div>
                        <div className="text-sm text-gray-600">Institutions</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-orange-600">
                          {programMetrics.students.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Students</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Program Management */}
            <Card>
              <CardHeader>
                <CardTitle>Program Management</CardTitle>
                <CardDescription>
                  Manage your active programs and monitor engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                {programDataLoading ? (
                  <div className="flex items-center justify-center py-8 text-sm text-gray-500">
                    Loading program data…
                  </div>
                ) : programSummaries.length > 0 ? (
                  <div className="space-y-4">
                    {programSummaries.map(({ program, metrics }) => (
                      <div
                        key={program.id}
                        className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="font-medium text-gray-900">{program.name}</div>
                          <div className="text-sm text-gray-600">
                            {program.status} • {metrics.institutionCount} institution{metrics.institutionCount === 1 ? '' : 's'} • {metrics.teacherCount} teacher{metrics.teacherCount === 1 ? '' : 's'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Timeline: {formatDate(program.startDate)} – {formatDate(program.endDate)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/partner/programs/${program.id}`}>
                              View Details
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/partner/programs/${program.id}/edit`}>
                              Manage
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-end">
                      <Button variant="link" className="text-purple-600 hover:text-purple-700" asChild>
                        <Link href="/partner/programs">Open Programs workspace →</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">No Active Programs</h3>
                    <p className="text-gray-500 mb-4">
                      Create your first program to start connecting with schools worldwide.
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                      <Link href="/partner/programs/create">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Program
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
