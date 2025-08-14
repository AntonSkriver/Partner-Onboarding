"use client"

import { Button } from "@/components/ui/button"
import { usePartnerOnboarding } from "../../../contexts/partner-onboarding-context"
import Image from "next/image"
import { Building2, Globe, Users, Target } from "lucide-react"

interface PartnerWelcomeScreenProps {
  onNext: () => void
  onPrevious: () => void
  onGoToStep: (step: number) => void
}

export function PartnerWelcomeScreen({ onNext }: PartnerWelcomeScreenProps) {
  const { formData } = usePartnerOnboarding()

  return (
    <div className="max-w-4xl mx-auto text-center">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-1 bg-white/10 transform -rotate-45"
            style={{
              width: `${Math.random() * 60 + 20}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Logo area */}
      <div className="relative mb-8">
        <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
          <Building2 className="w-16 h-16 text-white" />
        </div>
        
        {/* Class2Class logo */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <Image 
            src="/isotipo.png" 
            alt="Class2Class Logo" 
            width={40} 
            height={40}
            className="w-10 h-10"
          />
          <span className="text-2xl font-bold text-white">Class2Class</span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Welcome to our Partner Community!
        </h1>
        
        <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
          Join our global network of educational organizations creating meaningful 
          collaborations with schools worldwide through UN SDG-aligned projects.
        </p>

        <div className="space-y-4 mb-12">
          <Button 
            onClick={onNext}
            size="lg" 
            className="bg-white text-purple-900 hover:bg-purple-50 px-8 py-4 text-lg font-semibold rounded-xl"
          >
            Start Partner Registration
          </Button>
          
          <div className="text-sm text-purple-200">
            Takes about 5-7 minutes to complete
          </div>
        </div>

        {/* Features preview */}
        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-white mb-3">Create SDG Projects</h3>
            <p className="text-sm text-purple-200">
              Design and launch educational projects aligned with UN Sustainable Development Goals 
              and connect with schools that share your mission.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-white mb-3">Connect with Schools</h3>
            <p className="text-sm text-purple-200">
              Build a network of schools worldwide that align with your organizational goals 
              and educational initiatives.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-white mb-3">Track Global Impact</h3>
            <p className="text-sm text-purple-200">
              Monitor engagement across countries, measure educational outcomes, 
              and demonstrate your organization&apos;s worldwide reach.
            </p>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <p className="text-sm text-purple-200 mb-4">
            Trusted by organizations worldwide
          </p>
          <div className="flex items-center justify-center gap-8 opacity-60">
            <div className="text-xs text-white">UNESCO</div>
            <div className="text-xs text-white">UNICEF</div>
            <div className="text-xs text-white">LEGO Education</div>
            <div className="text-xs text-white">Microsoft Education</div>
          </div>
        </div>
      </div>
    </div>
  )
}