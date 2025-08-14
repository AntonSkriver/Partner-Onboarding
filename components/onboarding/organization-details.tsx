'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePartnerForm } from '@/contexts/partner-form-context'
import { Building2 } from 'lucide-react'
import { useState } from 'react'

interface OrganizationDetailsProps {
  onNext: () => void
  onPrevious: () => void
}

export function OrganizationDetails({ onNext, onPrevious }: OrganizationDetailsProps) {
  const { formData, updateFormData } = usePartnerForm()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateAndProceed = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.organizationName?.trim()) {
      newErrors.organizationName = 'Organization name is required'
    } else if (formData.organizationName.trim().length < 2) {
      newErrors.organizationName = 'Organization name must be at least 2 characters'
    }

    if (formData.organizationWebsite && formData.organizationWebsite.trim()) {
      const urlPattern = /^https?:\/\/.+\..+/
      if (!urlPattern.test(formData.organizationWebsite)) {
        newErrors.organizationWebsite = 'Please enter a valid website URL'
      }
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      onNext()
    }
  }

  const handleInputChange = (field: string, value: string) => {
    updateFormData({ [field]: value })
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const getOrganizationTypeLabel = () => {
    const typeLabels = {
      ngo: 'NGO',
      government: 'Government Agency',
      school_network: 'School Network',
      commercial: 'Corporate Partner',
      other: 'Organization'
    }
    return typeLabels[formData.organizationType || 'other']
  }

  return (
    <div className="space-y-6 pt-16 sm:pt-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about your {getOrganizationTypeLabel().toLowerCase()}</h2>
        <p className="text-gray-600">
          Help us understand your organization so we can connect you with the right schools and opportunities.
        </p>
      </div>

      <div className="space-y-6">
        {/* Organization Name */}
        <div className="space-y-2">
          <Label htmlFor="organizationName" className="text-base font-medium text-gray-900">
            Organization Name *
          </Label>
          <Input
            id="organizationName"
            placeholder={`e.g., UNICEF, Ministry of Education, ABC School District`}
            value={formData.organizationName || ''}
            onChange={(e) => handleInputChange('organizationName', e.target.value)}
            className={`text-base h-12 ${errors.organizationName ? 'border-red-500' : ''}`}
          />
          {errors.organizationName && (
            <p className="text-sm text-red-600">{errors.organizationName}</p>
          )}
          <p className="text-sm text-gray-500">
            Enter the full official name of your organization
          </p>
        </div>

        {/* Website */}
        <div className="space-y-2">
          <Label htmlFor="organizationWebsite" className="text-base font-medium text-gray-900">
            Organization Website
          </Label>
          <Input
            id="organizationWebsite"
            placeholder="https://www.yourorganization.org"
            value={formData.organizationWebsite || ''}
            onChange={(e) => handleInputChange('organizationWebsite', e.target.value)}
            className={`text-base h-12 ${errors.organizationWebsite ? 'border-red-500' : ''}`}
          />
          {errors.organizationWebsite && (
            <p className="text-sm text-red-600">{errors.organizationWebsite}</p>
          )}
          <p className="text-sm text-gray-500">
            Schools and partners can learn more about your work through your website
          </p>
        </div>
      </div>

      {/* Information box */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-green-600 text-lg">🌟</span>
          <div>
            <h4 className="font-medium text-green-900 mb-1">Building Trust</h4>
            <p className="text-sm text-green-800">
              Providing accurate organization details helps schools trust your initiatives and 
              makes it easier for them to get approval from administrators and parents.
            </p>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button variant="outline" onClick={onPrevious} className="flex-1">
          Back
        </Button>
        <Button
          onClick={validateAndProceed}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}