'use client'

import { Button } from '@/components/ui/button'
import { WorldMap } from '@/components/WorldMap'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#E0CCFF] relative overflow-hidden font-sans">
      {/* Background Map */}
      <div className="absolute inset-0 z-0 top-[120px]">
        <Image
          src="/images/world-map.webp"
          alt="World Map Background"
          fill
          className="object-cover opacity-60 mix-blend-multiply"
          priority
        />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full py-4 px-6 md:px-12 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-white/20">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Image
            src="/isotipo.png"
            alt="Class2Class Logo"
            width={40}
            height={40}
            className="w-10 h-10"
          />
          <span className="text-xl font-semibold text-[#1a1a2e]">Class2Class</span>
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
          {/* Simple Hamburger */}
          <div className="space-y-1">
            <div className="w-6 h-0.5 bg-gray-900"></div>
            <div className="w-6 h-0.5 bg-gray-900"></div>
            <div className="w-6 h-0.5 bg-gray-900"></div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-start justify-center px-6 md:px-24 h-[85vh] max-w-7xl">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-bold text-[#1a1a2e] leading-tight mb-6">
            Connect with classrooms around the world
          </h1>
          <p className="text-xl md:text-2xl text-[#4a4a6a] mb-8 leading-relaxed">
            Give your students the chance to meet and connect with other classes from different countries.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="bg-[#8B5CF6] hover:bg-[#7c4dff] text-white font-semibold text-lg px-8 py-6 rounded-md shadow-sm"
            >
              Go to platform
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white hover:bg-gray-50 text-[#8B5CF6] font-semibold text-lg px-8 py-6 rounded-md shadow-sm"
            >
              Learn more
            </Button>
          </div>
        </div>

        {/* Chat Widget Placeholder */}
        <div className="fixed bottom-6 right-6 z-20">
          <div className="bg-white rounded-lg shadow-lg p-4 flex items-center space-x-3 cursor-pointer hover:shadow-xl transition-shadow">
            <span className="text-xl">👋</span>
            <span className="text-gray-800 font-medium">Hi! I am C2C AI, ask me anything about Class2Class.org!</span>
          </div>
        </div>
      </main>
    </div>
  )
}