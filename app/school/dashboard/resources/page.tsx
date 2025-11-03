'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, MoreVertical } from 'lucide-react'

const resources = [
  {
    id: 'resource-1',
    title: 'Human Rights Education Toolkit',
    description: 'Comprehensive guide for teaching human rights concepts and promoting global citizenship.',
    type: 'Document',
    category: 'Teaching Guide',
    ageRange: '13-19 years old',
    language: 'English',
    heroImageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=480&fit=crop',
    programName: 'Communities in Focus',
  },
  {
    id: 'resource-2',
    title: 'Climate Action Project Templates',
    description: 'Ready-to-use templates for climate projects that engage students in sustainability.',
    type: 'Project Template',
    category: 'Science',
    ageRange: '9-13 years old',
    language: 'English',
    heroImageUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=480&fit=crop',
    programName: 'Build the Change',
  },
]

export default function SchoolResourcesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Resources</h1>
          <p className="text-sm text-gray-600">
            Program resources ready for your classrooms.
          </p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          Upload resource
        </Button>
      </div>

      <div className="space-y-4">
        {resources.map((resource) => (
          <Card key={resource.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col gap-0 sm:flex-row">
                <div className="relative h-40 flex-shrink-0 overflow-hidden bg-gray-100 sm:h-48 sm:w-48">
                  {resource.heroImageUrl ? (
                    <img
                      src={resource.heroImageUrl}
                      alt={resource.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-purple-50">
                      <FileText className="h-12 w-12 text-purple-300" />
                    </div>
                  )}
                </div>

                <div className="flex-1 p-6">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold leading-tight text-gray-900">
                      {resource.title}
                    </h3>
                    <Button variant="ghost" size="sm" className="flex-shrink-0">
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </Button>
                  </div>

                  <div className="mb-3 flex flex-wrap gap-2">
                    <Badge className="bg-purple-600 text-white hover:bg-purple-700">
                      {resource.type}
                    </Badge>
                    {resource.category && (
                      <Badge variant="outline" className="capitalize">
                        {resource.category}
                      </Badge>
                    )}
                    {resource.ageRange && <Badge variant="outline">{resource.ageRange}</Badge>}
                    <Badge className="bg-purple-600 text-white hover:bg-purple-700">
                      {resource.language}
                    </Badge>
                  </div>

                  <p className="text-sm leading-relaxed text-gray-600">{resource.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
