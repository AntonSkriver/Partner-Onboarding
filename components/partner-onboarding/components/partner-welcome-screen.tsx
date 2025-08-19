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
            className="absolute h-1 bg-purple-200/30 transform -rotate-45"
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
        <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-purple-100/50 backdrop-blur-sm flex items-center justify-center border border-purple-200/30">
          <Building2 className="w-16 h-16 text-purple-600" />
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
          <span className="text-2xl font-bold text-gray-800">Class2Class</span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Welcome to our Partner Community!
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join our global network of educational organizations creating meaningful 
          collaborations with schools worldwide through UN SDG-aligned projects.
        </p>

        <div className="space-y-4 mb-12">
          <Button 
            onClick={onNext}
            size="lg" 
            className="bg-purple-600 text-white hover:bg-purple-700 px-8 py-4 text-lg font-semibold rounded-xl"
          >
            Start Partner Registration
          </Button>
          
          <div className="text-sm text-gray-500">
            Takes about 5-7 minutes to complete
          </div>
        </div>

        {/* Features preview */}
        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-purple-200/30">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-3">Create SDG Projects</h3>
            <p className="text-sm text-gray-600">
              Design and launch educational projects aligned with UN Sustainable Development Goals 
              and connect with schools that share your mission.
            </p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-purple-200/30">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-3">Connect with Schools</h3>
            <p className="text-sm text-gray-600">
              Build a network of schools worldwide that align with your organizational goals 
              and educational initiatives.
            </p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-purple-200/30">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-3">Track Global Impact</h3>
            <p className="text-sm text-gray-600">
              Monitor engagement across countries, measure educational outcomes, 
              and demonstrate your organization&apos;s worldwide reach.
            </p>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Trusted by organizations worldwide
          </p>
          <div className="flex items-center justify-center gap-8 opacity-70">
            <img 
              src="https://logo.clearbit.com/unesco.org" 
              alt="UNESCO"
              className="h-8 w-auto grayscale hover:grayscale-0 transition-all"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIGZpbGw9IiMwMDY5QUEiLz48dGV4dCB4PSI1MCIgeT0iMjIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiPiBVTkVTQ088L3RleHQ+PC9zdmc+';
              }}
            />
            <img 
              src="https://logo.clearbit.com/unicef.org" 
              alt="UNICEF"
              className="h-8 w-auto grayscale hover:grayscale-0 transition-all"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIGZpbGw9IiMxQ0Y4RkYiLz48dGV4dCB4PSI1MCIgeT0iMjIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiPiBVTklDRUY8L3RleHQ+PC9zdmc+';
              }}
            />
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/2/24/LEGO_logo.svg" 
              alt="LEGO Education"
              className="h-6 w-auto grayscale hover:grayscale-0 transition-all"
            />
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" 
              alt="Microsoft Education"
              className="h-6 w-auto grayscale hover:grayscale-0 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  )
}