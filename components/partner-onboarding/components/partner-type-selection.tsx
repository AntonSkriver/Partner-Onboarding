"use client"

import { Button } from "@/components/ui/button"
import { usePartnerOnboarding, type PartnerType } from "../../../contexts/partner-onboarding-context"
import { Building2, Landmark, GraduationCap, Building, HelpCircle } from "lucide-react"

interface PartnerTypeSelectionProps {
  onNext: () => void
  onPrevious: () => void
  onGoToStep: (step: number) => void
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
  const { formData, updateFormData, isStepComplete } = usePartnerOnboarding()

  const partnerTypes: PartnerTypeOption[] = [
    {
      id: 'ngo',
      title: 'Non-Governmental Organization (NGO)',
      description: 'Organizations focused on education, human rights, and social impact',
      examples: 'UNICEF, Save the Children, Oxfam, World Vision',
      icon: Building2,
      color: 'text-blue-600'
    },
    {
      id: 'government',
      title: 'Government Agency/Ministry',
      description: 'Public institutions and governmental educational bodies',
      examples: 'Ministry of Education, Health Department, UNESCO',
      icon: Landmark,
      color: 'text-green-600'
    },
    {
      id: 'school_network',
      title: 'School Network/District',
      description: 'Groups of schools, educational districts, or school systems',
      examples: 'School Districts, Educational Networks, Academy Chains',
      icon: GraduationCap,
      color: 'text-purple-600'
    },
    {
      id: 'commercial',
      title: 'Corporate Partner',
      description: 'Companies with educational CSR initiatives and programs',
      examples: 'LEGO Education, Microsoft Education, Google for Education',
      icon: Building,
      color: 'text-orange-600'
    },
    {
      id: 'other',
      title: 'Other Organization',
      description: 'Other types of educational partners and institutions',
      examples: 'Foundations, Research Institutes, Think Tanks',
      icon: HelpCircle,
      color: 'text-gray-600'
    }
  ]

  const selectPartnerType = (type: PartnerType) => {
    updateFormData({ organizationType: type })
  }

  const canProceed = isStepComplete(1)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          What type of organization are you?
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          This helps us tailor the experience to your organization&apos;s needs and connect you 
          with schools that align with your mission and goals.
        </p>
      </div>

      {/* Organization Type Options */}
      <div className="space-y-4">
        {partnerTypes.map((type) => (
          <div
            key={type.id}
            className={`group flex items-start p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              formData.organizationType === type.id
                ? 'border-purple-500 bg-purple-50 shadow-lg scale-[1.02]'
                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
            }`}
            onClick={() => selectPartnerType(type.id)}
          >
            <div className="flex items-start space-x-5 w-full">
              {/* Icon */}
              <div className={`mt-1 transition-colors ${
                formData.organizationType === type.id ? 'text-purple-600' : type.color
              }`}>
                <type.icon className="h-7 w-7" />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-900">
                  {type.title}
                </h3>
                <p className="text-gray-600 mb-3 leading-relaxed">
                  {type.description}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Examples:</span> {type.examples}
                </p>
              </div>
              
              {/* Radio Button */}
              <div className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
                formData.organizationType === type.id
                  ? 'border-purple-500 bg-purple-500'
                  : 'border-gray-300 group-hover:border-purple-400'
              }`}>
                {formData.organizationType === type.id && (
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <span className="text-blue-600 text-2xl">💡</span>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Why we ask this</h4>
            <p className="text-blue-800 leading-relaxed">
              Understanding your organization type helps us connect you with schools that align 
              with your mission, suggest relevant SDG-focused projects, and provide the most 
              suitable collaboration opportunities for your sector.
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
          onClick={onNext}
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