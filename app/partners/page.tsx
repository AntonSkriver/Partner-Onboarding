'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Target, 
  Globe,
  BookOpen,
  ArrowRight,
  LogIn,
  UserPlus
} from 'lucide-react'
import Link from 'next/link'
import { LanguageSwitcher } from '@/components/language-switcher'
import Image from 'next/image'

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <Image 
                  src="/isotipo.png" 
                  alt="Class2Class Logo" 
                  width={40} 
                  height={40}
                  className="w-10 h-10"
                />
                <span className="text-xl font-semibold text-gray-900">Class2Class</span>
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">Home</Link>
              <Link href="/discover" className="text-gray-600 hover:text-gray-900 transition-colors">Discover Projects</Link>
              <LanguageSwitcher />
              <div className="flex items-center space-x-4">
                <Link href="/sign-in">
                  <Button size="lg" variant="outline" className="border-[#7F56D9] text-[#7F56D9] hover:bg-purple-50 px-6 py-2.5 text-base font-semibold">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="lg" className="bg-[#7F56D9] hover:bg-purple-700 text-white px-6 py-2.5 text-base font-semibold">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Sign Up
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-[#DFCFFF] via-white to-[#DFCFFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Empowering Global Educational Partnerships
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-600 max-w-3xl mx-auto">
              Join Class2Class as a partner organization and connect with schools worldwide to create meaningful 
              collaborative learning experiences that advance the UN Sustainable Development Goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/school/onboarding">
                <Button size="lg" className="bg-[#7F56D9] hover:bg-purple-700 px-8 py-3 text-lg font-semibold text-white">
                  Join as a School
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/partner/onboarding">
                <Button size="lg" className="bg-[#7F56D9] hover:bg-purple-700 px-8 py-3 text-lg font-semibold text-white">
                  Join as Organization
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/discover">
                <Button size="lg" className="bg-[#7F56D9] hover:bg-purple-700 px-8 py-3 text-lg font-semibold text-white">
                  Browse Projects
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Three Feature Cards */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Global Network */}
            <Card className="text-center hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardHeader>
                <div className="w-16 h-16 bg-[#7F56D9] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Global Network</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Connect with schools and students globally to create impactful collaborative projects.
                </p>
              </CardContent>
            </Card>

            {/* SDG Alignment */}
            <Card className="text-center hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardHeader>
                <div className="w-16 h-16 bg-[#7F56D9] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">SDG Alignment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Align projects with UN Sustainable Development Goals and track your impact.
                </p>
              </CardContent>
            </Card>

            {/* Project Management */}
            <Card className="text-center hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardHeader>
                <div className="w-16 h-16 bg-[#7F56D9] rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Project Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Create and manage educational projects with collaboration and tracking tools.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Who Can Become a Partner */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Who Can Become a Partner?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
            {partnerTypes.map((partner, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-4 text-3xl">
                  {partner.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{partner.type}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {partner.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-[#7F56D9] to-indigo-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="w-16 h-16 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">🏆</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Make a Global Impact?
          </h2>
          <p className="text-lg mb-8 text-purple-100 max-w-2xl mx-auto">
            Join our community of partners who are transforming education through 
            international collaboration and sustainable development.
          </p>
          <Link href="/partner/onboarding">
            <Button size="lg" className="bg-white text-[#7F56D9] hover:bg-gray-50 px-8 py-3 text-lg font-semibold">
              Begin Partner Registration
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <Link href="/" className="flex items-center gap-3">
                <Image 
                  src="/isotipo.png" 
                  alt="Class2Class Logo" 
                  width={32} 
                  height={32}
                  className="w-8 h-8"
                />
                <span className="text-lg font-semibold">Class2Class</span>
              </Link>
            </div>
            <div className="text-sm text-gray-400">
              © 2025 Class2Class. Connecting Classrooms for a Better World.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}