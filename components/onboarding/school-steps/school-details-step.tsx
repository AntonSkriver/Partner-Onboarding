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
import { Badge } from '@/components/ui/badge'
import { OnboardingLayout } from '../onboarding-layout'
import { Building, ArrowLeft, ArrowRight, X } from 'lucide-react'

const schoolDetailsSchema = z.object({
  schoolType: z.string().min(1, 'Please select a school type'),
  country: z.string().min(1, 'Please select a country'),
  city: z.string().min(2, 'City is required'),
  studentCount: z.string().min(1, 'Please select student count range'),
  ageGroup: z.array(z.string()).min(1, 'Please select at least one age group'),
  languages: z.array(z.string()).min(1, 'Please select at least one language'),
})

type SchoolDetailsData = z.infer<typeof schoolDetailsSchema>

interface SchoolDetailsStepProps {
  onNext: (data: SchoolDetailsData) => void
  onBack: () => void
  currentStep: number
  totalSteps: number
  initialData?: Partial<SchoolDetailsData>
}

const schoolTypes = [
  'Primary School',
  'Secondary School',
  'High School',
  'International School',
  'Private School',
  'Public School',
  'Vocational School',
  'Special Education School'
]

const countries = [
  'Denmark', 'Sweden', 'Norway', 'Germany', 'Netherlands', 'United Kingdom',
  'France', 'Spain', 'Italy', 'Poland', 'Finland', 'Belgium', 'Austria',
  'Switzerland', 'Portugal', 'Ireland', 'Czech Republic', 'Hungary',
  'Slovenia', 'Slovakia', 'Croatia', 'Estonia', 'Latvia', 'Lithuania',
  'United States', 'Canada', 'Australia', 'New Zealand', 'Japan', 'South Korea',
  'Singapore', 'Brazil', 'Mexico', 'Argentina', 'Chile', 'Colombia',
  'South Africa', 'Kenya', 'Nigeria', 'Ghana', 'Egypt', 'Morocco',
  'India', 'China', 'Thailand', 'Vietnam', 'Philippines', 'Indonesia', 'Other'
]

const studentCounts = [
  'Less than 100',
  '100-300',
  '300-500',
  '500-1000',
  '1000-2000',
  'More than 2000'
]

const ageGroups = [
  '3-5 years (Preschool)',
  '6-8 years (Early Primary)',
  '9-11 years (Primary)',
  '12-14 years (Middle School)',
  '15-17 years (High School)',
  '18+ years (Adult Education)'
]

const languages = [
  'English', 'Danish', 'Swedish', 'Norwegian', 'German', 'French', 'Spanish',
  'Italian', 'Dutch', 'Portuguese', 'Polish', 'Finnish', 'Arabic', 'Chinese',
  'Japanese', 'Korean', 'Hindi', 'Russian', 'Turkish'
]

export function SchoolDetailsStep({ onNext, onBack, currentStep, totalSteps, initialData }: SchoolDetailsStepProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>(initialData?.ageGroup || [])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(initialData?.languages || ['English'])

  const form = useForm<SchoolDetailsData>({
    resolver: zodResolver(schoolDetailsSchema),
    defaultValues: {
      schoolType: initialData?.schoolType || '',
      country: initialData?.country || '',
      city: initialData?.city || '',
      studentCount: initialData?.studentCount || '',
      ageGroup: initialData?.ageGroup || [],
      languages: initialData?.languages || ['English'],
    },
  })

  const toggleAgeGroup = (ageGroup: string) => {
    const newSelection = selectedAgeGroups.includes(ageGroup)
      ? selectedAgeGroups.filter(g => g !== ageGroup)
      : [...selectedAgeGroups, ageGroup]
    
    setSelectedAgeGroups(newSelection)
    form.setValue('ageGroup', newSelection)
  }

  const toggleLanguage = (language: string) => {
    const newSelection = selectedLanguages.includes(language)
      ? selectedLanguages.filter(l => l !== language)
      : [...selectedLanguages, language]
    
    if (newSelection.length > 0) {
      setSelectedLanguages(newSelection)
      form.setValue('languages', newSelection)
    }
  }

  const handleSubmit = async (data: SchoolDetailsData) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      onNext(data)
    } catch (error) {
      console.error('Error processing school details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <OnboardingLayout
      title="School Details"
      subtitle="Tell us more about your school"
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className="max-w-4xl mx-auto">
        <Card className="border-blue-200">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">School Information</CardTitle>
            <CardDescription className="text-lg">
              Help us understand your school context and educational focus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                              <SelectItem key={type} value={type}>
                                {type}
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
                          <SelectContent className="max-h-[200px]">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter city name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="studentCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Students</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select student count range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {studentCounts.map((count) => (
                              <SelectItem key={count} value={count}>
                                {count}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormLabel>Age Groups (Select all that apply)</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {ageGroups.map((ageGroup) => (
                      <div
                        key={ageGroup}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedAgeGroups.includes(ageGroup)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => toggleAgeGroup(ageGroup)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{ageGroup}</span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              selectedAgeGroups.includes(ageGroup)
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {selectedAgeGroups.includes(ageGroup) && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {form.formState.errors.ageGroup && (
                    <p className="text-sm text-red-600 mt-2">{form.formState.errors.ageGroup.message}</p>
                  )}
                </div>

                <div>
                  <FormLabel>Teaching Languages</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    {languages.map((language) => (
                      <div
                        key={language}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedLanguages.includes(language)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => toggleLanguage(language)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{language}</span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              selectedLanguages.includes(language)
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {selectedLanguages.includes(language) && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedLanguages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedLanguages.map(language => (
                        <Badge key={language} variant="secondary" className="flex items-center gap-1">
                          {language}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => toggleLanguage(language)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                  {form.formState.errors.languages && (
                    <p className="text-sm text-red-600 mt-2">{form.formState.errors.languages.message}</p>
                  )}
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
                    disabled={isLoading || selectedAgeGroups.length === 0 || selectedLanguages.length === 0}
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