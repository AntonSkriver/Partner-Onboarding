'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSchoolForm } from '@/contexts/school-form-context'
import { 
  CheckCircle, 
  School, 
  MapPin, 
  Users, 
  Globe, 
  Heart, 
  Target,
  ArrowRight,
  ExternalLink
} from 'lucide-react'

interface SchoolCompletionStepProps {
  onNext?: () => void
  onPrevious?: () => void
  onGoToStep?: (step: number) => void
}


export function SchoolCompletionStep({ }: SchoolCompletionStepProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { formData, resetForm } = useSchoolForm()
  const router = useRouter()

  const handleGoToDashboard = async () => {
    setIsLoading(true)
    try {
      // Simulate saving the profile
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Reset the form
      resetForm()
      
      // Navigate to school dashboard
      router.push('/school/dashboard')
    } catch (error) {
      console.error('Error completing onboarding:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-10 px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Class2Class!
            </h1>
            <p className="text-xl text-gray-600">
              Your school profile has been created successfully
            </p>
          </div>
        </div>

        {/* Profile Summary */}
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <School className="h-5 w-5" />
              {formData.schoolName || 'Your School'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {formData.schoolType && (
                  <Badge variant="secondary" className="capitalize">
                    {formData.schoolType} School
                  </Badge>
                )}
                
                {(formData.country || formData.city) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {formData.city && formData.country 
                        ? `${formData.city}, ${formData.country}`
                        : formData.country || formData.city}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {formData.studentCount && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{formData.studentCount} students</span>
                  </div>
                )}
                
                {formData.teacherCount && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{formData.teacherCount} teachers</span>
                  </div>
                )}
              </div>
            </div>

            {/* Languages */}
            {formData.languages && formData.languages.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Languages:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.languages.map((language, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Interests */}
            {formData.subjectAreas && formData.subjectAreas.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Subject Areas:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.subjectAreas.slice(0, 3).map((subject, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {subject}
                    </Badge>
                  ))}
                  {formData.subjectAreas.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{formData.subjectAreas.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 text-center">What happens next?</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="text-center p-4">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Browse Projects</h3>
              <p className="text-sm text-gray-600">
                Discover collaboration opportunities from partner organizations
              </p>
            </Card>

            <Card className="text-center p-4">
              <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Connect with Schools</h3>
              <p className="text-sm text-gray-600">
                Find other schools with similar interests for direct collaboration
              </p>
            </Card>

            <Card className="text-center p-4">
              <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <ExternalLink className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Access Resources</h3>
              <p className="text-sm text-gray-600">
                Use educational materials and tools from our partner network
              </p>
            </Card>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <Button
            onClick={handleGoToDashboard}
            disabled={isLoading}
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg font-medium"
          >
            {isLoading ? 'Setting up your dashboard...' : 'Go to Dashboard'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Need help? Contact our support team at support@class2class.org</p>
        </div>
    </div>
  )
}
