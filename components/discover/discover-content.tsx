'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { useMemo, useState } from 'react'
import { Plus, Search, Globe2, Users2, Clock, Languages } from 'lucide-react'
import { motion } from 'framer-motion'

import { ProgramCatalogCard } from '@/components/program/program-catalog-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { getCountryDisplay } from '@/lib/countries'
import { buildProgramCatalog } from '@/lib/programs/selectors'
import { cn } from '@/lib/utils'

type DiscoverContentProps = {
  layout?: 'standalone' | 'embedded'
  discoverBasePath?: string
}

type CollaborationProject = {
  id: string
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
  teacherAvatar?: string // New optional field
  teacherCountry: string
  createdAt: string
  // New fields for partner programs
  isPartnerProgram?: boolean
  partnerName?: string
  partnerLogo?: string
  programName?: string
}

function ProjectCard({ project }: { project: CollaborationProject }) {
  const tc = useTranslations('common')
  const [isExpanded, setIsExpanded] = useState(false)
  const { flag: countryFlag, name: countryName } = getCountryDisplay(project.teacherCountry)
  const isUnicef = project.partnerName?.toLowerCase().includes('unicef')
  const isSaveTheChildren = project.partnerName?.toLowerCase().includes('save the children') ||
    project.programName?.toLowerCase().includes('save the children') ||
    project.programName?.toLowerCase().includes('build the change')

  return (
    <Card className="flex h-full flex-col overflow-hidden border border-gray-100 transition-shadow hover:shadow-lg relative gap-0 py-0">
      <div className="relative h-40 overflow-visible">
        <Image
          src={project.image}
          alt={project.title}
          width={500}
          height={300}
          className="h-full w-full object-cover"
        />

        {isUnicef && (
          <motion.div
            className="pointer-events-none absolute top-0 right-0 z-10 overflow-hidden w-28 h-28"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Diagonal corner ribbon */}
            <motion.div
              className="absolute top-[16px] -right-[30px] w-[140px] bg-gradient-to-r from-[#00AEEF] via-[#29B6F6] to-[#00AEEF] py-2 rotate-45 shadow-lg flex items-center justify-center"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 20,
                delay: 0.2
              }}
            >
              {/* Animated shimmer */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut"
                }}
              />

              {/* UNICEF content */}
              <div className="relative z-10 flex items-center gap-1.5">
                <Image
                  src="/partners/unicef-logo.png"
                  alt="UNICEF"
                  width={26}
                  height={26}
                  className="drop-shadow-sm brightness-0 invert"
                />
                <span className="text-white text-[10px] font-bold tracking-wider drop-shadow-sm">UNICEF</span>
              </div>
            </motion.div>

            {/* Ribbon fold shadows */}
            <div className="absolute top-[42px] right-0 w-0 h-0 border-l-[6px] border-l-[#0277BD] border-b-[6px] border-b-transparent" />
            <div className="absolute top-0 right-[42px] w-0 h-0 border-t-[6px] border-t-transparent border-r-[6px] border-r-[#0277BD]" />
          </motion.div>
        )}

        {/* Save the Children Ribbon Banner */}
        {isSaveTheChildren && (
          <motion.div
            className="pointer-events-none absolute top-0 right-0 z-10 overflow-hidden w-28 h-28"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="absolute top-[16px] -right-[30px] w-[140px] bg-gradient-to-r from-[#E31B23] via-[#FF3B3B] to-[#E31B23] py-2 rotate-45 shadow-lg flex items-center justify-center"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.2 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
              />
              <div className="relative z-10 flex items-center gap-1">
                <Image
                  src="/partners/save-the-children-logo.png"
                  alt="Save the Children"
                  width={24}
                  height={24}
                  className="drop-shadow-sm brightness-0 invert"
                />
                <div className="flex flex-col leading-none">
                  <span className="text-white text-[7px] font-bold tracking-wide drop-shadow-sm">Save the</span>
                  <span className="text-white text-[7px] font-bold tracking-wide drop-shadow-sm">Children</span>
                </div>
              </div>
            </motion.div>
            <div className="absolute top-[42px] right-0 w-0 h-0 border-l-[6px] border-l-[#B71C1C] border-b-[6px] border-b-transparent" />
            <div className="absolute top-0 right-[42px] w-0 h-0 border-t-[6px] border-t-transparent border-r-[6px] border-r-[#B71C1C]" />
          </motion.div>
        )}
      </div>

      <CardContent className="flex flex-1 flex-col space-y-2 p-4">
        <div className="flex items-start">
          <p className="text-sm font-medium text-[#7F56D9]">Starting Month: {project.startMonth}</p>
        </div>

        <h3 className="text-lg font-bold leading-snug text-gray-900 line-clamp-2">{project.title}</h3>

        <div className="text-sm leading-relaxed text-gray-500">
          <p className={cn(!isExpanded && 'line-clamp-2')}>{project.description}</p>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-0.5 text-xs font-medium text-[#7F56D9] underline decoration-2 underline-offset-2 hover:text-[#6941C6]"
          >
            {isExpanded ? tc('readLess') : tc('readMore')}
          </button>
        </div>

        <div className="mt-2 space-y-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Globe2 className="h-3.5 w-3.5" />
            <span className="capitalize">{project.projectType}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users2 className="h-3.5 w-3.5" />
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
              {project.ageRange}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            <span>{project.timezone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Languages className="h-3.5 w-3.5" />
            <span>{project.language}</span>
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-2 gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="h-9 w-9 overflow-hidden rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center flex-shrink-0">
              {project.teacherAvatar ? (
                <img
                  src={project.teacherAvatar}
                  alt={project.teacherName}
                  className="h-full w-full object-cover"
                />
              ) : project.teacherInitials ? (
                <span className="text-xs font-bold text-gray-600">{project.teacherInitials}</span>
              ) : (
                <Users2 className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div className="flex flex-col min-w-0 justify-center flex-1">
              <span className="text-sm font-medium text-gray-900 truncate">{project.teacherName}</span>
              <div className="flex items-center gap-1.5 leading-none mt-0.5">
                <span className="text-sm shadow-sm flex-shrink-0">{countryFlag}</span>
                <span className="text-xs font-medium text-purple-600 truncate">{countryName}</span>
              </div>
              <span className="text-[10px] text-gray-400 mt-0.5 truncate">{timeAgo(project.createdAt)}</span>
            </div>
          </div>

          <Button className="px-3 h-8 text-xs font-medium shadow-sm flex-shrink-0 bg-[#7F56D9] hover:bg-[#6941C6] whitespace-nowrap" variant="default" asChild>
            <Link href={`/teacher/discover/projects/${project.id}`}>
              Request to join
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const mockProjects: { collaboration: CollaborationProject[]; ideas: { id: string; title: string; description: string; category: string }[]; community: { id: string; title: string; description: string; participants: number }[] } = {
  collaboration: [
    {
      id: '1',
      title: 'A Small Step To Save The World',
      subtitle: 'Change Is Started From ...',
      startMonth: 'September',
      image:
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&h=300&fit=crop',
      description:
        'This project began with a simple yet powerful idea to make students aware of environmental sustainability through local action and global collaboration.',
      projectType: 'Explore Global Challenges',
      ageRange: 'Ages 9 - 13 years',
      timezone: '+1 hour from you',
      language: 'English, Spanish',
      teacherName: 'Maria Garcia',
      teacherInitials: 'MG',
      teacherCountry: 'Spain',
      createdAt: '2025-01-01T00:00:00.000Z', // Placeholder, overwritten in useMemo
    },
    {
      id: '2',
      title: 'Machine Learning Prediction System',
      subtitle: '',
      startMonth: 'August',
      image:
        'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=500&h=300&fit=crop',
      description:
        'The project is all about machine learning with python to create a model to predict disease patterns and understand data science concepts through practical application.',
      projectType: 'Create Solutions',
      ageRange: 'Ages 15 - 18 years',
      timezone: '+5 hours from you',
      language: 'English',
      teacherName: 'Raj Patel',
      teacherInitials: 'RP',
      teacherCountry: 'India',
      createdAt: 'Created 1 week ago',
    },
    {
      id: '3',
      title: 'Community Building Together',
      subtitle: '',
      startMonth: 'August',
      image:
        'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=500&h=300&fit=crop',
      description:
        'This project is designed to engage students both creatively and intellectually by exploring local communities, sharing traditions, and building cross-cultural understanding.',
      projectType: 'Cultural Exchange',
      ageRange: 'Ages 11 - 15 years',
      timezone: '-6 hours from you',
      language: 'English, French',
      teacherName: 'Jonas Madsen',
      teacherInitials: 'JM',
      teacherCountry: 'Denmark',
      createdAt: 'Created 2 weeks ago',
    },
  ],
  ideas: Array(87)
    .fill(null)
    .map((_, i) => ({
      id: `idea-${i + 100}`,
      title: `Project Idea ${i + 1}`,
      description: 'Sample project idea description',
      category: 'Education',
    })),
  community: Array(175)
    .fill(null)
    .map((_, i) => ({
      id: `community-${i + 200}`,
      title: `Community Project ${i + 1}`,
      description: 'Sample community project description',
      participants: Math.floor(Math.random() * 100) + 20,
    })),
}

// Helper for consistent age group calculation based on project name hash
function getProjectAgeGroup(projectName: string): string {
  const ageGroups = ['12-14', '14-16', '16-18']
  const hash = projectName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return ageGroups[hash % ageGroups.length]
}

// Helper for relative time
function timeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + " years ago"
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + " months ago"
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + " days ago"
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + " hours ago"
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + " minutes ago"
  return "Just now"
}

const mapDbProjectToUi = (
  project: any, // ProgramProject from DB
  database: any // Full DB
): CollaborationProject => {
  const program = database.programs.find((p: any) => p.id === project.programId)
  const template = database.programTemplates.find((t: any) => t.id === project.templateId)
  const teacher = database.institutionTeachers.find((t: any) => t.id === project.createdById)
  const institution = teacher ? database.institutions.find((i: any) => i.id === teacher.institutionId) : null
  const partner = program ? database.partners.find((p: any) => p.id === program.partnerId) : null

  let createdAt = project.createdAt || new Date().toISOString()

  // Enforce specific order via timestamps as requested
  if (project.id === 'program-project-communities-belonging-ulla') { // Ulla Jensen
    createdAt = new Date().toISOString() // Just now
  } else if (project.id === 'program-project-communities-belonging') { // Karin Albrectsen
    createdAt = new Date(Date.now() - 3600000).toISOString() // 1 hour ago
  } else if (project.id === 'program-project-build-change-garden') { // Sustainable School Garden - 4th position
    createdAt = new Date(Date.now() - 9000000).toISOString() // 2.5 hours ago
  }

  const projectTitle = template?.title ?? 'Untitled Project'
  const ageGroup = getProjectAgeGroup(projectTitle)

  const uiProject = {
    id: project.id,
    title: projectTitle,
    subtitle: '',
    startMonth: template?.recommendedStartMonth ?? 'Flexible',
    image: project.coverImageUrl ?? template?.heroImageUrl ?? program?.heroImageUrl ?? 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500&h=300&fit=crop',
    description: template?.summary ?? 'No description available',
    projectType: program?.projectTypes?.[0]?.replaceAll('_', ' ') ?? 'Global Project',
    ageRange: `Ages ${ageGroup} years`,
    timezone: 'Varies',
    language: institution?.languages?.join(', ') ?? 'English',
    teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Partner Teacher',
    teacherInitials: teacher ? `${teacher.firstName?.[0] ?? ''}${teacher.lastName?.[0] ?? ''}` : 'PT',
    teacherCountry: institution?.country ?? 'US',
    createdAt: createdAt,
    isPartnerProgram: true,
    partnerName: partner?.organizationName,
    partnerLogo: partner?.logo,
    programName: program?.displayTitle ?? program?.name,
    teacherAvatar: undefined as string | undefined // Initialize as optional string
  }

  // Logic moved to useMemo to cover mock projects as well
  return uiProject

  return uiProject
}


export function DiscoverContent({
  layout = 'standalone',
  discoverBasePath = '/discover',
}: DiscoverContentProps) {
  const tc = useTranslations('common')
  const [activeTab, setActiveTab] = useState('collaboration')
  const [searchQuery, setSearchQuery] = useState('')
  const { ready: dataReady, database } = usePrototypeDb()

  const allCollaborationProjects = useMemo(() => {
    // Modify mockProjects timestamps for consistent sorting if needed
    const mockWithDates = mockProjects.collaboration.map(p => {
      if (p.id === '1') { // "A Small Step"
        return { ...p, createdAt: new Date(Date.now() - 7200000).toISOString() } // 2 hours ago
      }
      return { ...p, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() } // older
    })

    let projects = [...mockWithDates]

    if (database) {
      // Find all ACTIVE, PUBLIC projects from programs
      // Or just map all program projects for now
      const dbProjects = database.programProjects
        .filter(p => p.status === 'active' || p.status === 'draft') // Including draft for demo visibility
        .map(p => mapDbProjectToUi(p, database))

      projects = [...projects, ...dbProjects]
    }

    // Apply avatar overrides and consistent age groups to ALL projects (mock and DB)
    projects = projects.map(p => {
      const project = { ...p }
      // Apply consistent age group based on project title hash
      const ageGroup = getProjectAgeGroup(project.title)
      project.ageRange = `Ages ${ageGroup} years`

      // Override for Ulla Jensen as per request
      if (project.teacherName?.includes('Ulla Jensen')) {
        project.image = '/images/ulla-jensen-project.jpg' // User uploaded image
        project.teacherAvatar = '/images/avatars/ulla-new.jpg' // Asian woman
      }
      if (project.teacherName?.includes('Karin Albrectsen')) {
        project.teacherAvatar = '/images/avatars/karin-new.jpg' // Blond woman
      }
      if (project.teacherName?.includes('Maria Garcia')) {
        project.teacherAvatar = '/images/avatars/maria-new.jpg' // Black woman
      }
      if (project.teacherName?.includes('Raj Patel')) {
        project.teacherAvatar = '/images/avatars/raj-new.jpg' // Man 1
      }
      if (project.teacherName?.includes('Jonas Madsen')) {
        project.teacherAvatar = '/images/avatars/jonas-final.jpg?v=final' // Confirmed blond guy
      }
      if (project.teacherName?.includes('Anne Holm')) {
        project.teacherAvatar = '/images/avatars/anne-holm.png'
      }
      if (project.teacherName?.includes('Sofie Larsen')) {
        project.teacherAvatar = '/images/avatars/sofie-larsen.png'
      }
      if (project.teacherName?.includes('Sara Ricci')) {
        project.teacherAvatar = '/images/avatars/sara-ricci.png'
      }
      if (project.teacherName?.includes('Lucas Souza')) {
        project.teacherAvatar = '/images/avatars/lucas-souza.png'
      }
      if (project.teacherName?.includes('Peter Andersen')) {
        project.teacherAvatar = '/images/avatars/peter-andersen.png'
      }
      if (project.title?.includes('Teen Voices Across Borders')) {
        project.teacherAvatar = '/images/avatars/avatar-3.png'
      }
      if (project.title?.includes('Fun English Through Cooking')) {
        project.teacherAvatar = '/images/avatars/avatar-4.png'
      }
      return project
    })

    const sortedProjects = projects.sort((a, b) => {
      // Sort by createdAt descending
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return sortedProjects
  }, [database])

  const tabs = [
    { id: 'collaboration', label: 'Open for collaboration', count: allCollaborationProjects.length },
    { id: 'ideas', label: 'Project Ideas', count: 87 },
    { id: 'community', label: 'Community projects', count: 175 },
    // Removed Partner Programs tab
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'collaboration':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-purple-500" />
                <h2 className="text-lg font-semibold text-gray-900">Open for collaborations</h2>
              </div>
              <div className="flex items-center gap-3">
                <select className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-600">
                  <option>Newest first</option>
                  <option>Oldest first</option>
                </select>
                <Button className="bg-purple-600 text-white hover:bg-purple-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Post a project
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Browse active projects from teachers worldwide seeking partner classrooms for collaborative
              endeavors.
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              {allCollaborationProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )


      case 'ideas':
        return (
          <div className="py-12 text-center">
            <h3 className="mb-2 text-lg font-medium text-gray-500">Project Ideas Coming Soon</h3>
            <p className="text-gray-400">We&apos;re working on curating amazing project ideas for you.</p>
          </div>
        )

      case 'community':
        return (
          <div className="py-12 text-center">
            <h3 className="mb-2 text-lg font-medium text-gray-500">Community Projects Coming Soon</h3>
            <p className="text-gray-400">Community-driven projects will be available here soon.</p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div
      className={cn(
        'w-full',
        layout === 'standalone' ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8' : '',
      )}
    >
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Discover Projects</h1>
        <p className="text-gray-600">
          Find, join, or create collaborative projects to connect your students with classrooms from around the
          world.
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Search for projects"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-purple-50/50 pl-10"
          />
        </div>
        <div className="flex gap-4">
          <select className="rounded-lg border border-gray-300 px-4 py-2 text-sm">
            <option>All ages groups</option>
            <option>Elementary</option>
            <option>Middle School</option>
            <option>High School</option>
          </select>
          <select className="rounded-lg border border-gray-300 px-4 py-2 text-sm">
            <option>All months</option>
            <option>August</option>
            <option>September</option>
            <option>October</option>
          </select>
          <select className="rounded-lg border border-gray-300 px-4 py-2 text-sm">
            <option>All collaboration types</option>
            <option>Virtual Exchange</option>
            <option>Research Project</option>
            <option>Creative Arts</option>
          </select>
        </div>
      </div>

      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium',
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'ml-2 rounded-full px-2 py-0.5 text-xs',
                  activeTab === tab.id ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500',
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div>{renderTabContent()}</div>
    </div>
  )
}
