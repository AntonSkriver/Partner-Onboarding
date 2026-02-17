'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useSchoolForm } from '@/contexts/school-form-context'
import { useTranslations } from 'next-intl'

const schoolNameSchema = z.object({
  schoolName: z.string().min(2, 'School name must be at least 2 characters'),
})

type SchoolNameData = z.infer<typeof schoolNameSchema>

interface SchoolNameStepProps {
  onNext: () => void
  onPrevious: () => void
}

export function SchoolNameStep({ onNext, onPrevious }: SchoolNameStepProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { formData, updateFormData } = useSchoolForm()
  const t = useTranslations('schoolOnboarding')

  const form = useForm<SchoolNameData>({
    resolver: zodResolver(schoolNameSchema),
    defaultValues: {
      schoolName: formData.schoolName || '',
    },
  })

  const handleSubmit = async (data: SchoolNameData) => {
    setIsLoading(true)
    try {
      updateFormData(data)
      await new Promise(resolve => setTimeout(resolve, 300))
      onNext()
    } catch (error) {
      console.error('Error processing school name:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-purple-600 mb-1">{t('nameStepLabel')}</p>
        <h1 className="text-2xl font-bold text-gray-900">{t('nameStepTitle')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('nameStepSubtitle')}</p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="schoolName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">{t('nameLabel')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('namePlaceholder')}
                    {...field}
                    className="h-14 text-base px-4 rounded-xl border-gray-200 focus:border-purple-600 focus:ring-purple-600/20"
                    autoFocus
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              className="flex-1 py-6 text-base border-gray-200 hover:bg-gray-50"
              size="lg"
            >
              {t('back')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !form.watch('schoolName')}
              className="flex-1 py-6 text-base bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
              size="lg"
            >
              {isLoading ? t('processing') : t('continue')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
