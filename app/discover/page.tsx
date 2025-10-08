'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Search,
  ChevronDown,
  Plus,
  BookOpen,
  Home,
  Compass,
  Link as LinkIcon,
  FolderOpen,
  GraduationCap
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ProgramCatalogCard } from '@/components/program/program-catalog-card'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { buildProgramCatalog } from '@/lib/programs/selectors'

// Mock data for tabs
const mockProjects = {
  collaboration: [
    {
      id: 1,
      title: "A Small Step To Save The World",
      subtitle: "Change Is Started From ...",
      startMonth: "September",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&h=300&fit=crop",
      description: "This project began with a simple yet powerful idea..."
    },
    {
      id: 2,
      title: "Machine Learning Prediction System",
      subtitle: "",
      startMonth: "August", 
      image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=500&h=300&fit=crop",
      description: "The project is all about machine learning with python to create a model to predict disease"
    },
    {
      id: 3,
      title: "Women&apos;s Equality Day",
      subtitle: "",
      startMonth: "August",
      image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=500&h=300&fit=crop", 
      description: "This project is designed to engage students both creatively and intellectually..."
    }
  ],
  ideas: Array(87).fill(null).map((_, i) => ({
    id: i + 100,
    title: `Project Idea ${i + 1}`,
    description: "Sample project idea description",
    category: "Education"
  })),
  community: Array(175).fill(null).map((_, i) => ({
    id: i + 200, 
    title: `Community Project ${i + 1}`,
    description: "Sample community project description",
    participants: Math.floor(Math.random() * 100) + 20
  }))
}

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState('collaboration')
  const [searchQuery, setSearchQuery] = useState('')
  const { ready: dataReady, database, reset } = usePrototypeDb()

  const programCatalog = useMemo(
    () => (database ? buildProgramCatalog(database) : []),
    [database],
  )

  const tabs = [
    { id: 'collaboration', label: 'Open for collaboration', count: 35 },
    { id: 'ideas', label: 'Project Ideas', count: 87 },
    { id: 'community', label: 'Community projects', count: 175 },
    { id: 'partners', label: 'Partner programs', count: programCatalog.length }
  ]

  const renderTabContent = () => {
    switch(activeTab) {
      case 'collaboration':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-900">Open for collaborations</h2>
              </div>
              <div className="flex items-center gap-3">
                <select className="text-sm text-gray-600 border border-gray-300 rounded px-3 py-1">
                  <option>Newest first</option>
                  <option>Oldest first</option>
                </select>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Post a project
                </Button>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              Browse active projects from teachers worldwide seeking partner classrooms for collaborative endeavors.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {mockProjects.collaboration.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <div className="relative h-40 overflow-hidden rounded-t-lg">
                    <Image 
                      src={project.image} 
                      alt={project.title}
                      width={500}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="text-xs text-purple-600 font-medium mb-1">
                      Starting Month: {project.startMonth}
                    </div>
                    <CardTitle className="text-lg leading-tight">{project.title}</CardTitle>
                    {project.subtitle && (
                      <CardDescription className="text-sm text-gray-600">
                        {project.subtitle}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-4">{project.description}</p>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      
      case 'partners':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-900">Partner programs</h2>
              </div>
            </div>
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-gray-600 text-sm">
                Explore signature programs crafted by partner organisations. Each program includes templates and real classroom projects you can adapt.
              </p>
              <Button
                variant="ghost"
                className="self-start text-sm text-purple-600 hover:text-purple-700"
                onClick={() => reset()}
                disabled={!dataReady}
              >
                Reset demo data
              </Button>
            </div>
            {!dataReady ? (
              <div className="flex items-center justify-center py-12 text-sm text-gray-500">
                Loading partner programs…
              </div>
            ) : programCatalog.length === 0 ? (
              <div className="rounded-lg border border-dashed border-purple-200 bg-purple-50/60 p-6 text-center text-sm text-purple-800">
                No partner programs are published yet. Check back soon to see new collaborative offerings.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {programCatalog.map((item) => (
                  <ProgramCatalogCard
                    key={item.programId}
                    item={item}
                    actions={
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/discover/programs/${item.programId}`}>
                          View details
                        </Link>
                      </Button>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )
      
      case 'ideas':
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-500 mb-2">Project Ideas Coming Soon</h3>
            <p className="text-gray-400">We&apos;re working on curating amazing project ideas for you.</p>
          </div>
        )
      
      case 'community':
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-500 mb-2">Community Projects Coming Soon</h3>
            <p className="text-gray-400">Community-driven projects will be available here soon.</p>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and nav */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-3">
                <Image 
                  src="/isotipo.png" 
                  alt="Class2Class Logo" 
                  width={32} 
                  height={32}
                  className="w-8 h-8"
                />
              </Link>
              
              {/* Sidebar navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-purple-600">
                  <Home className="w-4 h-4" />
                  <span className="text-sm">Home</span>
                </Link>
                <Link href="/discover" className="flex items-center gap-2 text-purple-600 font-medium">
                  <Compass className="w-4 h-4" />
                  <span className="text-sm">Discover</span>
                </Link>
                <Link href="/connect" className="flex items-center gap-2 text-gray-700 hover:text-purple-600">
                  <LinkIcon className="w-4 h-4" />
                  <span className="text-sm">Connect</span>
                </Link>
                <Link href="/projects" className="flex items-center gap-2 text-gray-700 hover:text-purple-600">
                  <FolderOpen className="w-4 h-4" />
                  <span className="text-sm">My Projects</span>
                </Link>
                <Link href="/resources" className="flex items-center gap-2 text-gray-700 hover:text-purple-600">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">Resources</span>
                </Link>
                <Link href="/students" className="flex items-center gap-2 text-gray-700 hover:text-purple-600">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-sm">My Students</span>
                </Link>
              </nav>
            </div>

            {/* Right side - User info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">Anton Skriver</div>
                  <div className="text-xs text-gray-500">Teacher</div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Projects</h1>
          <p className="text-gray-600">
            Find, join, or create collaborative projects to connect your students with classrooms from around the world.
          </p>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search for projects"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-purple-50/50 border-purple-200 focus:border-purple-500"
            />
          </div>
          <div className="flex gap-4">
            <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
              <option>All ages groups</option>
              <option>Elementary</option>
              <option>Middle School</option>
              <option>High School</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
              <option>All months</option>
              <option>August</option>
              <option>September</option>
              <option>October</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
              <option>All collaboration types</option>
              <option>Virtual Exchange</option>
              <option>Research Project</option>
              <option>Creative Arts</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.id 
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div>
          {renderTabContent()}
        </div>
      </main>
    </div>
  )
}
