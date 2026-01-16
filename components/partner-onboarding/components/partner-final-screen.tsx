"use client"

import { Button } from "@/components/ui/button"
import { usePartnerOnboarding, getOrganizationTypeLabel } from "../../../contexts/partner-onboarding-context"
import { CheckCircle, ArrowRight, Users, Target, BarChart3, Sparkles, Rocket, Globe2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface PartnerFinalScreenProps {
  onNext?: () => void
  onPrevious: () => void
  onGoToStep: (step: number) => void
}

export function PartnerFinalScreen({ onPrevious }: PartnerFinalScreenProps) {
  const { formData, resetForm } = usePartnerOnboarding()
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    setShowConfetti(true)
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const isSchool = formData.organizationType === 'school'
  const dashboardUrl = isSchool ? '/school/dashboard/home' : '/partner/profile'

  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('organizationType', formData.organizationType || '')
      localStorage.setItem('organizationName', formData.organizationName)
      if (isSchool) {
        localStorage.setItem('schoolData', JSON.stringify({
          numberOfStudents: formData.numberOfStudents,
          numberOfTeachers: formData.numberOfTeachers,
          gradeLevels: formData.gradeLevels,
          schoolType: formData.schoolType,
        }))
      }
    }
    console.log('Partner onboarding completed:', formData)
  }

  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-center text-center py-12">
      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: ['#8157D9', '#a78bfa', '#22c55e', '#eab308', '#3b82f6', '#ec4899'][Math.floor(Math.random() * 6)],
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#8157D9]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-300/10 rounded-full blur-3xl" />
      </div>

      {/* Success icon */}
      <div className="relative mb-8">
        <div className="relative w-28 h-28 mx-auto">
          {/* Outer ring animation */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#8157D9] to-[#a78bfa] animate-ping opacity-20" />

          {/* Inner circle */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#8157D9] to-[#a78bfa] flex items-center justify-center shadow-xl shadow-[#8157D9]/30">
            <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Floating emojis */}
        <div className="absolute -top-2 -right-4 text-3xl animate-bounce" style={{ animationDelay: '0.1s' }}>🎉</div>
        <div className="absolute -top-4 -left-2 text-2xl animate-bounce" style={{ animationDelay: '0.3s' }}>✨</div>
        <div className="absolute -bottom-2 -right-2 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>🌟</div>
      </div>

      {/* Content */}
      <div className="relative max-w-2xl mx-auto space-y-6 px-4">
        <div className="space-y-3">
          <p className="text-[#8157D9] font-semibold text-sm uppercase tracking-wider">
            Registration Complete
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Welcome to Class2Class!
          </h1>
        </div>

        <div className="space-y-2">
          <p className="text-gray-500 text-lg">
            Your {getOrganizationTypeLabel(formData.organizationType).toLowerCase()} profile for
          </p>
          <p className="text-2xl font-bold bg-gradient-to-r from-[#8157D9] to-[#a78bfa] bg-clip-text text-transparent">
            {formData.organizationName || 'Your Organization'}
          </p>
          <p className="text-gray-500 text-lg">
            is ready to connect with schools worldwide 🌍
          </p>
        </div>
      </div>

      {/* Achievement cards */}
      <div className="grid md:grid-cols-3 gap-4 mt-10 w-full max-w-3xl px-4">
        <div className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#8157D9]/20 transition-all duration-300">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#8157D9]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-[#8157D9]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-[#8157D9]" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Profile Created</h3>
            <p className="text-sm text-gray-500">
              Your complete partner profile with mission and SDG focus
            </p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#8157D9]/20 transition-all duration-300 md:-translate-y-2">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">SDGs Selected</h3>
            <p className="text-sm text-gray-500">
              {formData.sdgFocus.length} Sustainable Development Goals identified
            </p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#8157D9]/20 transition-all duration-300">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Globe2 className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Ready to Connect</h3>
            <p className="text-sm text-gray-500">
              Start building partnerships with schools globally
            </p>
          </div>
        </div>
      </div>

      {/* What's next section */}
      <div className="mt-10 w-full max-w-3xl px-4">
        <div className="bg-gradient-to-br from-gray-50 to-purple-50/50 rounded-2xl p-8 border border-purple-100/50">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-center gap-2">
            <Rocket className="w-5 h-5 text-[#8157D9]" />
            What&apos;s next?
          </h2>

          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#8157D9]/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-[#8157D9]" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Connect with Schools</h4>
                <p className="text-sm text-gray-500">
                  Browse schools by country, SDG focus, and start meaningful collaborations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Launch SDG Projects</h4>
                <p className="text-sm text-gray-500">
                  Create educational projects aligned with your selected SDGs.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Track Global Impact</h4>
                <p className="text-sm text-gray-500">
                  Monitor engagement and measure educational outcomes worldwide.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Share Resources</h4>
                <p className="text-sm text-gray-500">
                  Upload educational materials and toolkits for schools to use.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-10 px-4">
        <Link href={dashboardUrl}>
          <Button
            size="lg"
            className="group px-10 py-7 text-lg font-semibold rounded-full bg-[#8157D9] hover:bg-[#7048C6] text-white shadow-xl shadow-[#8157D9]/30 hover:shadow-2xl hover:shadow-[#8157D9]/40 transition-all duration-300 hover:scale-105"
            onClick={handleComplete}
          >
            <span className="flex items-center gap-2">
              {isSchool ? 'Go to School Dashboard' : 'Go to Partner Profile'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </Link>
      </div>

      {/* Support info */}
      <div className="mt-10 pt-8 border-t border-gray-100 w-full max-w-xl px-4">
        <p className="text-sm text-gray-400 mb-3">Questions about getting started?</p>
        <div className="flex items-center justify-center gap-6 text-sm">
          <a href="mailto:support@class2class.org" className="text-[#8157D9] hover:underline">
            Email Support
          </a>
          <span className="text-gray-200">•</span>
          <a href="/help" className="text-[#8157D9] hover:underline">
            Help Center
          </a>
          <span className="text-gray-200">•</span>
          <a href="/resources" className="text-[#8157D9] hover:underline">
            Resources
          </a>
        </div>
      </div>

      {/* Confetti animation styles */}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  )
}
