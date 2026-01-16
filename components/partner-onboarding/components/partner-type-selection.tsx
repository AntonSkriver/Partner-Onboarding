"use client"

import { Button } from "@/components/ui/button"
import { usePartnerOnboarding, type PartnerType } from "../../../contexts/partner-onboarding-context"
import { Building2, Landmark, GraduationCap, Building, HelpCircle, School, Check, Sparkles } from "lucide-react"

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
  gradient: string
  iconBg: string
}

export function PartnerTypeSelection({ onNext, onPrevious }: PartnerTypeSelectionProps) {
  const { formData, updateFormData, isStepComplete } = usePartnerOnboarding()

  const partnerTypes: PartnerTypeOption[] = [
    {
      id: 'ngo',
      title: 'NGO',
      description: 'Non-profit organizations driving education and social impact',
      examples: 'UNICEF, Save the Children, Oxfam',
      icon: Building2,
      gradient: 'from-blue-500 to-cyan-400',
      iconBg: 'bg-blue-500/10 group-hover:bg-blue-500/20',
    },
    {
      id: 'government',
      title: 'Government',
      description: 'Public institutions and ministries of education',
      examples: 'Ministry of Education, UNESCO',
      icon: Landmark,
      gradient: 'from-emerald-500 to-teal-400',
      iconBg: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
    },
    {
      id: 'school',
      title: 'School',
      description: 'Individual schools seeking global classroom connections',
      examples: 'Primary, Secondary, International Schools',
      icon: School,
      gradient: 'from-cyan-500 to-blue-400',
      iconBg: 'bg-cyan-500/10 group-hover:bg-cyan-500/20',
    },
    {
      id: 'school_network',
      title: 'School Network',
      description: 'Districts, networks, or groups of schools',
      examples: 'School Districts, Academy Chains',
      icon: GraduationCap,
      gradient: 'from-violet-500 to-purple-400',
      iconBg: 'bg-violet-500/10 group-hover:bg-violet-500/20',
    },
    {
      id: 'commercial',
      title: 'Corporate',
      description: 'Companies with educational CSR initiatives',
      examples: 'LEGO Education, Microsoft, Google',
      icon: Building,
      gradient: 'from-orange-500 to-amber-400',
      iconBg: 'bg-orange-500/10 group-hover:bg-orange-500/20',
    },
    {
      id: 'other',
      title: 'Other',
      description: 'Foundations, research institutes, and more',
      examples: 'Think Tanks, Educational Foundations',
      icon: HelpCircle,
      gradient: 'from-gray-500 to-slate-400',
      iconBg: 'bg-gray-500/10 group-hover:bg-gray-500/20',
    }
  ]

  const selectPartnerType = (type: PartnerType) => {
    updateFormData({ organizationType: type })
  }

  const canProceed = isStepComplete(1)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8157D9]/10 border border-[#8157D9]/20">
          <Sparkles className="w-4 h-4 text-[#8157D9]" />
          <span className="text-[#8157D9] text-sm font-medium">Step 1 of 5</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          What type of organization
          <br />
          <span className="text-[#8157D9]">are you?</span>
        </h1>

        <p className="text-gray-500 max-w-lg mx-auto">
          This helps us tailor your experience and connect you with the right schools and partners.
        </p>
      </div>

      {/* Organization Type Grid */}
      <div className="grid md:grid-cols-2 gap-3">
        {partnerTypes.map((type) => {
          const Icon = type.icon
          const isSelected = formData.organizationType === type.id

          return (
            <button
              key={type.id}
              onClick={() => selectPartnerType(type.id)}
              className={`
                group relative flex items-start gap-4 p-5 rounded-2xl text-left transition-all duration-300
                ${isSelected
                  ? 'bg-[#8157D9]/5 border-2 border-[#8157D9] shadow-lg shadow-[#8157D9]/10'
                  : 'bg-white border-2 border-gray-100 hover:border-gray-200 hover:shadow-md'
                }
              `}
            >
              {/* Selection indicator */}
              <div className={`
                absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300
                ${isSelected
                  ? 'bg-[#8157D9] scale-100'
                  : 'bg-gray-100 scale-90 group-hover:scale-100'
                }
              `}>
                {isSelected && <Check className="w-4 h-4 text-white" />}
              </div>

              {/* Icon */}
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300
                ${isSelected ? 'bg-[#8157D9]/10' : type.iconBg}
              `}>
                <Icon className={`w-6 h-6 transition-colors duration-300 ${isSelected ? 'text-[#8157D9]' : 'text-gray-400 group-hover:text-gray-600'}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pr-8">
                <h3 className={`font-semibold text-lg mb-1 transition-colors duration-300 ${isSelected ? 'text-[#8157D9]' : 'text-gray-900'}`}>
                  {type.title}
                </h3>
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                  {type.description}
                </p>
                <p className="text-xs text-gray-400">
                  e.g., {type.examples}
                </p>
              </div>

              {/* Gradient accent on hover/selection */}
              <div className={`
                absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl bg-gradient-to-r ${type.gradient} transition-opacity duration-300
                ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}
              `} />
            </button>
          )
        })}
      </div>

      {/* Helper text */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-5 border border-blue-100/50">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <span className="text-xl">💡</span>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Why does this matter?</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Different organization types have different collaboration styles. We&apos;ll customize your dashboard,
              suggest relevant SDG projects, and match you with schools that best fit your mission.
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
          onClick={onNext}
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
