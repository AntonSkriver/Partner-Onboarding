'use client'

import { Button } from '@/components/ui/button'
import { 
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { LanguageSwitcher } from '@/components/language-switcher'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Image 
                src="/isotipo.png" 
                alt="Class2Class Logo" 
                width={40} 
                height={40}
                className="w-10 h-10"
              />
              <span className="text-xl font-semibold text-gray-900">Class2Class</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How it works</a>
              <a href="#platform" className="text-gray-600 hover:text-gray-900 transition-colors">Platform</a>
              <a href="#success-stories" className="text-gray-600 hover:text-gray-900 transition-colors">Success cases</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About us</a>
              <LanguageSwitcher />
              <div className="flex items-center space-x-4">
                <Link href="/sign-in">
                  <Button variant="outline" className="border-[#7F56D9] text-[#7F56D9] hover:bg-purple-50">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-[#7F56D9] hover:bg-purple-700 text-white">
                    Sign up
                  </Button>
                </Link>
                <Link href="/partners">
                  <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">Partners</Button>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#DFCFFF] via-white to-[#DFCFFF] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
              Connecting Classrooms
              <span className="block text-[#7F56D9]">Around the World</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-600 max-w-3xl">
              Join Class2Class to connect schools worldwide, create collaborative learning 
              experiences, and make a lasting impact on global education through the UN SDGs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/school/onboarding">
                <Button size="lg" className="bg-[#7F56D9] hover:bg-purple-700 text-white px-8 py-3 text-lg font-semibold">
                  Sign up for free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/partners">
                <Button size="lg" variant="outline" className="border-[#7F56D9] text-[#7F56D9] hover:bg-purple-50 px-8 py-3 text-lg font-semibold">
                  Learn more
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}