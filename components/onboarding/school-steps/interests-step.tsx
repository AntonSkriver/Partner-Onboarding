'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { OnboardingLayout } from '../onboarding-layout'
import { Heart, ArrowLeft, ArrowRight, X } from 'lucide-react'

interface InterestsStepProps {
  onNext: (interests: string[]) => void
  onBack: () => void
  currentStep: number
  totalSteps: number
  initialData?: { interests?: string[] }
}

const interestCategories = [
  {
    category: "Global Issues & Citizenship",
    interests: [
      "Human Rights",
      "Children's Rights",
      "Cultural Exchange",
      "Global Citizenship",
      "Peace Building",
      "Social Justice",
      "Diversity & Inclusion",
      "Democracy & Governance"
    ]
  },
  {
    category: "Environment & Sustainability",
    interests: [
      "Climate Change",
      "Environmental Protection",
      "Renewable Energy",
      "Biodiversity",
      "Sustainable Living",
      "Ocean Conservation",
      "Recycling & Waste",
      "Green Technology"
    ]
  },
  {
    category: "STEM & Innovation",
    interests: [
      "Science Experiments",
      "Technology Projects",
      "Engineering Challenges",
      "Mathematics",
      "Coding & Programming",
      "Robotics",
      "Space Exploration",
      "Innovation & Entrepreneurship"
    ]
  },
  {
    category: "Arts & Culture",
    interests: [
      "Visual Arts",
      "Music & Dance",
      "Literature & Writing",
      "Theater & Performance",
      "Traditional Crafts",
      "Cultural Heritage",
      "Photography",
      "Digital Media"
    ]
  },
  {
    category: "Health & Wellbeing",
    interests: [
      "Nutrition & Health",
      "Mental Wellbeing",
      "Physical Education",
      "Community Health",
      "First Aid & Safety",
      "Disease Prevention",
      "Healthy Lifestyles",
      "Sports & Games"
    ]
  },
  {
    category: "Languages & Communication",
    interests: [
      "Language Learning",
      "Cross-Cultural Communication",
      "Storytelling",
      "Public Speaking",
      "Creative Writing",
      "Translation Projects",
      "Media Literacy",
      "Digital Communication"
    ]
  }
]

export function InterestsStep({ onNext, onBack, currentStep, totalSteps, initialData }: InterestsStepProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialData?.interests || [])
  const [isLoading, setIsLoading] = useState(false)

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    )
  }

  const handleSubmit = async () => {
    if (selectedInterests.length === 0) return
    
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      onNext(selectedInterests)
    } catch (error) {
      console.error('Error processing interests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <OnboardingLayout
      title="Learning Interests"
      subtitle="What topics interest your school for global collaboration?"
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className="max-w-4xl mx-auto">
        <Card className="border-blue-200">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">What Are You Interested In?</CardTitle>
            <CardDescription className="text-lg">
              Select topics your school would like to explore through international collaborations. 
              This helps us match you with relevant projects and partners.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {interestCategories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    {category.category}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {category.interests.map((interest, interestIndex) => (
                      <div
                        key={interestIndex}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedInterests.includes(interest)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                        onClick={() => toggleInterest(interest)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{interest}</span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              selectedInterests.includes(interest)
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {selectedInterests.includes(interest) && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {selectedInterests.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-md font-semibold text-gray-900">
                    Selected Interests ({selectedInterests.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedInterests.map(interest => (
                      <Badge key={interest} variant="secondary" className="flex items-center gap-1 py-1 px-3">
                        {interest}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-red-600" 
                          onClick={() => toggleInterest(interest)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Flexible Matching</p>
                    <p className="text-sm text-blue-700">
                      Don't worry about choosing perfectly - you can always update your interests later, 
                      and we'll show you opportunities that match your selected topics.
                    </p>
                  </div>
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
                onClick={handleSubmit}
                disabled={isLoading || selectedInterests.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue ({selectedInterests.length} selected)
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  )
}