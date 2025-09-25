"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { usePartnerOnboarding, SDG_OPTIONS } from "../../../contexts/partner-onboarding-context"
import { Globe, AlertCircle, Check } from "lucide-react"
import { useState } from "react"
import { SDGIcon } from "../../sdg-icons"

interface PartnerMissionSdgProps {
  onNext: () => void
  onPrevious: () => void
  onGoToStep: (step: number) => void
}

export function PartnerMissionSdg({ onNext, onPrevious }: PartnerMissionSdgProps) {
  const { formData, updateFormData, isStepComplete } = usePartnerOnboarding()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = (field: string, value: string | number[]) => {
    const newErrors = { ...errors }

    switch (field) {
      case 'sdgFocus':
        const sdgValue = value as number[]
        if (!sdgValue || sdgValue.length === 0) {
          newErrors.sdgFocus = 'Please select at least one SDG that aligns with your work'
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
    // Validate all fields before proceeding
    const missionValid = validateField('missionStatement', formData.missionStatement || '')
    const sdgValid = validateField('sdgFocus', formData.sdgFocus || [])
    
    setTouched({ missionStatement: true, sdgFocus: true })
    
    if (missionValid && sdgValid && isStepComplete(3)) {
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
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Globe className="w-8 h-8 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Sustainable Development Goals
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select the SDGs that align with your organization&apos;s work. Schools can filter
          partners by SDG focus areas to find the most relevant collaborations.
        </p>
      </div>

      <div className="space-y-8">

        {/* SDG Selection */}
        <div className="space-y-4" onClick={handleSDGSectionInteraction}>
          <div>
            <Label className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-600" />
              UN Sustainable Development Goals Focus *
            </Label>
            <p className="text-base text-gray-600 mb-4">
              Select the SDGs that align with your organization&apos;s work. Schools can filter 
              partners by SDG focus areas to find the most relevant collaborations.
            </p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {SDG_OPTIONS.map((sdg) => (
              <div
                key={sdg.id}
                className={`relative cursor-pointer transition-all hover:scale-105 ${
                  formData.sdgFocus?.includes(sdg.id) ? 'opacity-100' : 'opacity-70 hover:opacity-90'
                }`}
                onClick={() => toggleSDG(sdg.id)}
              >
                <SDGIcon
                  number={sdg.id}
                  size="lg"
                  showTitle={true}
                  className={`w-full h-full object-cover rounded-lg transition-all ${
                    formData.sdgFocus?.includes(sdg.id)
                      ? 'ring-4 ring-purple-500 shadow-lg'
                      : 'hover:shadow-md'
                  }`}
                />
              </div>
            ))}
          </div>

          {errors.sdgFocus && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.sdgFocus}</p>
            </div>
          )}

          {getSelectedSDGs().length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-4 h-4 text-green-600" />
                <p className="font-medium text-green-800">
                  Selected SDGs ({getSelectedSDGs().length})
                </p>
              </div>
              <p className="text-sm text-green-700">
                {getSelectedSDGs().map(sdg => sdg!.title).join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <span className="text-blue-600 text-2xl">🎯</span>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Enhanced School Matching</h4>
            <p className="text-blue-800 leading-relaxed">
              Schools can search and filter partners by SDG focus areas. A clear mission statement 
              combined with relevant SDG selection helps schools understand how collaborating with 
              your organization benefits their students and aligns with their educational goals.
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