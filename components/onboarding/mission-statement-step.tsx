'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { usePartnerForm } from '@/contexts/partner-form-context'
import { Target } from 'lucide-react'
import { useState } from 'react'

interface MissionStatementStepProps {
    onNext: () => void
    onPrevious: () => void
}

export function MissionStatementStep({ onNext, onPrevious }: MissionStatementStepProps) {
    const { formData, updateFormData } = usePartnerForm()
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validateAndProceed = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.missionStatement?.trim()) {
            newErrors.missionStatement = 'Mission statement is required'
        } else if (formData.missionStatement.trim().length < 50) {
            newErrors.missionStatement = 'Mission statement should be at least 50 characters'
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

    return (
        <div className="space-y-6 pt-16 sm:pt-6">
            <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Share your mission</h2>
                <p className="text-gray-600">
                    Help schools understand your organization&apos;s purpose.
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
            </div>

            {/* Information box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <span className="text-blue-600 text-lg">🎯</span>
                    <div>
                        <h4 className="font-medium text-blue-900 mb-1">Matching with Schools</h4>
                        <p className="text-sm text-blue-800">
                            A clear mission statement helps schools understand how collaborating with your organization benefits their students.
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
