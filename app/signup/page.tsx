'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Building2, ArrowRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DFCFFF] via-white to-[#DFCFFF] flex items-center justify-center p-4">
      {/* Header Logo */}
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-3">
          <Image 
            src="/isotipo.png" 
            alt="Class2Class Logo" 
            width={32} 
            height={32}
            className="w-8 h-8"
          />
          <span className="text-lg font-semibold text-gray-900">Class2Class</span>
        </Link>
      </div>

      <div className="max-w-4xl w-full">
        {/* Main Content */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Join Class2Class
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose how you'd like to participate in our global education platform
          </p>
        </div>

        {/* Signup Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-8">
          {/* School Card */}
          <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-[#7F56D9] cursor-pointer group">
            <Link href="/school/onboarding">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-10 h-10 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Sign up as School
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Join collaborative projects, connect your classrooms with schools worldwide, and participate in global learning experiences.
                </p>
                <div className="space-y-2 text-sm text-gray-500 mb-6">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>Access to global projects</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>Connect with partner schools</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>Educational resources & support</span>
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white group-hover:bg-blue-700 text-lg font-semibold py-3">
                  Get Started as School
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </CardContent>
            </Link>
          </Card>

          {/* Organization Card */}
          <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-[#7F56D9] cursor-pointer group">
            <Link href="/partner/onboarding">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="w-10 h-10 text-purple-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Sign up as Organization
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Create educational programs, partner with schools globally, and drive impact through collaborative learning initiatives.
                </p>
                <div className="space-y-2 text-sm text-gray-500 mb-6">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    <span>Create & manage programs</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    <span>Partner with multiple schools</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    <span>Track impact & outcomes</span>
                  </div>
                </div>
                <Button className="w-full bg-[#7F56D9] hover:bg-purple-700 text-white group-hover:bg-purple-700 text-lg font-semibold py-3">
                  Get Started as Organization
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Secondary Options */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">Not ready to sign up? Explore what we offer</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/projects">
              <Button className="bg-[#7F56D9] hover:bg-purple-700 text-white font-semibold">
                Browse Projects
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" className="border-[#7F56D9] text-[#7F56D9] hover:bg-purple-50">
                Already have an account? Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link href="/">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}