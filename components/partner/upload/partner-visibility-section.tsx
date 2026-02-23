'use client'

import { useTranslations } from 'next-intl'
import type { Control, UseFormSetValue } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField, FormItem, FormMessage } from '@/components/ui/form'
import { CheckCircle } from 'lucide-react'

interface TargetablePartner {
  id: string
  organizationName: string
}

interface PartnerVisibilitySectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>
  watchAvailabilityScope: string | undefined
  selectedTargetPartners: string[]
  targetablePartners: TargetablePartner[]
  onTargetPartnerToggle: (partnerId: string) => void
  onClearTargetPartners: () => void
}

export function PartnerVisibilitySection({
  control,
  setValue,
  watchAvailabilityScope,
  selectedTargetPartners,
  targetablePartners,
  onTargetPartnerToggle,
  onClearTargetPartners,
}: PartnerVisibilitySectionProps) {
  const t = useTranslations('content')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('partnerCatalogVisibility')} *</CardTitle>
        <CardDescription>
          Decide whether this parent resource is available to all partner organizations
          or only selected partners.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="availabilityScope"
          render={({ field }) => (
            <FormItem>
              <div className="space-y-3">
                <div
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    field.value === 'all_partners'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    field.onChange('all_partners')
                    onClearTargetPartners()
                    setValue('targetPartners', [])
                  }}
                >
                  <div className="font-medium text-gray-900">{t('allPartnerCatalogs')}</div>
                  <p className="text-sm text-gray-600 mt-1">
                    Every partner organization can access this resource.
                  </p>
                </div>

                <div
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    field.value === 'specific_partners'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                  onClick={() => field.onChange('specific_partners')}
                >
                  <div className="font-medium text-gray-900">{t('specificPartnerCatalogs')}</div>
                  <p className="text-sm text-gray-600 mt-1">
                    Limit visibility to selected partner organizations.
                  </p>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchAvailabilityScope === 'specific_partners' && (
          <div className="space-y-3 pt-2">
            <label className="text-sm font-medium text-gray-700">Select Partner Organizations *</label>
            {targetablePartners.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {targetablePartners.map((partner) => (
                  <div
                    key={partner.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTargetPartners.includes(partner.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                    }`}
                    onClick={() => onTargetPartnerToggle(partner.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900">
                        {partner.organizationName}
                      </div>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ml-3 flex-shrink-0 ${
                          selectedTargetPartners.includes(partner.id)
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedTargetPartners.includes(partner.id) && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No partner organizations available.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
