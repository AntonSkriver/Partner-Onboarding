'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useSchoolForm } from '@/contexts/school-form-context'
import { Heart, ArrowLeft } from 'lucide-react'

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
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-pink-100 rounded-full flex items-center justify-center">
          <Heart className="w-8 h-8 text-pink-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Areas of Interest</h1>
          <p className="text-gray-600 mt-2">
            What subjects and collaboration types interest your school most?
          </p>
        </div>
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
                <FormLabel className="text-lg font-medium">Subject Areas</FormLabel>
                <div className="grid grid-cols-2 gap-3">
                  {subjectAreas.map((subject) => (
                    <FormField
                      key={subject}
                      control={form.control}
                      name="subjectAreas"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={subject}
                            className="flex flex-row items-start space-x-2 space-y-0 p-3 border rounded-lg hover:bg-gray-50"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(subject)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, subject])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== subject
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal leading-tight">
                              {subject}
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

          {/* Collaboration Types */}
          <FormField
            control={form.control}
            name="collaborationInterests"
            render={() => (
              <FormItem>
                <FormLabel className="text-lg font-medium">Collaboration Interests</FormLabel>
                <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                  {collaborationTypes.map((collaboration) => (
                    <FormField
                      key={collaboration}
                      control={form.control}
                      name="collaborationInterests"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={collaboration}
                            className="flex flex-row items-start space-x-2 space-y-0 p-3 border rounded-lg hover:bg-gray-50"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(collaboration)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, collaboration])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== collaboration
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal leading-tight">
                              {collaboration}
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
              className="bg-pink-600 hover:bg-pink-700"
            >
              {isLoading ? 'Processing...' : 'Continue'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}