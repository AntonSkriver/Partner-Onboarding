'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { OnboardingLayout } from '../onboarding-layout'
import { School, ArrowLeft, ArrowRight } from 'lucide-react'

const schoolNameSchema = z.object({
  schoolName: z.string().min(2, 'School name must be at least 2 characters'),
})

type SchoolNameData = z.infer<typeof schoolNameSchema>

interface SchoolNameStepProps {
  onNext: (data: SchoolNameData) => void
  onBack: () => void
  currentStep: number
  totalSteps: number
  initialData?: Partial<SchoolNameData>
}

export function SchoolNameStep({ onNext, onBack, currentStep, totalSteps, initialData }: SchoolNameStepProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SchoolNameData>({
    resolver: zodResolver(schoolNameSchema),
    defaultValues: {
      schoolName: initialData?.schoolName || '',
    },
  })

  const handleSubmit = async (data: SchoolNameData) => {
    setIsLoading(true)
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 500))
      onNext(data)
    } catch (error) {
      console.error('Error processing school name:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <OnboardingLayout
      title="Welcome to Class2Class"
      subtitle="Let's start by getting to know your school"
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className="max-w-2xl mx-auto">
        <Card className="border-blue-200">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <School className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">What's your school's name?</CardTitle>
            <CardDescription className="text-lg">
              Help us create your school profile and connect you with global learning opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="schoolName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-medium">School Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your school's full name"
                          className="text-lg p-3 h-12"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  )
}