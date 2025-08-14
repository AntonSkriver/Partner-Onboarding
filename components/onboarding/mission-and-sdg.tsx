'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { usePartnerForm } from '@/contexts/partner-form-context'
import { Target, Globe } from 'lucide-react'
import { useState } from 'react'

interface MissionAndSdgProps {
  onNext: () => void
  onPrevious: () => void
}

const SDG_OPTIONS = [
  { id: 1, title: 'No Poverty', color: 'bg-red-600' },
  { id: 2, title: 'Zero Hunger', color: 'bg-yellow-500' },
  { id: 3, title: 'Good Health and Well-being', color: 'bg-green-500' },
  { id: 4, title: 'Quality Education', color: 'bg-red-500' },
  { id: 5, title: 'Gender Equality', color: 'bg-orange-500' },
  { id: 6, title: 'Clean Water and Sanitation', color: 'bg-blue-400' },
  { id: 7, title: 'Affordable and Clean Energy', color: 'bg-yellow-400' },
  { id: 8, title: 'Decent Work and Economic Growth', color: 'bg-purple-600' },
  { id: 9, title: 'Industry, Innovation and Infrastructure', color: 'bg-orange-600' },
  { id: 10, title: 'Reduced Inequalities', color: 'bg-pink-500' },
  { id: 11, title: 'Sustainable Cities and Communities', color: 'bg-yellow-600' },
  { id: 12, title: 'Responsible Consumption and Production', color: 'bg-green-600' },
  { id: 13, title: 'Climate Action', color: 'bg-green-700' },
  { id: 14, title: 'Life Below Water', color: 'bg-blue-500' },
  { id: 15, title: 'Life on Land', color: 'bg-green-800' },
  { id: 16, title: 'Peace, Justice and Strong Institutions', color: 'bg-blue-700' },
  { id: 17, title: 'Partnerships for the Goals', color: 'bg-blue-900' }
]

export function MissionAndSdg({ onNext, onPrevious }: MissionAndSdgProps) {
  const { formData, updateFormData } = usePartnerForm()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateAndProceed = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.missionStatement?.trim()) {
      newErrors.missionStatement = 'Mission statement is required'
    } else if (formData.missionStatement.trim().length < 50) {
      newErrors.missionStatement = 'Mission statement should be at least 50 characters'
    }

    if (!formData.sdgFocus || formData.sdgFocus.length === 0) {
      newErrors.sdgFocus = 'Please select at least one SDG that aligns with your work'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      onNext()
    }
  }

  const handleMissionChange = (value: string) => {
    updateFormData({ missionStatement: value })
    if (errors.missionStatement) {
      setErrors(prev => ({ ...prev, missionStatement: '' }))
    }
  }

  const toggleSDG = (sdgId: number) => {
    const currentSDGs = formData.sdgFocus || []
    const updatedSDGs = currentSDGs.includes(sdgId)
      ? currentSDGs.filter(id => id !== sdgId)
      : [...currentSDGs, sdgId]
    
    updateFormData({ sdgFocus: updatedSDGs })
    if (errors.sdgFocus) {
      setErrors(prev => ({ ...prev, sdgFocus: '' }))
    }
  }

  const getSDGTitle = (sdgId: number) => {
    return SDG_OPTIONS.find(sdg => sdg.id === sdgId)?.title || `SDG ${sdgId}`
  }

  return (
    <div className="space-y-6 pt-16 sm:pt-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Share your mission and focus areas</h2>
        <p className="text-gray-600">
          Help schools understand your organization&apos;s purpose and the UN Sustainable Development Goals you work towards.
        </p>
      </div>

      <div className="space-y-6">
        {/* Mission Statement */}
        <div className="space-y-2">
          <Label htmlFor="missionStatement" className="text-base font-medium text-gray-900">
            Mission Statement *
          </Label>
          <Textarea
            id="missionStatement"
            placeholder="Describe your organization's mission and how you support educational initiatives. What impact do you aim to create?"
            value={formData.missionStatement || ''}
            onChange={(e) => handleMissionChange(e.target.value)}
            className={`text-base min-h-24 ${errors.missionStatement ? 'border-red-500' : ''}`}
            rows={4}
          />
          {errors.missionStatement && (
            <p className="text-sm text-red-600">{errors.missionStatement}</p>
          )}
          <p className="text-sm text-gray-500">
            {formData.missionStatement?.length || 0}/500 characters • Schools will see this on your profile
          </p>
        </div>

        {/* SDG Selection */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              UN Sustainable Development Goals Focus *
            </Label>
            <p className="text-sm text-gray-600 mb-3">
              Select the SDGs that align with your organization&apos;s work. Schools can filter partners by SDG focus.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SDG_OPTIONS.map((sdg) => (
              <div
                key={sdg.id}
                className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-sm ${
                  formData.sdgFocus?.includes(sdg.id)
                    ? 'border-purple-500 bg-purple-50 shadow-sm'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
                onClick={() => toggleSDG(sdg.id)}
              >
                <div className={`w-8 h-8 rounded ${sdg.color} flex items-center justify-center text-white text-xs font-bold mr-3`}>
                  {sdg.id}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{sdg.title}</p>
                </div>
                <div className={`w-4 h-4 rounded border-2 transition-all ${
                  formData.sdgFocus?.includes(sdg.id)
                    ? 'border-purple-500 bg-purple-500'
                    : 'border-gray-300'
                }`}>
                  {formData.sdgFocus?.includes(sdg.id) && (
                    <div className="w-full h-full rounded bg-white scale-50" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {errors.sdgFocus && (
            <p className="text-sm text-red-600">{errors.sdgFocus}</p>
          )}

          {formData.sdgFocus && formData.sdgFocus.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800 mb-1">
                <strong>Selected SDGs ({formData.sdgFocus.length}):</strong>
              </p>
              <p className="text-sm text-green-700">
                {formData.sdgFocus.map(id => getSDGTitle(id)).join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Information box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-blue-600 text-lg">🎯</span>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Matching with Schools</h4>
            <p className="text-sm text-blue-800">
              Schools can search and filter partners by SDG focus areas. A clear mission statement 
              helps schools understand how collaborating with your organization benefits their students.
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