"use client"

import { Button } from "@/components/ui/button"
import { usePartnerForm } from '@/contexts/partner-form-context'
import Image from "next/image"

interface WelcomeScreenProps {
  onNext: () => void
  onPrevious: () => void
  onGoToStep: (step: number) => void
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  const { formData } = usePartnerForm()
  const organizationName = formData.organizationName || "your organization"

  return (
    <div className="welcome-card">
      {/* Purple Header with Decorative Lines */}
      <div className="welcome-header">
        {/* Decorative Lines */}
        <div className="absolute inset-0">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-1 bg-[#8157D9]/20 transform -rotate-45"
              style={{
                width: '40px',
                left: `${(i * 15) + 2}%`,
                top: `${(i * 10) + 2}%`,
              }}
            />
          ))}
        </div>
        
        {/* Organization Icon */}
        <div className="welcome-profile-photo">
          <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-16 h-16 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="welcome-content">
        <h1 className="welcome-title">
          Welcome to Class2Class!
        </h1>
        <p className="welcome-description">
          We're excited to help {organizationName} connect with schools and create meaningful educational partnerships. 
          Let's set up your organization profile to get started.
        </p>

        <div className="mt-6 space-y-4">
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">What we'll help you with:</h3>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Connect with schools that align with your mission</li>
              <li>• Showcase your SDG focus areas</li>
              <li>• Create collaborative educational projects</li>
              <li>• Track the impact of your partnerships</li>
            </ul>
          </div>
        </div>

        <Button
          onClick={onNext}
          className="welcome-button"
        >
          Get Started
        </Button>
      </div>
    </div>
  )
}

