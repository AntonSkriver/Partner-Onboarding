'use client'

import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TabsContent } from '@/components/ui/tabs'
import { BookOpen } from 'lucide-react'
import type { ProgramProject } from '@/lib/types/program'

type ProjectStatus = ProgramProject['status']

type SchoolProjectEntry = {
  id: string
  title: string
  status: ProjectStatus
  programId: string
  programName: string
  templateTitle?: string
  estimatedWeeks?: number
  sdgAlignment?: number[]
  teacherName: string
  teacherEmail?: string
  updatedAt?: string
  createdAt?: string
  coverImageUrl?: string
}

const projectStatusClasses: Record<ProjectStatus, string> = {
  draft: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  archived: 'bg-gray-200 text-gray-700',
}

const projectStatusLabels: Record<ProjectStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  completed: 'Completed',
  archived: 'Archived',
}

interface ProjectsTabProps {
  projects: SchoolProjectEntry[]
}

export function ProjectsTab({ projects }: ProjectsTabProps) {
  return (
    <TabsContent value="projects" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Classroom Projects</h3>
          <p className="text-sm text-gray-600">
            Projects created by teachers at your school across all programs
          </p>
        </div>
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed border-purple-200 bg-purple-50/50">
          <CardContent className="p-8 text-center text-sm text-purple-700">
            No classroom projects yet. Encourage teachers to start a project from a shared template
            or create their own inside a partner program.
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <div className="relative h-40 overflow-hidden rounded-t-lg">
                {project.coverImageUrl ? (
                  <Image
                    src={project.coverImageUrl}
                    alt={project.title}
                    width={500}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-purple-300" />
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-purple-600 font-medium">
                    {project.programName}
                  </div>
                  <Badge className={projectStatusClasses[project.status]}>
                    {projectStatusLabels[project.status]}
                  </Badge>
                </div>
                <CardTitle className="text-lg leading-tight">{project.title}</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  By {project.teacherName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                  {project.templateTitle ? `Based on ${project.templateTitle}` : project.programName}
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/teacher/projects?project=${project.id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </TabsContent>
  )
}
