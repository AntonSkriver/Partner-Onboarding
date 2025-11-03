'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FolderKanban, BookOpen } from 'lucide-react'

// Demo projects
const projects = [
  {
    id: 'demo-project-1',
    title: 'City Guardians Story Maps',
    status: 'active' as const,
    programName: 'Build the Change',
    teacherName: 'Maria Hansen',
    coverImageUrl: 'https://images.unsplash.com/photo-1529101091764-c3526daf38fe?w=800&h=480&fit=crop',
  },
  {
    id: 'demo-project-2',
    title: 'Community Story Circles',
    status: 'draft' as const,
    programName: 'Communities in Focus',
    teacherName: 'Peter Nielsen',
    coverImageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=480&fit=crop',
  },
]

const statusClasses = {
  draft: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  archived: 'bg-gray-200 text-gray-700',
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
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <div className="relative h-40 overflow-hidden rounded-t-lg">
              <Image
                src={project.coverImageUrl}
                alt={project.title}
                width={500}
                height={300}
                className="h-full w-full object-cover"
              />
            </div>
            <CardHeader className="pb-2">
              <div className="mb-1 flex items-center justify-between">
                <div className="text-xs font-medium text-purple-600">{project.programName}</div>
                <Badge className={statusClasses[project.status]}>{project.status}</Badge>
              </div>
              <CardTitle className="text-lg leading-tight">{project.title}</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                By {project.teacherName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/teacher/projects?project=${project.id}`}>View Details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
