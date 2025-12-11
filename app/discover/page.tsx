'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
  GraduationCap,
  Globe2,
  Users2,
  Clock,
  Languages
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCountryDisplay } from '@/lib/countries'
import Link from 'next/link'
import Image from 'next/image'
import { ProgramCatalogCard } from '@/components/program/program-catalog-card'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { buildProgramCatalog } from '@/lib/programs/selectors'

type CollaborationProject = {
  id: number
  title: string
  subtitle: string
  startMonth: string
  image: string
  description: string
  projectType: string
  ageRange: string
  timezone: string
  language: string
  teacherName: string
  teacherInitials: string
  teacherCountry: string
  createdAt: string
}

// Project Card Component
function ProjectCard({ project }: { project: CollaborationProject }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { flag: countryFlag, name: countryName } = getCountryDisplay(project.teacherCountry)

  return (
    <Card className="flex h-full flex-col overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
      {/* Hero Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={project.image}
          alt={project.title}
          width={500}
          height={300}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <CardContent className="flex flex-1 flex-col p-6 space-y-3">
        {/* Starting Month Label */}
        <p className="text-sm font-medium text-[#7F56D9]">
          Starting Month: {project.startMonth}
        </p>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 leading-snug">
          {project.title}
        </h3>

        {/* Description */}
        <div className="text-base text-gray-500 leading-relaxed">
          <p className={cn(!isExpanded && 'line-clamp-3')}>
            {project.description}
          </p>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[#7F56D9] hover:text-[#6941C6] text-sm font-medium mt-1 underline decoration-2 underline-offset-2"
          >
            {isExpanded ? 'Read less' : 'Read more'}
          </button>
        </div>

        {/* Metadata Icons */}
        <div className="space-y-3 text-sm text-gray-500 mt-2">
          <div className="flex items-center gap-2.5">
            <Globe2 className="h-4 w-4" />
            <span>{project.projectType}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Users2 className="h-4 w-4" />
            <span>{project.ageRange}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4" />
            <span>{project.timezone}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Languages className="h-4 w-4" />
            <span>{project.language}</span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Created By Section */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            {/* Teacher Avatar - Using a placeholder image for demo */}
            <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-200">
              <Image
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
                alt={project.teacherName}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-0.5">Created by</span>
              <p className="text-sm font-bold text-gray-900 leading-none mb-1.5">{project.teacherName}</p>

              <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-full w-fit">
                <span className="text-sm shadow-sm">{countryFlag}</span>
                <span className="text-xs font-medium text-purple-600">{countryName}</span>
              </div>

              <p className="text-xs text-gray-400 mt-1">{project.createdAt}</p>
            </div>
          </div>

          {/* Action Button */}
          <Button className="bg-[#7F56D9] hover:bg-[#6941C6] text-white px-6 font-medium shadow-sm">
            Request to join
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Mock data for tabs
const mockProjects = {
  collaboration: [
    {
      id: 1,
      title: "A Small Step To Save The World",
      subtitle: "Change Is Started From ...",
      startMonth: "September",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&h=300&fit=crop",
      description: "This project began with a simple yet powerful idea to make students aware of environmental sustainability through local action and global collaboration.",
      projectType: "Explore Global Challenges",
      ageRange: "Ages 9 - 13 years",
      timezone: "+1 hour from you",
      language: "English, Spanish",
      teacherName: "Maria Garcia",
      teacherInitials: "MG",
      teacherCountry: "Spain",
      createdAt: "Created 3 days ago"
    },
    {
      id: 2,
      title: "Machine Learning Prediction System",
      subtitle: "",
      startMonth: "August",
      image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=500&h=300&fit=crop",
      description: "The project is all about machine learning with python to create a model to predict disease patterns and understand data science concepts through practical application.",
      projectType: "Create Solutions",
      ageRange: "Ages 15 - 18 years",
      timezone: "+5 hours from you",
      language: "English",
      teacherName: "Raj Patel",
      teacherInitials: "RP",
      teacherCountry: "India",
      createdAt: "Created 1 week ago"
    },
    {
      id: 3,
      title: "Community Building Together",
      subtitle: "",
      startMonth: "August",
      image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=500&h=300&fit=crop",
      description: "This project is designed to engage students both creatively and intellectually by exploring local communities, sharing traditions, and building cross-cultural understanding.",
      projectType: "Cultural Exchange",
      ageRange: "Ages 11 - 15 years",
      timezone: "-6 hours from you",
      language: "English, French",
      teacherName: "Sophie Martin",
      teacherInitials: "SM",
      teacherCountry: "Canada",
      createdAt: "Created 2 weeks ago"
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
    switch (activeTab) {
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
                <ProjectCard key={project.id} project={project} />
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
                <Link href="/teacher/projects" className="flex items-center gap-2 text-gray-700 hover:text-purple-600">
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
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.label}
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${activeTab === tab.id
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
