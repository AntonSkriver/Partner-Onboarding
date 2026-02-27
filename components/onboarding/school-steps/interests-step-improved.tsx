'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useSchoolForm } from '@/contexts/school-form-context'
import { useTranslations } from 'next-intl'

const interestsSchema = z.object({
  subjectAreas: z.array(z.string()).min(1, 'Please select at least one subject area'),
  collaborationInterests: z.array(z.string()).min(1, 'Please select at least one collaboration type'),
})

type InterestsData = z.infer<typeof interestsSchema>

interface InterestsStepProps {
  onNext: () => void
  onPrevious: () => void
}

const subjectAreas = [
  'Language Arts/Literature',
  'Mathematics',
  'Science',
  'Social Studies/History',
  'Foreign Languages',
  'Arts & Music',
  'Physical Education',
  'Computer Science/Technology',
  'Environmental Studies',
  'Cultural Studies',
  'Business/Economics',
  'Career Education'
]

const collaborationTypes = [
  'Virtual classroom exchanges',
  'Collaborative research projects',
  'Cultural exchange programs',
  'Environmental initiatives',
  'Peace and human rights education',
  'STEM collaboration',
  'Arts and creativity projects',
  'Language learning partnerships',
  'Community service projects',
  'Global citizenship education',
  'Sustainable development projects',
  'Sports and wellness programs'
]

export function InterestsStep({ onNext, onPrevious }: InterestsStepProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { formData, updateFormData } = useSchoolForm()
  const t = useTranslations('schoolOnboarding')

  const form = useForm<InterestsData>({
    resolver: zodResolver(interestsSchema),
    defaultValues: {
      subjectAreas: formData.subjectAreas || [],
      collaborationInterests: formData.collaborationInterests || [],
    },
  })

  const handleSubmit = async (data: InterestsData) => {
    setIsLoading(true)
    try {
      updateFormData(data)
      await new Promise(resolve => setTimeout(resolve, 300))
      onNext()
    } catch (error) {
      console.error('Error processing interests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-purple-600 mb-1">{t('interestsStepLabel')}</p>
        <h1 className="text-2xl font-bold text-gray-900">{t('interestsStepTitle')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('interestsStepSubtitle')}</p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Subject Areas */}
          <FormField
            control={form.control}
            name="subjectAreas"
            render={() => (
              <FormItem>
                <FormLabel className="text-base font-medium">{t('subjectAreasLabel')}</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  {subjectAreas.map((subject) => (
                    <FormField
                      key={subject}
                      control={form.control}
                      name="subjectAreas"
                      render={({ field }) => {
                        const isChecked = field.value?.includes(subject)
                        return (
                          <label
                            className={`flex flex-row items-start space-x-2 p-3 border rounded-xl cursor-pointer transition-colors ${isChecked ? 'border-purple-300 bg-purple-50' : 'hover:bg-gray-50'}`}
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                field.onChange(
                                  checked
                                    ? [...field.value, subject]
                                    : field.value?.filter((v: string) => v !== subject)
                                )
                              }}
                            />
                            <span className="text-sm font-normal leading-tight">
                              {subject}
                            </span>
                          </label>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Collaboration Types */}
          <FormField
            control={form.control}
            name="collaborationInterests"
            render={() => (
              <FormItem>
                <FormLabel className="text-base font-medium">{t('collaborationLabel')}</FormLabel>
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                  {collaborationTypes.map((collaboration) => (
                    <FormField
                      key={collaboration}
                      control={form.control}
                      name="collaborationInterests"
                      render={({ field }) => {
                        const isChecked = field.value?.includes(collaboration)
                        return (
                          <label
                            className={`flex flex-row items-start space-x-2 p-3 border rounded-xl cursor-pointer transition-colors ${isChecked ? 'border-purple-300 bg-purple-50' : 'hover:bg-gray-50'}`}
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                field.onChange(
                                  checked
                                    ? [...field.value, collaboration]
                                    : field.value?.filter((v: string) => v !== collaboration)
                                )
                              }}
                            />
                            <span className="text-sm font-normal leading-tight">
                              {collaboration}
                            </span>
                          </label>
                        )
                      }}
                    />
                  ))}
                </div>
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
              disabled={isLoading}
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
