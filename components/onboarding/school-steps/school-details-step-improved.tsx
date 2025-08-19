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
import { MapPin, Users, ArrowLeft } from 'lucide-react'

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

const schoolTypes = [
  { value: 'public', label: 'Public School' },
  { value: 'private', label: 'Private School' },
  { value: 'international', label: 'International School' },
  { value: 'charter', label: 'Charter School' },
  { value: 'other', label: 'Other' },
]

const gradeLevels = [
  'Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade',
  '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'
]

const languages = [
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

  const form = useForm<SchoolDetailsData>({
    resolver: zodResolver(schoolDetailsSchema),
    defaultValues: {
      schoolType: formData.schoolType || undefined,
      country: formData.country || '',
      city: formData.city || '',
      studentCount: formData.studentCount || undefined,
      teacherCount: formData.teacherCount || undefined,
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
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
          <MapPin className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tell us about your school</h1>
          <p className="text-gray-600 mt-2">
            Help us understand your school's size and characteristics
          </p>
        </div>
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
                <FormLabel>School Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select school type" />
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
                  <FormLabel>Country</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
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
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Copenhagen" {...field} />
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
                  <FormLabel>Number of Students</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 450" {...field} />
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
                  <FormLabel>Number of Teachers</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 25" {...field} />
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
                <FormLabel>Grade Levels (Select all that apply)</FormLabel>
                <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
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
                <FormLabel>Languages Used in Teaching</FormLabel>
                <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                  {languages.map((language) => (
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
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Processing...' : 'Continue'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}