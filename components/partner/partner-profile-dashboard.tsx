'use client'

import { useState, useEffect } from 'react'
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
  School
} from 'lucide-react'
import { OrganizationAPI } from '@/lib/api/organizations'
import { Database } from '@/lib/types/database'

type Organization = Database['public']['Tables']['organizations']['Row']

interface PartnerProfileDashboardProps {
  organization: Organization
  onEdit?: () => void
  isOwnProfile?: boolean
}

export function PartnerProfileDashboard({ 
  organization, 
  onEdit, 
  isOwnProfile = false 
}: PartnerProfileDashboardProps) {
  const [programMemberships, setProgramMemberships] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadOrganizationData()
  }, [organization.id])

  const loadOrganizationData = async () => {
    setLoading(true)
    try {
      const [memberships, analyticsData, resourcesData] = await Promise.all([
        OrganizationAPI.getProgramMemberships(organization.id),
        OrganizationAPI.getAnalytics(organization.id),
        OrganizationAPI.getResources(organization.id)
      ])
      
      setProgramMemberships(memberships)
      setAnalytics(analyticsData)
      setResources(resourcesData)
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

  const getRoleInCollaboration = (collaboration: any) => {
    if (collaboration.lead_organization_id === organization.id) {
      return { role: 'Lead', color: 'bg-blue-100 text-blue-800' }
    }
    if (collaboration.co_host_organizations?.includes(organization.id)) {
      return { role: 'Co-Host', color: 'bg-green-100 text-green-800' }
    }
    if (collaboration.partner_organizations?.includes(organization.id)) {
      return { role: 'Partner', color: 'bg-purple-100 text-purple-800' }
    }
    return { role: 'Unknown', color: 'bg-gray-100 text-gray-800' }
  }

  const getLatestMetrics = () => {
    if (analytics.length === 0) return null
    return analytics[0].metrics
  }

  const primaryContacts = Array.isArray(organization.primary_contacts) 
    ? organization.primary_contacts as any[] 
    : []

  const primaryContact = primaryContacts.find(contact => contact.isPrimary) || primaryContacts[0]

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
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
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
                      {programMemberships.length}
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
                {organization.sdg_tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {organization.sdg_tags.map((sdg) => (
                      <Badge key={sdg} className="bg-blue-100 text-blue-800">
                        SDG {sdg}
                      </Badge>
                    ))}
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
          {programMemberships.length > 0 ? (
            <div className="grid gap-4">
              {programMemberships.map((program) => {
                const { role, color } = getRoleInCollaboration(program)
                return (
                  <Card key={program.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{program.title}</h3>
                            <Badge className={color}>{role}</Badge>
                            <Badge variant="outline">{program.status}</Badge>
                          </div>
                          <p className="text-gray-600 text-sm">{program.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="capitalize">{program.type}</span>
                            {program.start_date && (
                              <span>Started {new Date(program.start_date).getFullYear()}</span>
                            )}
                          </div>
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
                <School className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No Programs Yet</h3>
                <p className="text-gray-500">
                  This organization hasn't joined any programs yet.
                </p>
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
      </Tabs>
    </div>
  )
}