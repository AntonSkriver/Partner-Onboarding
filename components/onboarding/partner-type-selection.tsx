'use client'

import { Button } from '@/components/ui/button'
import { usePartnerForm, type PartnerType } from '@/contexts/partner-form-context'
import { Building2, Landmark, GraduationCap, Building, HelpCircle } from 'lucide-react'

interface PartnerTypeSelectionProps {
  onNext: () => void
  onPrevious: () => void
}

interface PartnerTypeOption {
  id: PartnerType
  title: string
  description: string
  examples: string
  icon: React.ElementType
  color: string
}

export function PartnerTypeSelection({ onNext, onPrevious }: PartnerTypeSelectionProps) {
  const { formData, updateFormData } = usePartnerForm()

  const partnerTypes: PartnerTypeOption[] = [
    {
      id: 'ngo',
      title: 'Non-Governmental Organization (NGO)',
      description: 'Organizations focused on education, rights, and social impact',
      examples: 'UNICEF, Save the Children, Oxfam',
      icon: Building2,
      color: 'text-blue-600'
    },
    {
      id: 'government',
      title: 'Government Agency/Ministry',
      description: 'Public institutions and governmental bodies',
      examples: 'Ministry of Education, Health Department',
      icon: Landmark,
      color: 'text-green-600'
    },
    {
      id: 'school_network',
      title: 'School Network/District',
      description: 'Groups of schools or educational districts',
      examples: 'School Districts, Educational Networks',
      icon: GraduationCap,
      color: 'text-purple-600'
    },
    {
      id: 'commercial',
      title: 'Commercial/Corporate Partner',
      description: 'Companies with educational CSR initiatives',
      examples: 'LEGO Education, Microsoft Education',
      icon: Building,
      color: 'text-orange-600'
    },
    {
      id: 'other',
      title: 'Other Organization',
      description: 'Other types of educational partners',
      examples: 'Foundations, Research Institutes',
      icon: HelpCircle,
      color: 'text-gray-600'
    }
  ]

  const selectPartnerType = (type: PartnerType) => {
    updateFormData({ organizationType: type })
  }

  return (
    <div className="space-y-6 pt-16 sm:pt-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">What type of organization are you?</h2>
        <p className="text-gray-600">
          This helps us tailor the experience to your organization&apos;s needs and connect you with relevant schools.
        </p>
      </div>

      <div className="space-y-3">
        {partnerTypes.map((type) => (
          <div
            key={type.id}
            className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
              formData.organizationType === type.id
                ? 'border-purple-500 bg-purple-50 shadow-md'
                : 'border-gray-200 hover:border-purple-300'
            }`}
            onClick={() => selectPartnerType(type.id)}
          >
            <div className="flex items-start space-x-4 w-full">
              <div className={`mt-1 ${formData.organizationType === type.id ? 'text-purple-600' : type.color}`}>
                <type.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">{type.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                <p className="text-xs text-gray-500">Examples: {type.examples}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                formData.organizationType === type.id
                  ? 'border-purple-500 bg-purple-500'
                  : 'border-gray-300'
              }`}>
                {formData.organizationType === type.id && (
                  <div className="w-full h-full rounded-full bg-white scale-50" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Information box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-blue-600 text-lg">💡</span>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Why we ask this</h4>
            <p className="text-sm text-blue-800">
              Understanding your organization type helps us connect you with schools that align with your mission 
              and provide the most relevant collaboration opportunities.
            </p>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button variant="outline" onClick={onPrevious} className="flex-1">
          Back
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
          disabled={!formData.organizationType}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}