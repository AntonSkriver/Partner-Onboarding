"use client"

import { Button } from "@/components/ui/button"
import { usePartnerOnboarding, getOrganizationTypeLabel } from "../../../contexts/partner-onboarding-context"
import { CheckCircle, ArrowRight, Users, Target, BarChart3, Sparkles } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

interface PartnerFinalScreenProps {
  onNext?: () => void
  onPrevious: () => void
  onGoToStep: (step: number) => void
}

export function PartnerFinalScreen({ onPrevious }: PartnerFinalScreenProps) {
  const { formData, resetForm } = usePartnerOnboarding()

  useEffect(() => {
    // Simple celebration effect without external dependencies
    console.log('🎉 Partner onboarding completed successfully!')
  }, [])

  const handleComplete = () => {
    // In a real app, this would submit the form data to the backend
    console.log('Partner onboarding completed:', formData)
    // Optional: Reset form data after successful completion
    // resetForm()
  }

  return (
    <div className="text-center space-y-8 max-w-3xl mx-auto">
      {/* Success Icon and Animation */}
      <div className="relative">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
          <CheckCircle className="w-12 h-12 text-green-600" />
          <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
        </div>
        <div className="absolute -top-2 -right-2 text-2xl animate-bounce">🎉</div>
        <div className="absolute -top-1 -left-3 text-xl animate-bounce delay-100">✨</div>
        <div className="absolute -bottom-1 right-0 text-lg animate-bounce delay-200">🌟</div>
      </div>
      
      {/* Welcome Message */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Class2Class!
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          Your {getOrganizationTypeLabel(formData.organizationType).toLowerCase()} profile for
        </p>
        <p className="text-2xl font-bold text-purple-600 mb-6">
          {formData.organizationName}
        </p>
        <p className="text-lg text-gray-600">
          is now ready to connect with schools worldwide! 🌍
        </p>
      </div>

      {/* Achievement Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-purple-900 mb-1">Profile Created</h3>
          <p className="text-sm text-purple-700">
            Complete partner profile with mission and SDG focus
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-blue-900 mb-1">SDGs Selected</h3>
          <p className="text-sm text-blue-700">
            {formData.sdgFocus.length} Sustainable Development Goals identified
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-green-900 mb-1">Ready to Connect</h3>
          <p className="text-sm text-green-700">
            Contact details verified for school partnerships
          </p>
        </div>
      </div>

      {/* What's Next Section */}
      <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl p-8 border border-purple-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">What&apos;s next for your organization?</h2>
        
        <div className="grid md:grid-cols-2 gap-6 text-left">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mt-0.5">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Connect with Schools</h4>
                <p className="text-sm text-gray-600">
                  Browse schools by country, SDG focus, and educational programs. 
                  Start meaningful collaborations that create global impact.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Launch SDG Projects</h4>
                <p className="text-sm text-gray-600">
                  Create educational projects aligned with your selected SDGs. 
                  Schools can discover and join your initiatives.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mt-0.5">
                <BarChart3 className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Track Global Impact</h4>
                <p className="text-sm text-gray-600">
                  Monitor engagement across countries and measure educational 
                  outcomes from your partnerships.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mt-0.5">
                <Sparkles className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Share Resources</h4>
                <p className="text-sm text-gray-600">
                  Upload educational materials, toolkits, and resources 
                  for schools to use in their programs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Buttons */}
      <div className="space-y-4">
        <Link href="/partner/profile">
          <Button
            size="lg"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 text-lg rounded-xl"
            onClick={handleComplete}
          >
            Go to Partner Profile
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>

      {/* Support Information */}
      <div className="pt-8 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-2">
          Questions about getting started?
        </p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <a 
            href="mailto:support@class2class.org" 
            className="text-purple-600 hover:underline flex items-center gap-1"
          >
            Email Support
          </a>
          <span className="text-gray-300">•</span>
          <a 
            href="/help" 
            className="text-purple-600 hover:underline"
          >
            Help Center
          </a>
          <span className="text-gray-300">•</span>
          <a 
            href="/resources" 
            className="text-purple-600 hover:underline"
          >
            Partner Resources
          </a>
        </div>
      </div>
    </div>
  )
}