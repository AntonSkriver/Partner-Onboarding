'use client'

import Image from 'next/image'
import { BookOpen, Building2, FileText, MoreVertical } from 'lucide-react'
import type { ReactNode } from 'react'

import { SDG_DATA } from '@/components/sdg-icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { ProgramResource, ResourceAvailabilityScope } from '@/lib/types/resource'

interface ProfileResourceCatalogProps {
  resources: ProgramResource[]
  emptyTitle: string
  emptyDescription: string
  emptyAction?: ReactNode
  showOwnerOrganization?: boolean
  showAvailabilityScope?: boolean
}

const availabilityScopeLabel: Record<ResourceAvailabilityScope, string> = {
  organization: 'Organization Only',
  all_partners: 'All Partners',
  specific_partners: 'Selected Partners',
}

const formatResourceType = (type: ProgramResource['type']): string =>
  type.charAt(0).toUpperCase() + type.slice(1)

export function ProfileResourceCatalog({
  resources,
  emptyTitle,
  emptyDescription,
  emptyAction,
  showOwnerOrganization = false,
  showAvailabilityScope = false,
}: ProfileResourceCatalogProps) {
  if (resources.length === 0) {
    return (
      <Card>
        <CardContent className="space-y-4 p-10 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">{emptyTitle}</h3>
          <p className="text-gray-500">{emptyDescription}</p>
          {emptyAction}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {resources.map((resource) => {
        const firstTag = resource.tags[0]
        const firstSdg = resource.sdgAlignment[0]
        const firstSdgData =
          typeof firstSdg === 'number'
            ? SDG_DATA[firstSdg as keyof typeof SDG_DATA]
            : undefined
        const sdgTitle =
          typeof firstSdg === 'number'
            ? `SDG #${firstSdg}: ${firstSdgData?.title ?? firstSdg}`
            : null

        return (
          <Card key={resource.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col gap-0 sm:flex-row">
                <div className="relative h-40 flex-shrink-0 overflow-hidden bg-gray-100 sm:h-48 sm:w-48">
                  {resource.heroImageUrl ? (
                    <Image
                      src={resource.heroImageUrl}
                      alt={resource.title}
                      fill
                      sizes="(min-width: 640px) 192px, 100vw"
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
                    <Badge variant="profile">{formatResourceType(resource.type)}</Badge>

                    {firstTag ? (
                      <Badge variant="outline" className="capitalize">
                        {firstTag}
                      </Badge>
                    ) : null}

                    {sdgTitle ? (
                      <Badge variant="outline" className="border-orange-300 text-orange-700">
                        {sdgTitle}
                      </Badge>
                    ) : null}

                    <Badge variant="profileSoft">{resource.language}</Badge>

                    {showOwnerOrganization && resource.ownerOrganization ? (
                      <Badge variant="profileSoft">
                        <Building2 className="h-3 w-3" />
                        {resource.ownerOrganization}
                      </Badge>
                    ) : null}

                    {showAvailabilityScope ? (
                      <Badge variant="outline">
                        {availabilityScopeLabel[resource.availabilityScope]}
                      </Badge>
                    ) : null}
                  </div>

                  <p className="text-sm leading-relaxed text-gray-600">{resource.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
