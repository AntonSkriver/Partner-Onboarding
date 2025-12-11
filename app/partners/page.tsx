'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Target,
  Globe,
  BookOpen,
  ArrowRight,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { WorldMap } from '@/components/WorldMap'

const partnerTypes = [
  {
    type: "NGOs",
    icon: "🥇",
    description: "Organizations like UNICEF Denmark working on global citizenship and rights"
  },
  {
    type: "Government",
    icon: "🏛️",
    description: "Ministries of Education launching inclusion or development campaigns"
  },
  {
    type: "School Networks",
    icon: "🏫",
    description: "School districts or educational networks coordinating programs"
  },
  {
    type: "Corporate",
    icon: "🏢",
    description: "Companies with educational CSR initiatives and sustainability goals"
  },
  {
    type: "School",
    icon: "🎓",
    description: "Schools that want to invite their classes and create programs with other schools"
  }
]

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-[#E0CCFF] relative font-sans">

      {/* Header - Consistent with Landing Page */}
      <header className="relative z-20 w-full py-4 px-6 md:px-12 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-white/20">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/isotipo.png"
              alt="Class2Class Logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="text-xl font-semibold text-[#1a1a2e]">Class2Class</span>
          </Link>
        </div>

        {/* Navigation - Centered */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="#" className="text-gray-900 font-medium hover:text-gray-700">How it works</Link>
          <Link href="#" className="text-gray-900 font-medium hover:text-gray-700">Platform</Link>
          <Link href="#" className="text-gray-900 font-medium hover:text-gray-700">Explore Projects</Link>
          <Link href="#" className="text-gray-900 font-medium hover:text-gray-700">About us</Link>
          <div className="flex items-center cursor-pointer text-gray-900 font-medium hover:text-gray-700">
            Resources <ChevronDown className="ml-1 h-4 w-4" />
          </div>
        </nav>

        {/* User Profile / Right Nav */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/sign-in">
            <Button variant="outline" className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-purple-50">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-[#8B5CF6] hover:bg-[#7c4dff] text-white">
              Sign up
            </Button>
          </Link>
          <Link href="/partners">
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">Partners</Button>
          </Link>
        </div>

        {/* Mobile Menu Icon Placeholder */}
        <div className="md:hidden">
          <div className="space-y-1">
            <div className="w-6 h-0.5 bg-gray-900"></div>
            <div className="w-6 h-0.5 bg-gray-900"></div>
            <div className="w-6 h-0.5 bg-gray-900"></div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-6 pb-32 overflow-hidden">
        {/* Background Map */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/world-map.webp"
            alt="World Map Background"
            fill
            className="object-cover opacity-30 mix-blend-multiply"
            priority
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-4xl mx-auto">

            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-[#1a1a2e] leading-tight">
              Empowering Global <br />
              <span className="text-[#1a1a2e]">Educational Partnerships</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join Class2Class as a partner organization and connect with schools worldwide to create meaningful
              collaborative learning experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/partner/onboarding">
                <Button size="lg" className="bg-[#7F56D9] hover:bg-[#6941C6] px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-purple-200 transition-all hover:scale-105">
                  Join as Organization
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/discover">
                <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-white hover:text-[#7F56D9] px-8 py-4 text-lg font-semibold bg-white/50 backdrop-blur-sm">
                  Browse Projects
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Three Feature Cards */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Global Network */}
            <Card className="text-center hover:shadow-xl transition-all duration-300 border-gray-100 shadow-sm group bg-white">
              <CardHeader className="pt-8">
                <div className="w-16 h-16 bg-[#F4EBFF] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="h-8 w-8 text-[#7F56D9]" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Global Network</CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
                <p className="text-gray-600 leading-relaxed text-lg">
                  Connect with schools and students globally to create impactful collaborative projects.
                </p>
              </CardContent>
            </Card>

            {/* SDG Alignment */}
            <Card className="text-center hover:shadow-xl transition-all duration-300 border-gray-100 shadow-sm group bg-white">
              <CardHeader className="pt-8">
                <div className="w-16 h-16 bg-[#F4EBFF] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-8 w-8 text-[#7F56D9]" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">SDG Alignment</CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
                <p className="text-gray-600 leading-relaxed text-lg">
                  Align projects with UN Sustainable Development Goals and track your impact.
                </p>
              </CardContent>
            </Card>

            {/* Project Management */}
            <Card className="text-center hover:shadow-xl transition-all duration-300 border-gray-100 shadow-sm group bg-white">
              <CardHeader className="pt-8">
                <div className="w-16 h-16 bg-[#F4EBFF] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-8 w-8 text-[#7F56D9]" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Project Management</CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
                <p className="text-gray-600 leading-relaxed text-lg">
                  Create and manage educational projects with collaboration and tracking tools.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Who Can Become a Partner */}
      <section className="py-24 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <span className="text-[#7F56D9] font-semibold tracking-wide uppercase text-sm">Ecosystem</span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-2 mb-4">
              Who Can Become a Partner?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Diverse organizations contribute to our global learning network.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {partnerTypes.map((partner, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-3xl">
                  {partner.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{partner.type}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {partner.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-[#7F56D9] text-white py-24 relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3"></div>

        <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Make a Global Impact?
          </h2>
          <p className="text-xl mb-10 text-purple-100 max-w-2xl mx-auto">
            Join our community of partners who are transforming education through
            international collaboration and sustainable development.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/partner/onboarding">
              <Button size="lg" className="bg-white text-[#7F56D9] hover:bg-gray-50 px-8 py-4 text-lg font-bold rounded-xl shadow-lg">
                Begin Partner Registration
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-gray-900 py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/isotipo.png"
                  alt="Class2Class Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8 opacity-80"
                />
                <span className="text-lg font-semibold text-gray-700">Class2Class</span>
              </Link>
            </div>
            <div className="text-sm text-gray-500">
              © 2025 Class2Class. Connecting Classrooms for a Better World.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
