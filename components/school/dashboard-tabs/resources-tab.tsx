'use client'

import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TabsContent } from '@/components/ui/tabs'
import {
  FileText,
  MoreVertical,
  Plus,
} from 'lucide-react'
import { SDG_DATA } from '@/components/sdg-icons'

type ResourceEntry = {
  id: string
  title: string
  description: string
  type: string
  category?: string
  ageRange?: string
  sdgAlignment?: number[]
  language: string
  heroImageUrl?: string
  updatedAt: string
  programName: string
}

interface ResourcesTabProps {
  resources: ResourceEntry[]
}

export function ResourcesTab({ resources }: ResourcesTabProps) {
  return (
    <TabsContent value="resources" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Program resources</h3>
          <p className="text-sm text-gray-600">
            Aligned with the partner profile look-and-feel, these are ready for classrooms.
          </p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Resources
        </Button>
      </div>

      {resources.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-gray-500">
            No resources yet. Add materials to support your program participation.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {resources.map((resource) => {
            // Get SDG data
            const sdgTitles = resource.sdgAlignment?.map((num: number) => {
              const sdgData = SDG_DATA[num]
              return sdgData ? `SDG #${num}: ${sdgData.title}` : `SDG ${num}`
            }) || []

            return (
              <Card key={resource.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row gap-0">
                    {/* Thumbnail */}
                    <div className="sm:w-48 sm:h-48 h-40 flex-shrink-0 bg-gray-100 relative overflow-hidden">
                      {resource.heroImageUrl ? (
                        <img
                          src={resource.heroImageUrl}
                          alt={resource.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-50">
                          <FileText className="w-12 h-12 text-purple-300" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900 leading-tight">
                          {resource.title}
                        </h3>
                        <Button variant="ghost" size="sm" className="flex-shrink-0">
                          <MoreVertical className="h-4 w-4 text-gray-400" />
                        </Button>
                      </div>

                      {/* Metadata badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className="bg-purple-600 hover:bg-purple-700 text-white">
                          {resource.type}
                        </Badge>

                        {resource.category && (
                          <Badge variant="outline" className="capitalize">
                            {resource.category}
                          </Badge>
                        )}

                        {resource.ageRange && (
                          <Badge variant="outline">
                            {resource.ageRange}
                          </Badge>
                        )}

                        {sdgTitles.length > 0 && (
                          <Badge variant="outline" className="text-orange-700 border-orange-300">
                            {sdgTitles[0]}
                          </Badge>
                        )}

                        <Badge className="bg-purple-600 hover:bg-purple-700 text-white">
                          {resource.language}
                        </Badge>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {resource.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </TabsContent>
  )
}
