'use client'

import { Button } from '@/components/ui/button'
import { Building2, School } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface WelcomeScreenProps {
  userType: 'partner' | 'school'
  organizationName?: string
}

export function WelcomeScreen({ userType, organizationName }: WelcomeScreenProps) {
  const isPartner = userType === 'partner'
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
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
            {isPartner ? (
              <Building2 className="w-16 h-16 text-white" />
            ) : (
              <School className="w-16 h-16 text-white" />
            )}
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
            {isPartner ? (
              <>Welcome to our Partner Community!</>
            ) : (
              <>Welcome to Class2Class!</>
            )}
          </h1>
          
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            {isPartner ? (
              <>Join our global network of educational organizations creating meaningful collaborations with schools worldwide.</>
            ) : (
              <>Connect your school with partners and educators around the world to create amazing collaborative learning experiences.</>
            )}
          </p>

          {organizationName && (
            <p className="text-lg text-purple-200 mb-8">
              Setting up your profile for <span className="font-semibold text-white">{organizationName}</span>
            </p>
          )}

          <div className="space-y-4">
            <Link href={isPartner ? '/partner/onboarding' : '/school/onboarding'}>
              <Button 
                size="lg" 
                className="bg-white text-purple-900 hover:bg-purple-50 px-8 py-4 text-lg font-semibold rounded-xl"
              >
                {isPartner ? 'Start Partner Registration' : 'Start School Registration'}
              </Button>
            </Link>
            
            <div className="text-sm text-purple-200">
              Takes about 3-5 minutes to complete
            </div>
          </div>

          {/* Features preview */}
          <div className="mt-12 grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">
                {isPartner ? 'Create Projects' : 'Join Projects'}
              </h3>
              <p className="text-sm text-purple-200">
                {isPartner ? 
                  'Design and launch educational projects aligned with UN SDGs' :
                  'Participate in meaningful global education initiatives'
                }
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">
                {isPartner ? 'Connect with Schools' : 'Connect Globally'}
              </h3>
              <p className="text-sm text-purple-200">
                {isPartner ? 
                  'Build a network of schools aligned with your mission' :
                  'Connect with schools, teachers, and partners worldwide'
                }
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">
                {isPartner ? 'Track Impact' : 'Make Impact'}
              </h3>
              <p className="text-sm text-purple-200">
                {isPartner ? 
                  'Monitor engagement and measure educational outcomes' :
                  'Contribute to positive change through collaborative learning'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}