'use client'

import { useState } from 'react'
import { ProgressBar } from './progress-bar'
import { PartnerTypeSelection } from './partner-type-selection'
import { OrganizationDetails } from './organization-details'
import { MissionAndSdg } from './mission-and-sdg'
import { ContactInformation } from './contact-information'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowLeft } from 'lucide-react'
import { usePartnerForm } from '@/contexts/partner-form-context'
import Link from 'next/link'

const STEP_NAMES = [
  'Type',
  'Details',
  'Mission',
  'Contact',
  'Complete'
]

export function PartnerOnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0)
  const { formData, resetForm } = usePartnerForm()
  const totalSteps = STEP_NAMES.length

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (step: number) => {
    // Allow navigation to completed steps only
    if (step <= currentStep || step < totalSteps - 1) {
      setCurrentStep(step)
    }
  }

  const handleComplete = () => {
    // In a real app, this would submit the form data to the backend
    console.log('Partner onboarding completed:', formData)
    // Redirect to partner dashboard or success page
  }

  const CompletionScreen = () => (
    <div className="text-center space-y-6 pt-16 sm:pt-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Class2Class!
        </h2>
        <p className="text-xl text-gray-600 mb-6">
          Your partner profile for <span className="font-semibold text-purple-600">{formData.organizationName}</span> is now set up.
        </p>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What&apos;s next?</h3>
        <div className="space-y-3 text-left">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
            <span className="text-gray-700">Browse and connect with schools worldwide</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
            <span className="text-gray-700">Create and share educational projects</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
            <span className="text-gray-700">Track collaboration outcomes and impact</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Link href="/partner/dashboard">
          <Button 
            size="lg" 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4"
            onClick={handleComplete}
          >
            Go to Partner Dashboard
          </Button>
        </Link>
        
        <Link href="/connect">
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            Start Connecting with Schools
          </Button>
        </Link>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Questions? Contact our support team at{' '}
          <a href="mailto:support@class2class.org" className="text-purple-600 hover:underline">
            support@class2class.org
          </a>
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/partner/dashboard" className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Partner Registration</h1>
        </div>

        {/* Progress Bar */}
        {currentStep < totalSteps - 1 && (
          <div className="mb-8">
            <ProgressBar
              currentStep={currentStep}
              totalSteps={totalSteps - 1} // Don't count completion step
              stepNames={STEP_NAMES.slice(0, -1)} // Don't show completion step
              onGoToStep={goToStep}
            />
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          {/* Step Content */}
          {currentStep === 0 && (
            <PartnerTypeSelection onNext={nextStep} onPrevious={previousStep} />
          )}
          
          {currentStep === 1 && (
            <OrganizationDetails onNext={nextStep} onPrevious={previousStep} />
          )}
          
          {currentStep === 2 && (
            <MissionAndSdg onNext={nextStep} onPrevious={previousStep} />
          )}
          
          {currentStep === 3 && (
            <ContactInformation onNext={nextStep} onPrevious={previousStep} />
          )}
          
          {currentStep === 4 && <CompletionScreen />}
        </div>

        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h4 className="font-semibold mb-2">Debug Info:</h4>
            <pre className="text-xs text-gray-600 overflow-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetForm}
              className="mt-2"
            >
              Reset Form
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}