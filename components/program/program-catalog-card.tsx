'use client'

import Image from 'next/image'
import { useState, type ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ProgramCatalogItem } from '@/lib/programs/selectors'
import { Button } from '@/components/ui/button'
import { Globe2, Users2, Languages } from 'lucide-react'

interface ProgramCatalogCardProps {
  item: ProgramCatalogItem
  className?: string
  actions?: ReactNode
  membershipStatus?: 'member' | 'available' | 'invite-only'
  onJoin?: () => void
}

const renderPartnerAvatar = (name?: string, logo?: string) => {
  if (logo) {
    return (
      <div className="h-8 w-8 rounded-full overflow-hidden bg-white flex items-center justify-center">
        <Image
          src={logo}
          alt={name ?? 'Partner logo'}
          width={32}
          height={32}
          className="h-8 w-8 object-cover"
        />
      </div>
    )
  }

  if (!name) {
    return (
      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
        —
      </div>
    )
  }

  return (
    <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-xs font-semibold text-white">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export function ProgramCatalogCard({
  item,
  className,
  actions,
  membershipStatus,
  onJoin,
}: ProgramCatalogCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hostName = item.hostPartner?.organizationName ?? 'Class2Class.org'
  const hostLogo = item.hostPartner?.logo
   const supportingName = item.supportingPartner?.organizationName
   const supportingLogo = item.supportingPartner?.logo
  const location =
    item.hostPartner?.headquartersCity || item.hostPartner?.country || 'Copenhagen'

  // Get first pedagogical framework or project type as category
  const category = 'Sustainability and Global Action' // Default category

  // Format age ranges
  const ageRange = item.metrics?.institutions ? 'Ages 6 - 13 years' : 'All ages'

  // Format languages
  const languages = 'English, Spanish, Danish' // Default for demo

  return (
    <Card className={cn('flex h-full flex-col overflow-hidden', className)}>
      {/* Hero Image */}
      <div className="relative h-44 w-full bg-gray-100">
        {item.coverImageUrl ? (
          <Image
            src={item.coverImageUrl}
            alt={item.displayTitle}
            fill
            sizes="(min-width: 1024px) 320px, 100vw"
            className="object-cover"
            priority={false}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-500"
            style={{ backgroundColor: item.brandColor ?? '#EFEAFD' }}
          >
            {item.displayTitle}
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="flex flex-1 flex-col p-5 space-y-4">
        {/* Category Label */}
        <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">
          {category}
        </p>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 leading-tight">
          {item.displayTitle}
        </h3>

        {/* Description */}
        <div className="text-sm text-gray-600">
          <p className={cn(!isExpanded && 'line-clamp-2')}>
            {item.marketingTagline || item.description}
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
            <span>Explore Global Challenges</span>
          </div>
          <div className="flex items-center gap-2">
            <Users2 className="h-4 w-4 text-gray-400" />
            <span>{ageRange}</span>
          </div>
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-gray-400" />
            <span>{languages}</span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Created By Section */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {renderPartnerAvatar(hostName, hostLogo)}
              {supportingName && (
                <div className="ring-2 ring-white rounded-full">{renderPartnerAvatar(supportingName, supportingLogo)}</div>
              )}
            </div>
            <div className="text-xs">
              <p className="font-medium text-gray-900">
                {supportingName ? `${hostName} + ${supportingName}` : hostName}
              </p>
              <p className="text-gray-500">{location}</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col gap-2">
          {actions ? (
            actions
          ) : item.isPublic && onJoin && membershipStatus !== 'member' ? (
            <Button className="w-full bg-purple-600 text-white hover:bg-purple-700" onClick={onJoin}>
              Join program
            </Button>
          ) : membershipStatus === 'member' ? (
            <Button className="w-full bg-purple-600 text-white hover:bg-purple-700">
              View details
            </Button>
          ) : (
            <Button className="w-full" variant="outline" disabled>
              Invite required
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
