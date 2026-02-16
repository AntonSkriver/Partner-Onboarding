'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { OnboardingLayout } from '../onboarding-layout'
import { 
  CheckCircle, 
  School, 
  MapPin, 
  Users, 
  Mail, 
  UserCheck, 
  Heart, 
  Target,
  ArrowRight,
  Globe
} from 'lucide-react'

interface SchoolOnboardingData {
  schoolName?: string;
  schoolType?: string;
  country?: string;
  city?: string;
  studentCount?: string;
  ageGroup?: string[];
  contactName?: string;
  contactRole?: string;
  contactEmail?: string;
  phone?: string;
  interests?: string[];
  sdgFocus?: string[];
  languages?: string[];
}

interface SchoolCompletionStepProps {
  onboardingData: SchoolOnboardingData
  currentStep: number
  totalSteps: number
}

export function SchoolCompletionStep({ onboardingData, currentStep, totalSteps }: SchoolCompletionStepProps) {
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const router = useRouter()

  const handleCompleteRegistration = async () => {
    setIsCreatingAccount(true)
    try {
      // Simulate account creation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real app, this would create the school account and set up the session
      console.log('Creating school account with data:', onboardingData)
      
      // Create session data - schools that sign up independently become "school partners"
      const userData = {
        email: onboardingData.contactEmail,
        name: onboardingData.schoolName,
        role: 'school', // Schools maintain their role but get partner-like capabilities
        accountType: 'independent_school', // Flag to indicate independent signup
        partnerCapabilities: true, // Enable partner-like features
      }
      
      localStorage.setItem('user', JSON.stringify(userData))
      
      // Redirect to school dashboard
      router.push('/school/dashboard')
    } catch (error) {
      console.error('Error creating school account:', error)
    } finally {
      setIsCreatingAccount(false)
    }
  }

  if (isCreatingAccount) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Creating Your School Account</h2>
            <p className="text-gray-600">
              Setting up your school profile and connecting you to the global Class2Class network...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <OnboardingLayout
      title="Welcome to Class2Class!"
      subtitle="Your school profile is ready"
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Congratulations!</h1>
          <p className="text-xl text-gray-600">
            Your school is ready to join the global Class2Class community
          </p>
          <div className="mt-4">
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
              Independent School Partner
            </Badge>
            <p className="text-sm text-gray-600 mt-2">
              As an independent school, you have full partner capabilities to create and host collaborative projects
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* School Profile Summary */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5 text-blue-600" />
                School Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">School Name</p>
                <p className="text-lg font-semibold">{onboardingData.schoolName}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Type</p>
                  <p>{onboardingData.schoolType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Students</p>
                  <p>{onboardingData.studentCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{onboardingData.city}, {onboardingData.country}</span>
              </div>

              {onboardingData.ageGroup && onboardingData.ageGroup.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Age Groups</p>
                  <div className="flex flex-wrap gap-1">
                    {onboardingData.ageGroup.map((age, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {age}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {onboardingData.languages && onboardingData.languages.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Languages</p>
                  <div className="flex flex-wrap gap-1">
                    {onboardingData.languages.map((language, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Globe className="h-3 w-3 mr-1" />
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Contact Person</p>
                <p className="text-lg font-semibold">{onboardingData.contactName}</p>
                <p className="text-gray-600">{onboardingData.contactRole}</p>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{onboardingData.contactEmail}</span>
              </div>

              {onboardingData.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{onboardingData.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Interests and SDGs */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {onboardingData.interests && onboardingData.interests.length > 0 && (
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-blue-600" />
                  Learning Interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {onboardingData.interests.slice(0, 8).map((interest, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                  {onboardingData.interests.length > 8 && (
                    <Badge variant="outline" className="text-xs">
                      +{onboardingData.interests.length - 8} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {onboardingData.sdgFocus && onboardingData.sdgFocus.length > 0 && (
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  SDG Focus Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {onboardingData.sdgFocus.map((sdg, index) => (
                    <Badge key={index} className="bg-purple-100 text-purple-800 text-xs">
                      SDG {sdg}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Next Steps */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">What's Next?</CardTitle>
            <CardDescription className="text-green-700">
              Here's what you can do once your account is created:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-green-800">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Browse and join collaborative projects from partner organizations</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Create your own collaborative projects and invite other schools to join</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Connect with other schools worldwide for cultural exchanges</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Access educational resources and project templates</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Lead school-to-school partnerships and collaborative initiatives</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Track your participation and impact in global education goals (SDGs)</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="text-center pt-8">
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
            onClick={handleCompleteRegistration}
            disabled={isCreatingAccount}
          >
            Complete Registration & Go to Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  )
}