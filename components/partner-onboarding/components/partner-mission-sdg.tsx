"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { usePartnerOnboarding, SDG_OPTIONS } from "../../../contexts/partner-onboarding-context"
import { Target, Globe, AlertCircle, Check } from "lucide-react"
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
      case 'missionStatement':
        const missionValue = value as string
        if (!missionValue.trim()) {
          newErrors.missionStatement = 'Mission statement is required'
        } else if (missionValue.trim().length < 50) {
          newErrors.missionStatement = 'Mission statement should be at least 50 characters'
        } else if (missionValue.trim().length > 500) {
          newErrors.missionStatement = 'Mission statement should be less than 500 characters'
        } else {
          delete newErrors.missionStatement
        }
        break
      
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

  const handleMissionChange = (value: string) => {
    updateFormData({ missionStatement: value })
    if (touched.missionStatement) {
      validateField('missionStatement', value)
    }
  }

  const handleMissionBlur = () => {
    setTouched(prev => ({ ...prev, missionStatement: true }))
    validateField('missionStatement', formData.missionStatement || '')
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
  const characterCount = formData.missionStatement?.length || 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Share your mission and focus areas
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Help schools understand your organization&apos;s purpose and the UN Sustainable 
          Development Goals you work towards. This helps with better project matching.
        </p>
      </div>

      <div className="space-y-8">
        {/* Mission Statement */}
        <div className="space-y-3">
          <Label htmlFor="missionStatement" className="text-lg font-semibold text-gray-900">
            Mission Statement *
          </Label>
          <Textarea
            id="missionStatement"
            placeholder="Describe your organization's mission and how you support educational initiatives. What impact do you aim to create? How do you work with schools and communities?"
            value={formData.missionStatement || ''}
            onChange={(e) => handleMissionChange(e.target.value)}
            onBlur={handleMissionBlur}
            className={`text-base min-h-32 resize-none ${
              errors.missionStatement ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'
            }`}
            rows={6}
          />
          {errors.missionStatement && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.missionStatement}</p>
            </div>
          )}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Schools will see this on your profile to understand your organization&apos;s goals
            </p>
            <span className={`text-sm ${
              characterCount < 50 ? 'text-gray-400' : 
              characterCount > 500 ? 'text-red-500' : 'text-green-600'
            }`}>
              {characterCount}/500 characters
            </span>
          </div>
        </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SDG_OPTIONS.map((sdg) => (
              <div
                key={sdg.id}
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  formData.sdgFocus?.includes(sdg.id)
                    ? 'border-purple-500 bg-purple-50 shadow-md scale-[1.02]'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                }`}
                onClick={() => toggleSDG(sdg.id)}
              >
                <div className="mr-4 flex-shrink-0">
                  <SDGIcon 
                    number={sdg.id} 
                    size="sm" 
                    showTitle={false}
                    className="w-10 h-10"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 mb-1">{sdg.title}</p>
                </div>
                <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                  formData.sdgFocus?.includes(sdg.id)
                    ? 'border-purple-500 bg-purple-500'
                    : 'border-gray-300'
                }`}>
                  {formData.sdgFocus?.includes(sdg.id) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
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