'use client'

import {
  Card,
  CardContent,
  CardTitle,
  CardHeader,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TabsContent } from '@/components/ui/tabs'
import {
  BarChart3,
  Mail,
  Phone,
  School,
  Tag,
  Target,
} from 'lucide-react'
import { SDGIcon } from '@/components/sdg-icons'
import { SDG_OPTIONS } from '@/contexts/partner-onboarding-context'
import type { PartnerProgramMetrics } from '@/lib/programs/selectors'

interface SchoolProfile {
  id: string
  name: string
  type: string
  location: string
  city: string
  country: string
  studentCount: number
  teacherCount: number
  languages: string[]
  contactName: string
  contactEmail: string
  contactPhone?: string
  interests: string[]
  sdgFocus: string[]
  description?: string
}

interface OverviewTabProps {
  school: SchoolProfile
  programMetrics: PartnerProgramMetrics
}

export function OverviewTab({ school, programMetrics }: OverviewTabProps) {
  return (
    <TabsContent value="overview" className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-gray-900">{school.contactName}</p>
              <p className="text-gray-500">Primary contact</p>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-3 h-3" />
              <span>{school.contactEmail}</span>
            </div>
            {school.contactPhone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-3 h-3" />
                <span>{school.contactPhone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="w-4 h-4" />
              School Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase text-gray-500">Type</p>
              <p className="font-semibold text-gray-900">{school.type}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">Students</p>
              <p className="font-semibold text-gray-900">{school.studentCount}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">Teachers</p>
              <p className="font-semibold text-gray-900">{school.teacherCount}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">Languages</p>
              <div className="flex flex-wrap gap-1">
                {school.languages.map((language) => (
                  <Badge key={language} variant="secondary" className="text-xs">
                    {language}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

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
                  {programMetrics.totalPrograms}
                </div>
                <div className="text-sm text-gray-600">Active Programs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {programMetrics.activeProjects}
                </div>
                <div className="text-sm text-gray-600">Active Projects</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <div className="text-xl font-bold text-purple-600">
                  {programMetrics.teachers}
                </div>
                <div className="text-sm text-gray-600">Teachers</div>
              </div>
              <div>
                <div className="text-xl font-bold text-orange-600">
                  {programMetrics.students.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Students</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* SDG Focus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              UN SDG Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            {school.sdgFocus.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {school.sdgFocus.map((sdgString) => {
                  const sdgId = typeof sdgString === 'string' ? Number.parseInt(sdgString, 10) : sdgString
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

        {/* Thematic Areas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Thematic Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {school.interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {school.interests.map((interest) => (
                  <Badge key={interest} variant="outline">
                    {interest}
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
