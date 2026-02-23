'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const audiences = [
  { value: 'primary', label: 'Primary School (Ages 6-11)' },
  { value: 'secondary', label: 'Secondary School (Ages 12-18)' },
  { value: 'teachers', label: 'Teachers' },
  { value: 'parents', label: 'Parents/Families' },
]

interface TargetAudienceSectionProps {
  selectedAudiences: string[]
  onAudienceToggle: (audience: string) => void
}

export function TargetAudienceSection({
  selectedAudiences,
  onAudienceToggle,
}: TargetAudienceSectionProps) {
  const t = useTranslations('content')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('targetAudience')} *</CardTitle>
        <CardDescription>Who is this resource designed for?</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {audiences.map((audience) => (
            <div
              key={audience.value}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedAudiences.includes(audience.value)
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              }`}
              onClick={() => onAudienceToggle(audience.value)}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{audience.label}</span>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedAudiences.includes(audience.value)
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedAudiences.includes(audience.value) && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
