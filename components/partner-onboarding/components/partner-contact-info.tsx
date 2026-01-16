"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePartnerOnboarding, getOrganizationTypeLabel, type ContactRole } from "../../../contexts/partner-onboarding-context"
import { User, Mail, Phone, Shield, AlertCircle, CheckCircle2, Sparkles, Briefcase } from "lucide-react"
import { useState } from "react"

interface PartnerContactInfoProps {
  onNext: () => void
  onPrevious: () => void
  onGoToStep: (step: number) => void
}

const CONTACT_ROLES: { value: ContactRole; label: string }[] = [
  { value: 'ceo', label: 'CEO/Executive Director' },
  { value: 'program_manager', label: 'Program Manager' },
  { value: 'education_director', label: 'Education Director' },
  { value: 'partnerships_manager', label: 'Partnerships Manager' },
  { value: 'communications_director', label: 'Communications Director' },
  { value: 'project_coordinator', label: 'Project Coordinator' },
  { value: 'outreach_coordinator', label: 'Outreach Coordinator' },
  { value: 'other', label: 'Other' }
]

export function PartnerContactInfo({ onNext, onPrevious }: PartnerContactInfoProps) {
  const { formData, updateFormData, isStepComplete } = usePartnerOnboarding()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = (field: string, value: string | ContactRole | null) => {
    const newErrors = { ...errors }

    switch (field) {
      case 'contactName':
        const nameValue = value as string
        if (!nameValue?.trim()) {
          newErrors.contactName = 'Contact name is required'
        } else if (nameValue.trim().length < 2) {
          newErrors.contactName = 'Contact name must be at least 2 characters'
        } else {
          delete newErrors.contactName
        }
        break

      case 'contactEmail':
        const emailValue = value as string
        if (!emailValue?.trim()) {
          newErrors.contactEmail = 'Email address is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
          newErrors.contactEmail = 'Please enter a valid email address'
        } else {
          delete newErrors.contactEmail
        }
        break

      case 'contactPhone':
        const phoneValue = value as string
        if (phoneValue?.trim() && !/^[\+]?[\d\s\-\(\)]{8,}$/.test(phoneValue)) {
          newErrors.contactPhone = 'Please enter a valid phone number'
        } else {
          delete newErrors.contactPhone
        }
        break

      case 'contactRole':
        if (!value) {
          newErrors.contactRole = 'Please select your role'
        } else {
          delete newErrors.contactRole
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

  const handleSelectChange = (field: string, value: ContactRole) => {
    updateFormData({ [field]: value })
    if (touched[field]) {
      validateField(field, value)
    }
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    let value: string | ContactRole | null
    switch (field) {
      case 'contactName':
        value = formData.contactName || ''
        break
      case 'contactEmail':
        value = formData.contactEmail || ''
        break
      case 'contactPhone':
        value = formData.contactPhone || ''
        break
      case 'contactRole':
        value = formData.contactRole
        break
      default:
        value = ''
    }
    validateField(field, value)
  }

  const handleContinue = () => {
    const nameValid = validateField('contactName', formData.contactName || '')
    const emailValid = validateField('contactEmail', formData.contactEmail || '')
    const phoneValid = validateField('contactPhone', formData.contactPhone || '')
    const roleValid = validateField('contactRole', formData.contactRole)

    setTouched({
      contactName: true,
      contactEmail: true,
      contactPhone: true,
      contactRole: true
    })

    if (nameValid && emailValid && phoneValid && roleValid && isStepComplete(4)) {
      onNext()
    }
  }

  const canProceed = isStepComplete(4) && Object.keys(errors).length === 0
  const orgTypeLabel = getOrganizationTypeLabel(formData.organizationType).toLowerCase()

  const isFieldValid = (field: string, value: string | null | undefined) => {
    return value && value.trim() && !errors[field]
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8157D9]/10 border border-[#8157D9]/20">
          <Sparkles className="w-4 h-4 text-[#8157D9]" />
          <span className="text-[#8157D9] text-sm font-medium">Step 4 of 5</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          Who should schools
          <br />
          <span className="text-[#8157D9]">contact?</span>
        </h1>

        <p className="text-gray-500 max-w-lg mx-auto">
          Add a primary contact for your {orgTypeLabel} so schools can reach out about collaborations.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Contact Name */}
        <div className="space-y-3">
          <Label htmlFor="contactName" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <User className="w-4 h-4 text-[#8157D9]" />
            Full Name
            <span className="text-[#8157D9]">*</span>
          </Label>

          <div className="relative">
            <Input
              id="contactName"
              placeholder="e.g., Maria Jensen"
              value={formData.contactName || ''}
              onChange={(e) => handleInputChange('contactName', e.target.value)}
              onBlur={() => handleBlur('contactName')}
              className={`
                h-14 text-base px-4 rounded-xl transition-all duration-200
                ${errors.contactName
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : isFieldValid('contactName', formData.contactName)
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                    : 'border-gray-200 focus:border-[#8157D9] focus:ring-[#8157D9]/20'
                }
              `}
            />
            {isFieldValid('contactName', formData.contactName) && (
              <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
          </div>

          {errors.contactName ? (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.contactName}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              This person will receive collaboration requests from schools
            </p>
          )}
        </div>

        {/* Contact Email */}
        <div className="space-y-3">
          <Label htmlFor="contactEmail" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Mail className="w-4 h-4 text-[#8157D9]" />
            Email Address
            <span className="text-[#8157D9]">*</span>
          </Label>

          <div className="relative">
            <Input
              id="contactEmail"
              type="email"
              placeholder="e.g., maria@organization.org"
              value={formData.contactEmail || ''}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              onBlur={() => handleBlur('contactEmail')}
              className={`
                h-14 text-base px-4 rounded-xl transition-all duration-200
                ${errors.contactEmail
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : isFieldValid('contactEmail', formData.contactEmail)
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                    : 'border-gray-200 focus:border-[#8157D9] focus:ring-[#8157D9]/20'
                }
              `}
            />
            {isFieldValid('contactEmail', formData.contactEmail) && (
              <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
          </div>

          {errors.contactEmail && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.contactEmail}</p>
            </div>
          )}
        </div>

        {/* Role Selection */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Briefcase className="w-4 h-4 text-[#8157D9]" />
            Role/Position
            <span className="text-[#8157D9]">*</span>
          </Label>

          <Select
            value={formData.contactRole || ''}
            onValueChange={(value: ContactRole) => handleSelectChange('contactRole', value)}
            onOpenChange={() => handleBlur('contactRole')}
          >
            <SelectTrigger className={`
              h-14 text-base rounded-xl transition-all duration-200
              ${errors.contactRole
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : formData.contactRole
                  ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                  : 'border-gray-200 focus:border-[#8157D9] focus:ring-[#8157D9]/20'
              }
            `}>
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              {CONTACT_ROLES.map((role) => (
                <SelectItem key={role.value} value={role.value} className="text-base py-3">
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {errors.contactRole && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.contactRole}</p>
            </div>
          )}
        </div>

        {/* Phone (Optional) */}
        <div className="space-y-3">
          <Label htmlFor="contactPhone" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Phone className="w-4 h-4 text-[#8157D9]" />
            Phone Number
            <span className="text-gray-400 font-normal">(optional)</span>
          </Label>

          <div className="relative">
            <Input
              id="contactPhone"
              type="tel"
              placeholder="e.g., +45 31 64 07 02"
              value={formData.contactPhone || ''}
              onChange={(e) => handleInputChange('contactPhone', e.target.value)}
              onBlur={() => handleBlur('contactPhone')}
              className={`
                h-14 text-base px-4 rounded-xl transition-all duration-200
                ${errors.contactPhone
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-200 focus:border-[#8157D9] focus:ring-[#8157D9]/20'
                }
              `}
            />
          </div>

          {errors.contactPhone && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.contactPhone}</p>
            </div>
          )}
        </div>
      </div>

      {/* Privacy notice */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 p-6 border border-amber-100/50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-900 mb-1">Your privacy matters</h4>
            <p className="text-sm text-amber-700 leading-relaxed">
              Contact information is only shared with schools that express genuine interest in partnering.
              You control who can contact you and can update these details anytime.
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
