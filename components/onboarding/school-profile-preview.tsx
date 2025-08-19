'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { School, MapPin, Users, Globe, Heart, Target } from 'lucide-react'
import { SchoolFormData } from '@/contexts/school-form-context'

interface SchoolProfilePreviewProps {
  formData: SchoolFormData
}

export function SchoolProfilePreview({ formData }: SchoolProfilePreviewProps) {
  const hasBasicInfo = formData.schoolName || formData.schoolType
  const hasLocationInfo = formData.country || formData.city
  const hasDetails = formData.studentCount || formData.teacherCount
  const hasContact = formData.contactName || formData.contactEmail
  const hasInterests = formData.subjectAreas && formData.subjectAreas.length > 0

  return (
    <Card className="w-full bg-gray-50 border-dashed border-2 border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium text-gray-600 flex items-center gap-2">
          <School className="h-5 w-5" />
          School Profile Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* School Name and Type */}
        {hasBasicInfo && (
          <div className="space-y-2">
            {formData.schoolName && (
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{formData.schoolName}</h3>
              </div>
            )}
            {formData.schoolType && (
              <Badge variant="secondary" className="capitalize">
                {formData.schoolType} School
              </Badge>
            )}
          </div>
        )}

        {/* Location */}
        {hasLocationInfo && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>
              {formData.city && formData.country 
                ? `${formData.city}, ${formData.country}`
                : formData.country || formData.city}
            </span>
          </div>
        )}

        {/* School Size */}
        {hasDetails && (
          <div className="space-y-2">
            {formData.studentCount && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{formData.studentCount} students</span>
              </div>
            )}
            {formData.teacherCount && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{formData.teacherCount} teachers</span>
              </div>
            )}
            {formData.gradelevels && formData.gradelevels.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">Grade Levels:</p>
                <div className="flex flex-wrap gap-1">
                  {formData.gradelevels.map((grade, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {grade}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Languages */}
        {formData.languages && formData.languages.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Languages:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.languages.map((language, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {language}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Contact Information */}
        {hasContact && (
          <div className="space-y-1 pt-2 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700">Contact Person:</p>
            {formData.contactName && (
              <p className="text-sm text-gray-600">{formData.contactName}</p>
            )}
            {formData.contactRole && (
              <p className="text-xs text-gray-500 capitalize">{formData.contactRole}</p>
            )}
            {formData.contactEmail && (
              <p className="text-xs text-gray-500">{formData.contactEmail}</p>
            )}
          </div>
        )}

        {/* Subject Areas of Interest */}
        {hasInterests && (
          <div className="space-y-2 pt-2 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Areas of Interest:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.subjectAreas!.map((subject, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {subject}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Collaboration Interests */}
        {formData.collaborationInterests && formData.collaborationInterests.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Collaboration Focus:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.collaborationInterests.map((interest, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!hasBasicInfo && !hasLocationInfo && !hasDetails && !hasContact && !hasInterests && (
          <div className="text-center py-6 text-gray-400">
            <School className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Your school profile will appear here as you fill out the form</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}