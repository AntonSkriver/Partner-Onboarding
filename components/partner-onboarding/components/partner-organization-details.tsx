"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePartnerOnboarding, getOrganizationTypeLabel } from "../../../contexts/partner-onboarding-context"
import { Building2, Globe, AlertCircle } from "lucide-react"
import { useState } from "react"

interface PartnerOrganizationDetailsProps {
  onNext: () => void
  onPrevious: () => void
  onGoToStep: (step: number) => void
}

export function PartnerOrganizationDetails({ onNext, onPrevious }: PartnerOrganizationDetailsProps) {
  const { formData, updateFormData, isStepComplete } = usePartnerOnboarding()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors }

    switch (field) {
      case 'organizationName':
        if (!value.trim()) {
          newErrors.organizationName = 'Organization name is required'
        } else if (value.trim().length < 2) {
          newErrors.organizationName = 'Organization name must be at least 2 characters'
        } else {
          delete newErrors.organizationName
        }
        break
      
      case 'organizationWebsite':
        if (value.trim() && !/^https?:\/\/.+\..+/.test(value)) {
          newErrors.organizationWebsite = 'Please enter a valid website URL (e.g., https://example.org)'
        } else {
          delete newErrors.organizationWebsite
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    updateFormData({ [field]: value })
    if (touched[field]) {
      validateField(field, value)
    }
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const value = field === 'organizationName' ? formData.organizationName : formData.organizationWebsite
    validateField(field, value || '')
  }

  const handleContinue = () => {
    // Validate all fields before proceeding
    const nameValid = validateField('organizationName', formData.organizationName || '')
    const websiteValid = validateField('organizationWebsite', formData.organizationWebsite || '')
    
    setTouched({ organizationName: true, organizationWebsite: true })
    
    if (nameValid && websiteValid && isStepComplete(2)) {
      onNext()
    }
  }

  const canProceed = isStepComplete(2) && Object.keys(errors).length === 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Tell us about your {getOrganizationTypeLabel(formData.organizationType).toLowerCase()}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Help us understand your organization so we can connect you with the right schools 
          and create meaningful collaboration opportunities.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-8">
        {/* Organization Name */}
        <div className="space-y-3">
          <Label htmlFor="organizationName" className="text-lg font-semibold text-gray-900">
            Organization Name *
          </Label>
          <Input
            id="organizationName"
            placeholder="e.g., UNICEF, Ministry of Education, ABC School District"
            value={formData.organizationName || ''}
            onChange={(e) => handleInputChange('organizationName', e.target.value)}
            onBlur={() => handleBlur('organizationName')}
            className={`text-lg h-14 ${errors.organizationName ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'}`}
          />
          {errors.organizationName && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.organizationName}</p>
            </div>
          )}
          <p className="text-sm text-gray-500">
            Enter the full official name of your organization as it appears on official documents
          </p>
        </div>

        {/* Website */}
        <div className="space-y-3">
          <Label htmlFor="organizationWebsite" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-600" />
            Organization Website
          </Label>
          <Input
            id="organizationWebsite"
            placeholder="https://www.yourorganization.org"
            value={formData.organizationWebsite || ''}
            onChange={(e) => handleInputChange('organizationWebsite', e.target.value)}
            onBlur={() => handleBlur('organizationWebsite')}
            className={`text-lg h-14 ${errors.organizationWebsite ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'}`}
          />
          {errors.organizationWebsite && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.organizationWebsite}</p>
            </div>
          )}
          <p className="text-sm text-gray-500">
            Schools and partners can learn more about your work through your website. 
            This also helps us display your organization&apos;s logo in your profile.
          </p>
        </div>
      </div>

      {/* Information Box */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <span className="text-green-600 text-2xl">🌟</span>
          <div>
            <h4 className="font-semibold text-green-900 mb-2">Building Trust with Schools</h4>
            <p className="text-green-800 leading-relaxed">
              Providing accurate organization details helps schools trust your initiatives 
              and makes it easier for them to get approval from administrators and parents. 
              A professional profile increases your collaboration success rate by 3x.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 pt-4">
        <Button 
          variant="outline" 
          onClick={onPrevious} 
          className="flex-1 py-3 text-base"
          size="lg"
        >
          Back
        </Button>
        <Button
          onClick={handleContinue}
          className="flex-1 py-3 text-base bg-purple-600 hover:bg-purple-700 text-white"
          disabled={!canProceed}
          size="lg"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}