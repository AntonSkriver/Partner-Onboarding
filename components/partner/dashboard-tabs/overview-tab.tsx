'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TabsContent } from '@/components/ui/tabs'
import {
  Mail,
  Phone,
  MapPin,
  Tag,
  Award,
  BarChart3,
  Target,
} from 'lucide-react'
import { SDGIcon } from '../../sdg-icons'
import { SDG_OPTIONS } from '../../../contexts/partner-onboarding-context'
import type { Database } from '@/lib/types/database'
import type { ProgramSummary } from '@/lib/programs/selectors'

type Organization = Database['public']['Tables']['organizations']['Row']

interface OverviewTabProps {
  organization: Organization
  primaryContact: { name: string; email: string; role: string; phone?: string; isPrimary?: boolean } | undefined
  primaryContacts: Array<{ name: string; email: string; role: string; phone?: string; isPrimary?: boolean }>
  sdgFocus: number[]
  programSummaries: ProgramSummary[]
  resources: Array<{ id: string; title: string; description: string; type: string; category: string; ageRange: string; sdgAlignment: number[]; language: string; heroImageUrl: string; updated_at: string }>
  getLatestMetrics: () => { schoolsOnboarded: number; studentsReached: number; teachersActive: number; projectsThisQuarter: number } | null
}

export function OverviewTab({
  organization,
  primaryContact,
  primaryContacts,
  sdgFocus,
  programSummaries,
  resources,
  getLatestMetrics,
}: OverviewTabProps) {
  return (
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

            {(() => {
              const metrics = getLatestMetrics()
              return metrics ? (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <div className="text-xl font-bold text-purple-600">
                    {metrics.schoolsOnboarded || 0}
                  </div>
                  <div className="text-sm text-gray-600">Schools</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-orange-600">
                    {metrics.studentsReached || 0}
                  </div>
                  <div className="text-sm text-gray-600">Students</div>
                </div>
              </div>
              ) : null
            })()}
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
            UNICEF Danmark works to secure all children&apos;s rights through fundraising, education and
            advocacy in Denmark. We collaborate with schools, organizations and communities to create
            awareness about children&apos;s global situation and mobilize resources for UNICEF&apos;s work
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
            {(organization.thematic_tags ?? []).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {(organization.thematic_tags ?? []).map((tag) => (
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
  )
}
