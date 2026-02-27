"use client"

import { Button } from "@/components/ui/button"
import { usePartnerOnboarding } from "../../../contexts/partner-onboarding-context"
import { Globe2, AlertCircle } from "lucide-react"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { SdgDisplay } from "@/components/framework-selector"

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

  const handleSdgChange = (sdgs: number[]) => {
    updateFormData({ sdgFocus: sdgs })
    if (touched.sdgFocus) {
      validateField('sdgFocus', sdgs)
    }
  }

  const handleContinue = () => {
    const sdgValid = validateField('sdgFocus', formData.sdgFocus || [])
    setTouched({ sdgFocus: true })

    if (sdgValid && isStepComplete(2)) {
      onNext()
    }
  }

  const canProceed = isStepComplete(2) && Object.keys(errors).length === 0

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

      {/* SDG Selection via Sheet */}
      <div className="space-y-4" onClick={() => {
        if (!touched.sdgFocus) {
          setTouched(prev => ({ ...prev, sdgFocus: true }))
          validateField('sdgFocus', formData.sdgFocus || [])
        }
      }}>
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-[#8157D9]" />
          <p className="text-sm font-medium text-gray-700">
            {t('sdgSelectLabel')} <span className="text-[#8157D9]">*</span>
          </p>
        </div>

        <SdgDisplay
          selected={formData.sdgFocus || []}
          onChange={handleSdgChange}
          max={5}
        />

        {errors.sdgFocus && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">{errors.sdgFocus}</p>
          </div>
        )}
      </div>

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
