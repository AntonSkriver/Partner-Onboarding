'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useSchoolForm } from '@/contexts/school-form-context'
import { School, ArrowLeft } from 'lucide-react'

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
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <School className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">What's your school name?</h1>
          <p className="text-gray-600 mt-2">
            Let's start by getting to know your school
          </p>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="schoolName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">School Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Lincoln Elementary School"
                    {...field}
                    className="text-lg py-3"
                    autoFocus
                  />
                </FormControl>
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
              disabled={isLoading || !form.watch('schoolName')}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Processing...' : 'Continue'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}