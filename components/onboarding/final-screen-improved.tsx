'use client'

import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight, Users, Globe, BookOpen } from 'lucide-react'
import { useRouter } from '@/i18n/navigation'

interface FinalScreenProps {
  onNext: () => void
  onPrevious: () => void
  onGoToStep: (step: number) => void
}

export function FinalScreen({ onNext, onPrevious, onGoToStep }: FinalScreenProps) {
  const router = useRouter()

  const handleGoToDashboard = () => {
    router.push('/partner/dashboard')
  }

  const handleStartConnecting = () => {
    router.push('/connect')
  }

  return (
    <div className="space-y-8 pt-16 sm:pt-6">
      {/* Success Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Class2Class!
        </h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Your organization profile has been successfully created. You're now ready to connect with schools and start making a difference.
        </p>
      </div>

      {/* Feature Preview */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What you can do now:</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Connect with Schools</h4>
              <p className="text-sm text-gray-600">Find and connect with schools that align with your mission and SDG focus areas.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Globe className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Manage Projects</h4>
              <p className="text-sm text-gray-600">Create and manage collaborative projects with your partner schools.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <BookOpen className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Track Impact</h4>
              <p className="text-sm text-gray-600">Monitor the impact of your collaborations and share success stories.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <Button
          onClick={handleGoToDashboard}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg"
        >
          Go to Partner Dashboard
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
        
        <Button
          onClick={handleStartConnecting}
          variant="outline"
          className="w-full py-3 text-lg"
        >
          Start Connecting with Schools
        </Button>
      </div>

      {/* Support Information */}
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600">
          Need help getting started? Contact our support team at{' '}
          <a href="mailto:support@class2class.org" className="text-purple-600 hover:text-purple-700 font-medium">
            support@class2class.org
          </a>
        </p>
      </div>
    </div>
  )
} 