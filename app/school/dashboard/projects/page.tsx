'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Globe2, Users2, Clock, Languages } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCountryDisplay } from '@/lib/countries'

// Demo projects
const projects = [
  {
    id: 'demo-project-1',
    title: 'City Guardians Story Maps',
    description: 'In this project, students collaborate with peers from another country to explore the diverse...',
    startingMonth: 'November',
    status: 'active' as const,
    programName: 'Build the Change',
    teacherName: 'Maria Hansen',
    teacherCountry: 'Denmark',
    teacherInitials: 'MH',
    projectType: 'Explore Global Challenges',
    ageRange: 'Ages 11 - 15 years',
    timezone: '+2 hours from you',
    language: 'English',
    createdAt: 'Created 2 days ago',
    coverImageUrl: 'https://images.unsplash.com/photo-1529101091764-c3526daf38fe?w=800&h=480&fit=crop',
  },
  {
    id: 'demo-project-2',
    title: 'Community Story Circles',
    description: 'Hello! We are a small group of five students in the subject: International Studies. We a...',
    startingMonth: 'December',
    status: 'draft' as const,
    programName: 'Communities in Focus',
    teacherName: 'Peter Nielsen',
    teacherCountry: 'Germany',
    teacherInitials: 'PN',
    projectType: 'Cultural Exchange',
    ageRange: 'Ages 6 - 13 years',
    timezone: '+1 hour from you',
    language: 'German, English',
    createdAt: 'Created 5 hours ago',
    coverImageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=480&fit=crop',
  },
]

function ProjectCard({ project }: { project: typeof projects[0] }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { flag: countryFlag, name: countryName } = getCountryDisplay(project.teacherCountry)

  return (
    <Card className="flex h-full flex-col overflow-hidden hover:shadow-lg transition-shadow">
      {/* Hero Image */}
      <div className="relative h-44 overflow-hidden">
        <Image
          src={project.coverImageUrl}
          alt={project.title}
          width={500}
          height={300}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Content */}
      <CardContent className="flex flex-1 flex-col p-5 space-y-4">
        {/* Starting Month Label */}
        <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">
          Starting Month: {project.startingMonth}
        </p>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 leading-tight">
          {project.title}
        </h3>

        {/* Description */}
        <div className="text-sm text-gray-600">
          <p className={cn(!isExpanded && 'line-clamp-2')}>
            {project.description}
          </p>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium mt-1"
          >
            {isExpanded ? 'Read less' : 'Read more'}
          </button>
        </div>

        {/* Metadata Icons */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-gray-400" />
            <span>{project.projectType}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users2 className="h-4 w-4 text-gray-400" />
            <span>{project.ageRange}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>{project.timezone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-gray-400" />
            <span>{project.language}</span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Created By Section */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-xs font-semibold text-white">
            {project.teacherInitials}
          </div>
          <div className="text-xs">
            <p className="font-medium text-gray-900">{project.teacherName}</p>
            <Badge
              variant="outline"
              className="mt-1 flex items-center gap-1 border-purple-200 text-gray-600"
            >
              <span className="text-base leading-none">{countryFlag}</span>
              <span>{countryName}</span>
            </Badge>
            <p className="mt-1 text-gray-500">{project.createdAt}</p>
          </div>
        </div>
      </div>

        {/* Action Button */}
        <Button variant="outline" className="w-full border-purple-600 text-purple-600 hover:bg-purple-50" asChild>
          <Link href={`/teacher/projects?project=${project.id}`}>Request to join</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default function SchoolProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Projects</h1>
        <p className="text-sm text-gray-600">
          Projects created by teachers at your school across all programs.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}
