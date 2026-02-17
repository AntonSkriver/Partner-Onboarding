"use client"

import { Button } from "@/components/ui/button"
import { usePartnerOnboarding, SDG_OPTIONS } from "../../../contexts/partner-onboarding-context"
import { Globe2, AlertCircle, Check } from "lucide-react"
import { useState } from "react"
import { SDGIcon } from "../../sdg-icons"
import { useTranslations } from "next-intl"

interface PartnerMissionSdgProps {
  onNext: () => void
  onPrevious: () => void
  onGoToStep: (step: number) => void
}

export function PartnerMissionSdg({ onNext, onPrevious }: PartnerMissionSdgProps) {
  const { formData, updateFormData, isStepComplete } = usePartnerOnboarding()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const t = useTranslations('onboarding')

  const validateField = (field: string, value: number[]) => {
    const newErrors = { ...errors }

    switch (field) {
      case 'sdgFocus':
        if (!value || value.length === 0) {
          newErrors.sdgFocus = t('sdgValidationMinimum')
        } else {
          delete newErrors.sdgFocus
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const toggleSDG = (sdgId: number) => {
    const currentSDGs = formData.sdgFocus || []
    const updatedSDGs = currentSDGs.includes(sdgId)
      ? currentSDGs.filter(id => id !== sdgId)
      : [...currentSDGs, sdgId]

    updateFormData({ sdgFocus: updatedSDGs })
    if (touched.sdgFocus) {
      validateField('sdgFocus', updatedSDGs)
    }
  }

  const handleSDGSectionInteraction = () => {
    if (!touched.sdgFocus) {
      setTouched(prev => ({ ...prev, sdgFocus: true }))
      validateField('sdgFocus', formData.sdgFocus || [])
    }
  }

  const handleContinue = () => {
    const sdgValid = validateField('sdgFocus', formData.sdgFocus || [])
    setTouched({ sdgFocus: true })

    if (sdgValid && isStepComplete(3)) {
      onNext()
    }
  }

  const getSelectedSDGs = () => {
    return formData.sdgFocus?.map(id => SDG_OPTIONS.find(sdg => sdg.id === id)).filter(Boolean) || []
  }

  const canProceed = isStepComplete(3) && Object.keys(errors).length === 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-purple-600 mb-1">{t('sdgStepLabel')}</p>
        <h1 className="text-2xl font-bold text-gray-900">{t('sdgStepTitle')}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {t('sdgStepSubtitle')}
        </p>
      </div>

      {/* SDG Grid */}
      <div className="space-y-4" onClick={handleSDGSectionInteraction}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-[#8157D9]" />
            {t('sdgSelectLabel')} <span className="text-[#8157D9]">*</span>
          </p>
          {formData.sdgFocus.length > 0 && (
            <span className="text-sm text-[#8157D9] font-medium">
              {formData.sdgFocus.length} {t('sdgSelected')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {SDG_OPTIONS.map((sdg) => {
            const isSelected = formData.sdgFocus?.includes(sdg.id)
            return (
              <button
                key={sdg.id}
                type="button"
                onClick={() => toggleSDG(sdg.id)}
                className={`
                  relative group aspect-square rounded-xl overflow-hidden transition-all duration-300
                  ${isSelected
                    ? 'ring-3 ring-[#8157D9] ring-offset-2 scale-105 shadow-lg'
                    : 'opacity-70 hover:opacity-100 hover:scale-102'
                  }
                `}
              >
                <SDGIcon
                  number={sdg.id}
                  size="lg"
                  showTitle={false}
                  className="w-full h-full object-cover"
                />

                {/* Selection overlay */}
                {isSelected && (
                  <div className="absolute inset-0 bg-[#8157D9]/20 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-[#8157D9] flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                  </div>
                )}

                {/* Hover effect */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </button>
            )
          })}
        </div>

        {errors.sdgFocus && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">{errors.sdgFocus}</p>
          </div>
        )}
      </div>

      {/* Selected SDGs summary */}
      {getSelectedSDGs().length > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100/50">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-emerald-900 mb-2">
                {t('sdgSelectedTitle')} ({getSelectedSDGs().length})
              </p>
              <div className="flex flex-wrap gap-2">
                {getSelectedSDGs().map(sdg => (
                  <span
                    key={sdg!.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-sm text-gray-700 border border-emerald-200"
                  >
                    <span className="font-semibold text-emerald-600">#{sdg!.id}</span>
                    <span className="text-gray-500">{sdg!.title}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tip card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 border border-blue-100/50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <span className="text-xl">🎯</span>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">{t('sdgMatchingTitle')}</h4>
            <p className="text-sm text-blue-700 leading-relaxed">
              {t('sdgMatchingDesc')}
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
          {t('sdgBack')}
        </Button>
        <Button
          onClick={handleContinue}
          className="flex-1 py-6 text-base bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
          disabled={!canProceed}
          size="lg"
        >
          {t('sdgContinue')}
        </Button>
      </div>
    </div>
  )
}
