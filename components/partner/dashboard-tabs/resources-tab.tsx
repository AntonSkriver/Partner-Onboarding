'use client'

import { Link } from '@/i18n/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TabsContent } from '@/components/ui/tabs'
import {
  BookOpen,
  Plus,
  MoreVertical,
  FileText,
} from 'lucide-react'
import { SDG_DATA } from '@/components/sdg-icons'

interface ResourceItem {
  id: string
  title: string
  description: string
  type: string
  category: string
  ageRange: string
  sdgAlignment: number[]
  language: string
  heroImageUrl: string
  updated_at: string
}

interface ResourcesTabProps {
  isOwnProfile: boolean
  resources: ResourceItem[]
}

export function ResourcesTab({
  isOwnProfile,
  resources,
}: ResourcesTabProps) {
  return (
    <TabsContent value="resources" className="space-y-4">
      {/* Add Resources Button - shown when there are resources */}
      {isOwnProfile && resources.length > 0 && (
        <div className="flex justify-end">
          <Button className="bg-purple-600 hover:bg-purple-700" asChild>
            <Link href="/partner/content/upload">
              <Plus className="w-4 h-4 mr-2" />
              Add Resources
            </Link>
          </Button>
        </div>
      )}

      {resources.length > 0 ? (
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
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-2">No Resources Yet</h3>
            <p className="text-gray-500">
              This organization hasn&apos;t shared any resources yet.
            </p>
          </CardContent>
        </Card>
      )}
    </TabsContent>
  )
}
