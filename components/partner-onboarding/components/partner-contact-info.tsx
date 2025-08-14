"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePartnerOnboarding, getOrganizationTypeLabel, getContactRoleLabel, type ContactRole } from "../../../contexts/partner-onboarding-context"
import { User, Mail, Phone, Shield, AlertCircle } from "lucide-react"
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
    // Validate all fields before proceeding
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Contact Information
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          We need a primary contact for your {getOrganizationTypeLabel(formData.organizationType).toLowerCase()} so schools can reach out about collaborations and partnerships.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Contact Name */}
        <div className="space-y-3">
          <Label htmlFor="contactName" className="text-lg font-semibold text-gray-900">
            Primary Contact Name *
          </Label>
          <Input
            id="contactName"
            placeholder="John Smith"
            value={formData.contactName || ''}
            onChange={(e) => handleInputChange('contactName', e.target.value)}
            onBlur={() => handleBlur('contactName')}
            className={`text-lg h-14 ${
              errors.contactName ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'
            }`}
          />
          {errors.contactName && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.contactName}</p>
            </div>
          )}
          <p className="text-sm text-gray-500">
            This person will receive collaboration requests and partnership inquiries from schools
          </p>
        </div>

        {/* Contact Email */}
        <div className="space-y-3">
          <Label htmlFor="contactEmail" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-purple-600" />
            Email Address *
          </Label>
          <Input
            id="contactEmail"
            type="email"
            placeholder="contact@yourorganization.org"
            value={formData.contactEmail || ''}
            onChange={(e) => handleInputChange('contactEmail', e.target.value)}
            onBlur={() => handleBlur('contactEmail')}
            className={`text-lg h-14 ${
              errors.contactEmail ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'
            }`}
          />
          {errors.contactEmail && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.contactEmail}</p>
            </div>
          )}
          <p className="text-sm text-gray-500">
            Schools will use this email to initiate partnerships and discuss project opportunities
          </p>
        </div>

        {/* Contact Role */}
        <div className="space-y-3">
          <Label className="text-lg font-semibold text-gray-900">
            Role/Position *
          </Label>
          <Select 
            value={formData.contactRole || ''} 
            onValueChange={(value: ContactRole) => handleSelectChange('contactRole', value)}
            onOpenChange={() => handleBlur('contactRole')}
          >
            <SelectTrigger className={`h-14 text-lg ${
              errors.contactRole ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'
            }`}>
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              {CONTACT_ROLES.map((role) => (
                <SelectItem key={role.value} value={role.value} className="text-base">
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
          <p className="text-sm text-gray-500">
            Helps schools understand who they&apos;ll be working with and their level of authority
          </p>
        </div>

        {/* Contact Phone (Optional) */}
        <div className="space-y-3">
          <Label htmlFor="contactPhone" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Phone className="w-5 h-5 text-purple-600" />
            Phone Number <span className="text-base text-gray-500 font-normal">(optional)</span>
          </Label>
          <Input
            id="contactPhone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={formData.contactPhone || ''}
            onChange={(e) => handleInputChange('contactPhone', e.target.value)}
            onBlur={() => handleBlur('contactPhone')}
            className={`text-lg h-14 ${
              errors.contactPhone ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'
            }`}
          />
          {errors.contactPhone && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.contactPhone}</p>
            </div>
          )}
          <p className="text-sm text-gray-500">
            For urgent communications or if schools prefer phone contact
          </p>
        </div>
      </div>

      {/* Privacy Information Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Shield className="w-6 h-6 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-900 mb-2">Privacy & Contact Information</h4>
            <p className="text-yellow-800 leading-relaxed">
              Your contact information will only be shared with schools that express genuine 
              interest in partnering with your organization. You can update these details 
              anytime in your profile settings, and you have full control over who can contact you.
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