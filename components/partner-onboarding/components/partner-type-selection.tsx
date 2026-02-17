"use client"

import { Button } from "@/components/ui/button"
import { usePartnerOnboarding, type PartnerType } from "../../../contexts/partner-onboarding-context"
import { Building2, Landmark, GraduationCap, Building, HelpCircle, School, Check } from "lucide-react"
import { useTranslations } from "next-intl"

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
  const t = useTranslations('onboarding')

  const partnerTypes: PartnerTypeOption[] = [
    {
      id: 'ngo',
      title: t('typeOrgNgo'),
      description: t('typeDescNgo'),
      examples: t('typeExampleNgo'),
      icon: Building2,
      gradient: 'from-blue-500 to-cyan-400',
      iconBg: 'bg-blue-500/10 group-hover:bg-blue-500/20',
    },
    {
      id: 'government',
      title: t('typeOrgGovernment'),
      description: t('typeDescGovernment'),
      examples: t('typeExampleGovernment'),
      icon: Landmark,
      gradient: 'from-emerald-500 to-teal-400',
      iconBg: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
    },
    {
      id: 'school',
      title: t('typeOrgSchool'),
      description: t('typeDescSchool'),
      examples: t('typeExampleSchool'),
      icon: School,
      gradient: 'from-cyan-500 to-blue-400',
      iconBg: 'bg-cyan-500/10 group-hover:bg-cyan-500/20',
    },
    {
      id: 'school_network',
      title: t('typeOrgSchoolNetwork'),
      description: t('typeDescSchoolNetwork'),
      examples: t('typeExampleSchoolNetwork'),
      icon: GraduationCap,
      gradient: 'from-violet-500 to-purple-400',
      iconBg: 'bg-violet-500/10 group-hover:bg-violet-500/20',
    },
    {
      id: 'commercial',
      title: t('typeOrgCorporate'),
      description: t('typeDescCorporate'),
      examples: t('typeExampleCorporate'),
      icon: Building,
      gradient: 'from-orange-500 to-amber-400',
      iconBg: 'bg-orange-500/10 group-hover:bg-orange-500/20',
    },
    {
      id: 'other',
      title: t('typeOrgOther'),
      description: t('typeDescOther'),
      examples: t('typeExampleOther'),
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
      <div>
        <p className="text-sm font-medium text-purple-600 mb-1">{t('typeStepLabel')}</p>
        <h1 className="text-2xl font-bold text-gray-900">{t('typeStepTitle')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('typeStepSubtitle')}</p>
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
            <h4 className="font-medium text-gray-900 mb-1">{t('typeWhyMattersTitle')}</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t('typeWhyMattersDesc')}
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
          {t('typeBack')}
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 py-6 text-base bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
          disabled={!canProceed}
          size="lg"
        >
          {t('typeContinue')}
        </Button>
      </div>
    </div>
  )
}
