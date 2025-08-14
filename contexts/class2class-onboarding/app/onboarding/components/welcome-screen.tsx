"use client"

import { Button } from "@/components/ui/button"
import { useProfileForm } from "../context/profile-form-context"
import Image from "next/image"

interface WelcomeScreenProps {
  onNext: () => void
  onPrevious: () => void
  onGoToStep: (step: number) => void
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  const { formData } = useProfileForm()
  const firstName = formData.firstName || "Paola"

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
        
        {/* Profile Photo */}
        <div className="welcome-profile-photo">
          <Image
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop"
            alt="Profile photo"
            width={128}
            height={128}
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Content */}
      <div className="welcome-content">
        <h1 className="welcome-title">
          Welcome, {firstName}!
        </h1>
        <p className="welcome-description">
          We are very happy to have you as part of our community.
        </p>

        <Button
          onClick={onNext}
          className="welcome-button"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

