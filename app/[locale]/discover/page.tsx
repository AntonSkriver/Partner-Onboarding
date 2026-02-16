'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { BookOpen, ChevronDown, Compass, FolderOpen, GraduationCap, Home, Link as LinkIcon } from 'lucide-react'

import { DiscoverContent } from '@/components/discover/discover-content'

export default function DiscoverPage() {
  const tn = useTranslations('nav')
  const td = useTranslations('discover')
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/isotipo.png" alt="Class2Class Logo" width={32} height={32} className="h-8 w-8" />
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-purple-600">
                <Home className="h-4 w-4" />
                <span className="text-sm">{tn('home')}</span>
              </Link>
              <Link href="/discover" className="flex items-center gap-2 font-medium text-purple-600">
                <Compass className="h-4 w-4" />
                <span className="text-sm">{tn('discover')}</span>
              </Link>
              <Link href="/connect" className="flex items-center gap-2 text-gray-700 hover:text-purple-600">
                <LinkIcon className="h-4 w-4" />
                <span className="text-sm">{tn('connect')}</span>
              </Link>
              <Link href="/teacher/projects" className="flex items-center gap-2 text-gray-700 hover:text-purple-600">
                <FolderOpen className="h-4 w-4" />
                <span className="text-sm">{tn('myProjects')}</span>
              </Link>
              <Link href="/resources" className="flex items-center gap-2 text-gray-700 hover:text-purple-600">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm">{tn('resources')}</span>
              </Link>
              <Link href="/students" className="flex items-center gap-2 text-gray-700 hover:text-purple-600">
                <GraduationCap className="h-4 w-4" />
                <span className="text-sm">{tn('myStudents')}</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600">
                <span className="text-sm font-medium text-white">A</span>
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-900">Anton Skriver</div>
                <div className="text-xs text-gray-500">Teacher</div>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      <main>
        <DiscoverContent />
      </main>
    </div>
  )
}
