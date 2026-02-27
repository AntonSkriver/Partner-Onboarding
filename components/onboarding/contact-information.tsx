'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePartnerForm } from '@/contexts/partner-form-context'
import { User, Mail, Phone } from 'lucide-react'
import { useState } from 'react'

interface ContactInformationProps {
  onNext: () => void
  onPrevious: () => void
}

const CONTACT_ROLES = [
  { value: 'ceo', label: 'CEO/Executive Director' },
  { value: 'program_manager', label: 'Program Manager' },
  { value: 'education_director', label: 'Education Director' },
  { value: 'partnerships_manager', label: 'Partnerships Manager' },
  { value: 'communications_director', label: 'Communications Director' },
  { value: 'project_coordinator', label: 'Project Coordinator' },
  { value: 'outreach_coordinator', label: 'Outreach Coordinator' },
  { value: 'other', label: 'Other' }
]

export function ContactInformation({ onNext, onPrevious }: ContactInformationProps) {
  const { formData, updateFormData } = usePartnerForm()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateAndProceed = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.contactName?.trim()) {
      newErrors.contactName = 'Contact name is required'
    } else if (formData.contactName.trim().length < 2) {
      newErrors.contactName = 'Contact name must be at least 2 characters'
    }

    if (!formData.contactEmail?.trim()) {
      newErrors.contactEmail = 'Email address is required'
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(formData.contactEmail)) {
        newErrors.contactEmail = 'Please enter a valid email address'
      }
    }

    if (!formData.contactRole?.trim()) {
      newErrors.contactRole = 'Please select your role'
    }

    if (formData.contactPhone && formData.contactPhone.trim()) {
      const phonePattern = /^[\+]?[\d\s\-\(\)]{8,}$/
      if (!phonePattern.test(formData.contactPhone)) {
        newErrors.contactPhone = 'Please enter a valid phone number'
      }
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      onNext()
    }
  }

  const handleInputChange = (field: string, value: string) => {
    updateFormData({ [field]: value })
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
          <User className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Who is your contact person?</h2>
        <p className="text-gray-600">
          We need a primary contact for your {getOrganizationTypeLabel().toLowerCase()} so schools can reach out about collaborations.
        </p>
      </div>

      <div className="space-y-6">
        {/* Contact Name */}
        <div className="space-y-2">
          <Label htmlFor="contactName" className="text-base font-medium text-gray-900">
            Primary Contact Name *
          </Label>
          <Input
            id="contactName"
            placeholder="John Smith"
            value={formData.contactName || ''}
            onChange={(e) => handleInputChange('contactName', e.target.value)}
            className={`text-base h-12 ${errors.contactName ? 'border-red-500' : ''}`}
          />
          {errors.contactName && (
            <p className="text-sm text-red-600">{errors.contactName}</p>
          )}
          <p className="text-sm text-gray-500">
            This person will receive collaboration requests from schools
          </p>
        </div>

        {/* Contact Email */}
        <div className="space-y-2">
          <Label htmlFor="contactEmail" className="text-base font-medium text-gray-900 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Address *
          </Label>
          <Input
            id="contactEmail"
            type="email"
            placeholder="contact@yourorganization.org"
            value={formData.contactEmail || ''}
            onChange={(e) => handleInputChange('contactEmail', e.target.value)}
            className={`text-base h-12 ${errors.contactEmail ? 'border-red-500' : ''}`}
          />
          {errors.contactEmail && (
            <p className="text-sm text-red-600">{errors.contactEmail}</p>
          )}
          <p className="text-sm text-gray-500">
            Schools will use this email to initiate partnerships
          </p>
        </div>

        {/* Contact Role */}
        <div className="space-y-2">
          <Label htmlFor="contactRole" className="text-base font-medium text-gray-900">
            Role/Position *
          </Label>
          <Select value={formData.contactRole || ''} onValueChange={(value) => handleInputChange('contactRole', value)}>
            <SelectTrigger className={`h-12 ${errors.contactRole ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              {CONTACT_ROLES.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.contactRole && (
            <p className="text-sm text-red-600">{errors.contactRole}</p>
          )}
          <p className="text-sm text-gray-500">
            Helps schools understand who they&apos;ll be working with
          </p>
        </div>

        {/* Contact Phone (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="contactPhone" className="text-base font-medium text-gray-900 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Phone Number <span className="text-sm text-gray-500">(optional)</span>
          </Label>
          <Input
            id="contactPhone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={formData.contactPhone || ''}
            onChange={(e) => handleInputChange('contactPhone', e.target.value)}
            className={`text-base h-12 ${errors.contactPhone ? 'border-red-500' : ''}`}
          />
          {errors.contactPhone && (
            <p className="text-sm text-red-600">{errors.contactPhone}</p>
          )}
          <p className="text-sm text-gray-500">
            For urgent communications or preferred contact method
          </p>
        </div>
      </div>

      {/* Information box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-yellow-600 text-lg">🔒</span>
          <div>
            <h4 className="font-medium text-yellow-900 mb-1">Privacy & Contact</h4>
            <p className="text-sm text-yellow-800">
              Your contact information will only be shared with schools that express interest
              in partnering with your organization. You can update these details anytime in your profile.
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