"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePartnerOnboarding, getOrganizationTypeLabel } from "../../../contexts/partner-onboarding-context"
import { Building2, Globe, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react"
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
          newErrors.organizationWebsite = 'Please enter a valid URL (e.g., https://example.org)'
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
    const nameValid = validateField('organizationName', formData.organizationName || '')
    const websiteValid = validateField('organizationWebsite', formData.organizationWebsite || '')

    setTouched({ organizationName: true, organizationWebsite: true })

    if (nameValid && websiteValid && isStepComplete(2)) {
      onNext()
    }
  }

  const canProceed = isStepComplete(2) && Object.keys(errors).length === 0
  const orgTypeLabel = getOrganizationTypeLabel(formData.organizationType).toLowerCase()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8157D9]/10 border border-[#8157D9]/20">
          <Sparkles className="w-4 h-4 text-[#8157D9]" />
          <span className="text-[#8157D9] text-sm font-medium">Step 2 of 5</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          Tell us about your
          <br />
          <span className="text-[#8157D9]">{orgTypeLabel}</span>
        </h1>

        <p className="text-gray-500 max-w-lg mx-auto">
          Help schools learn about your organization and find you for collaborations.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Organization Name */}
        <div className="space-y-3">
          <Label htmlFor="organizationName" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Building2 className="w-4 h-4 text-[#8157D9]" />
            Organization Name
            <span className="text-[#8157D9]">*</span>
          </Label>

          <div className="relative">
            <Input
              id="organizationName"
              placeholder="e.g., UNICEF Denmark, Copenhagen School District"
              value={formData.organizationName || ''}
              onChange={(e) => handleInputChange('organizationName', e.target.value)}
              onBlur={() => handleBlur('organizationName')}
              className={`
                h-14 text-base px-4 rounded-xl transition-all duration-200
                ${errors.organizationName
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : formData.organizationName && !errors.organizationName
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                    : 'border-gray-200 focus:border-[#8157D9] focus:ring-[#8157D9]/20'
                }
              `}
            />
            {formData.organizationName && !errors.organizationName && (
              <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
          </div>

          {errors.organizationName ? (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.organizationName}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              Use your official organization name as it appears on documents
            </p>
          )}
        </div>

        {/* Website */}
        <div className="space-y-3">
          <Label htmlFor="organizationWebsite" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Globe className="w-4 h-4 text-[#8157D9]" />
            Website
            <span className="text-gray-400 font-normal">(optional)</span>
          </Label>

          <div className="relative">
            <Input
              id="organizationWebsite"
              placeholder="https://www.yourorganization.org"
              value={formData.organizationWebsite || ''}
              onChange={(e) => handleInputChange('organizationWebsite', e.target.value)}
              onBlur={() => handleBlur('organizationWebsite')}
              className={`
                h-14 text-base px-4 rounded-xl transition-all duration-200
                ${errors.organizationWebsite
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : formData.organizationWebsite && !errors.organizationWebsite
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                    : 'border-gray-200 focus:border-[#8157D9] focus:ring-[#8157D9]/20'
                }
              `}
            />
            {formData.organizationWebsite && !errors.organizationWebsite && (
              <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
          </div>

          {errors.organizationWebsite ? (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.organizationWebsite}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              Schools can learn more about your work and we&apos;ll display your logo
            </p>
          )}
        </div>
      </div>

      {/* Tip card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-6 border border-emerald-100/50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <span className="text-xl">🌟</span>
          </div>
          <div>
            <h4 className="font-semibold text-emerald-900 mb-1">Build trust with schools</h4>
            <p className="text-sm text-emerald-700 leading-relaxed">
              A complete profile with accurate details helps schools verify your organization
              and increases collaboration success by 3x. Administrators appreciate transparency.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 pt-4">
        <Button
          variant="outline"
          onClick={onPrevious}
          className="flex-1 py-6 text-base border-gray-200 hover:bg-gray-50"
          size="lg"
        >
          Back
        </Button>
        <Button
          onClick={handleContinue}
          className="flex-1 py-6 text-base bg-[#8157D9] hover:bg-[#7048C6] text-white shadow-lg shadow-[#8157D9]/25 disabled:opacity-50 disabled:shadow-none"
          disabled={!canProceed}
          size="lg"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
