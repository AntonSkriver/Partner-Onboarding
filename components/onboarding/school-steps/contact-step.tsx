'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OnboardingLayout } from '../onboarding-layout'
import { UserCheck, ArrowLeft, ArrowRight, Mail, Phone } from 'lucide-react'

const contactSchema = z.object({
  contactName: z.string().min(2, 'Contact name must be at least 2 characters'),
  contactRole: z.string().min(1, 'Please select a role'),
  contactEmail: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
})

type ContactData = z.infer<typeof contactSchema>

interface ContactStepProps {
  onNext: (data: ContactData) => void
  onBack: () => void
  currentStep: number
  totalSteps: number
  initialData?: Partial<ContactData>
}

const contactRoles = [
  'Principal',
  'Vice Principal',
  'Head Teacher',
  'International Coordinator',
  'Program Director',
  'Curriculum Coordinator',
  'Teacher',
  'Department Head',
  'School Administrator',
  'Other'
]

export function ContactStep({ onNext, onBack, currentStep, totalSteps, initialData }: ContactStepProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      contactName: initialData?.contactName || '',
      contactRole: initialData?.contactRole || '',
      contactEmail: initialData?.contactEmail || '',
      phone: initialData?.phone || '',
    },
  })

  const handleSubmit = async (data: ContactData) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      onNext(data)
    } catch (error) {
      console.error('Error processing contact information:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <OnboardingLayout
      title="Contact Information"
      subtitle="Who should we contact about Class2Class opportunities?"
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className="max-w-2xl mx-auto">
        <Card className="border-blue-200">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Main Contact Person</CardTitle>
            <CardDescription className="text-lg">
              This person will receive updates about collaboration opportunities and project invitations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter the contact person's full name"
                          className="text-lg p-3 h-12"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role/Position</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select role at school" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contactRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
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
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="contact@school.edu"
                          className="text-lg p-3 h-12"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+45 12 34 56 78"
                          className="text-lg p-3 h-12"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Privacy Note</p>
                      <p className="text-sm text-blue-700">
                        Your contact information will only be used for Class2Class communications and 
                        will not be shared with third parties without your consent.
                      </p>
                    </div>
                  </div>
                </div>
                
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