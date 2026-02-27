'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useSchoolForm } from '@/contexts/school-form-context'
import { useTranslations } from 'next-intl'

const schoolDetailsSchema = z.object({
  schoolType: z.enum(['public', 'private', 'international', 'charter', 'other']),
  country: z.string().min(2, 'Please select a country'),
  city: z.string().min(2, 'City is required'),
  studentCount: z.coerce.number().min(1, 'Student count must be at least 1'),
  teacherCount: z.coerce.number().min(1, 'Teacher count must be at least 1'),
  gradelevels: z.array(z.string()).min(1, 'Please select at least one grade level'),
  languages: z.array(z.string()).min(1, 'Please select at least one language'),
})

type SchoolDetailsData = z.infer<typeof schoolDetailsSchema>

interface SchoolDetailsStepProps {
  onNext: () => void
  onPrevious: () => void
}

const gradeLevels = [
  'Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade',
  '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'
]

const languageOptions = [
  'English', 'Spanish', 'French', 'German', 'Danish', 'Swedish', 'Norwegian', 'Dutch',
  'Portuguese', 'Italian', 'Chinese', 'Japanese', 'Arabic', 'Russian', 'Other'
]

const countries = [
  'Denmark', 'United States', 'United Kingdom', 'Germany', 'France', 'Spain', 'Netherlands',
  'Sweden', 'Norway', 'Canada', 'Australia', 'Brazil', 'Mexico', 'Other'
]

export function SchoolDetailsStep({ onNext, onPrevious }: SchoolDetailsStepProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { formData, updateFormData } = useSchoolForm()
  const t = useTranslations('schoolOnboarding')

  const schoolTypes = [
    { value: 'public', label: t('schoolType_public') },
    { value: 'private', label: t('schoolType_private') },
    { value: 'international', label: t('schoolType_international') },
    { value: 'charter', label: t('schoolType_charter') },
    { value: 'other', label: t('schoolType_other') },
  ]

  const form = useForm<SchoolDetailsData>({
    resolver: zodResolver(schoolDetailsSchema),
    defaultValues: {
      schoolType: formData.schoolType || undefined,
      country: formData.country || '',
      city: formData.city || '',
      studentCount: formData.studentCount ?? ('' as unknown as number),
      teacherCount: formData.teacherCount ?? ('' as unknown as number),
      gradelevels: formData.gradelevels || [],
      languages: formData.languages || [],
    },
  })

  const handleSubmit = async (data: SchoolDetailsData) => {
    setIsLoading(true)
    try {
      updateFormData(data)
      await new Promise(resolve => setTimeout(resolve, 300))
      onNext()
    } catch (error) {
      console.error('Error processing school details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-purple-600 mb-1">{t('detailsStepLabel')}</p>
        <h1 className="text-2xl font-bold text-gray-900">{t('detailsStepTitle')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('detailsStepSubtitle')}</p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* School Type */}
          <FormField
            control={form.control}
            name="schoolType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('schoolTypeLabel')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-14 text-base rounded-xl">
                      <SelectValue placeholder={t('schoolTypePlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {schoolTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('countryLabel')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-14 text-base rounded-xl">
                        <SelectValue placeholder={t('countryPlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('cityLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('cityPlaceholder')} {...field} className="h-14 text-base px-4 rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* School Size */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="studentCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('studentCountLabel')}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder={t('studentCountPlaceholder')} {...field} value={field.value ?? ''} className="h-14 text-base px-4 rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="teacherCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('teacherCountLabel')}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder={t('teacherCountPlaceholder')} {...field} value={field.value ?? ''} className="h-14 text-base px-4 rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Grade Levels */}
          <FormField
            control={form.control}
            name="gradelevels"
            render={() => (
              <FormItem>
                <FormLabel>{t('gradeLevelsLabel')} <span className="text-gray-400 font-normal">({t('gradeLevelsSubLabel')})</span></FormLabel>
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto rounded-xl border border-gray-200 p-3">
                  {gradeLevels.map((grade) => (
                    <FormField
                      key={grade}
                      control={form.control}
                      name="gradelevels"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={grade}
                            className="flex flex-row items-start space-x-2 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(grade)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, grade])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== grade
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {grade}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Languages */}
          <FormField
            control={form.control}
            name="languages"
            render={() => (
              <FormItem>
                <FormLabel>{t('languagesLabel')}</FormLabel>
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto rounded-xl border border-gray-200 p-3">
                  {languageOptions.map((language) => (
                    <FormField
                      key={language}
                      control={form.control}
                      name="languages"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={language}
                            className="flex flex-row items-start space-x-2 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(language)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, language])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== language
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {language}
                            </FormLabel>
                          </FormItem>
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
