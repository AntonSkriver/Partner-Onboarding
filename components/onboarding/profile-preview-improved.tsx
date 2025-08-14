'use client'

import { usePartnerForm, type PartnerFormData } from '@/contexts/partner-form-context'
import { Building2, Globe, Target, Users, Mail, Phone } from 'lucide-react'

interface ProfilePreviewProps {
  formData?: PartnerFormData
}

export function ProfilePreview({ formData: propFormData }: ProfilePreviewProps) {
  const { formData: contextFormData } = usePartnerForm()
  const formData = propFormData || contextFormData

  // Helper function to get organization type label
  const getOrganizationTypeLabel = (type: string | null) => {
    if (!type) return "Not specified"
    const labels: Record<string, string> = {
      ngo: "Non-Governmental Organization (NGO)",
      government: "Government Agency/Ministry",
      school_network: "School Network/District",
      commercial: "Commercial/Corporate Partner",
      other: "Other Organization"
    }
    return labels[type] || type
  }

  // Helper function to get organization type icon
  const getOrganizationTypeIcon = (type: string | null) => {
    switch (type) {
      case 'ngo':
        return <Building2 className="w-4 h-4" />
      case 'government':
        return <Globe className="w-4 h-4" />
      case 'school_network':
        return <Users className="w-4 h-4" />
      case 'commercial':
        return <Building2 className="w-4 h-4" />
      default:
        return <Building2 className="w-4 h-4" />
    }
  }

  // Helper function to get SDG labels
  const getSdgLabels = (sdgs: number[]) => {
    const sdgMap: Record<number, string> = {
      1: 'No Poverty',
      2: 'Zero Hunger',
      3: 'Good Health and Well-being',
      4: 'Quality Education',
      5: 'Gender Equality',
      6: 'Clean Water and Sanitation',
      7: 'Affordable and Clean Energy',
      8: 'Decent Work and Economic Growth',
      9: 'Industry, Innovation and Infrastructure',
      10: 'Reduced Inequalities',
      11: 'Sustainable Cities and Communities',
      12: 'Responsible Consumption and Production',
      13: 'Climate Action',
      14: 'Life Below Water',
      15: 'Life on Land',
      16: 'Peace, Justice and Strong Institutions',
      17: 'Partnerships for the Goals'
    }
    return sdgs.map(sdg => sdgMap[sdg] || `SDG ${sdg}`).join(", ")
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          <Building2 className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Organization Profile</h3>
          <p className="text-sm text-gray-500">Preview of your information</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Organization Type */}
        {formData.organizationType && (
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              {getOrganizationTypeIcon(formData.organizationType)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Organization Type</p>
              <p className="text-sm text-gray-600">{getOrganizationTypeLabel(formData.organizationType)}</p>
            </div>
          </div>
        )}

        {/* Organization Name */}
        {formData.organizationName && (
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Building2 className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Organization Name</p>
              <p className="text-sm text-gray-600">{formData.organizationName}</p>
            </div>
          </div>
        )}

        {/* Website */}
        {formData.organizationWebsite && (
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Globe className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Website</p>
              <p className="text-sm text-gray-600">{formData.organizationWebsite}</p>
            </div>
          </div>
        )}

        {/* Mission Statement */}
        {formData.missionStatement && (
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Target className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Mission Statement</p>
              <p className="text-sm text-gray-600 line-clamp-3">{formData.missionStatement}</p>
            </div>
          </div>
        )}

        {/* SDG Focus Areas */}
        {formData.sdgFocus && formData.sdgFocus.length > 0 && (
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Target className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">SDG Focus Areas</p>
              <p className="text-sm text-gray-600">{getSdgLabels(formData.sdgFocus)}</p>
            </div>
          </div>
        )}

        {/* Contact Information */}
        {(formData.contactName || formData.contactEmail || formData.contactPhone) && (
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h4>
            <div className="space-y-2">
              {formData.contactName && (
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{formData.contactName}</span>
                </div>
              )}
              {formData.contactEmail && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{formData.contactEmail}</span>
                </div>
              )}
              {formData.contactPhone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{formData.contactPhone}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Completion Status */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Profile Completion</span>
          <span className="text-sm font-medium text-gray-900">
            {Object.values(formData).filter(Boolean).length}/{Object.keys(formData).length} fields
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(Object.values(formData).filter(Boolean).length / Object.keys(formData).length) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  )
} 