'use client'

import Image from 'next/image'
import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ProgramCatalogItem } from '@/lib/programs/selectors'
import { Button } from '@/components/ui/button'

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
      <Image
        src={logo}
        alt={name ?? 'Partner logo'}
        width={28}
        height={28}
        className="h-7 w-7 rounded-full object-cover border border-gray-200 bg-white"
      />
    )
  }

  if (!name) {
    return (
      <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
        —
      </div>
    )
  }

  return (
    <div className="h-7 w-7 rounded-full bg-purple-100 flex items-center justify-center text-xs font-semibold text-purple-700">
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
  const hostName = item.hostPartner?.organizationName ?? 'Partner'
  const supportingName = item.supportingPartner?.organizationName
  const logoStack = [item.hostPartner, item.supportingPartner].filter(Boolean) as typeof item.hostPartner[]

  const membershipBadge =
    membershipStatus === 'member'
      ? { label: 'You\'re enrolled', className: 'bg-purple-600 text-white' }
      : membershipStatus === 'invite-only'
        ? { label: 'Invite required', className: 'bg-amber-100 text-amber-700' }
        : membershipStatus === 'available'
          ? { label: 'Open to join', className: 'bg-green-100 text-green-700' }
          : null

  return (
    <Card className={cn('flex h-full flex-col overflow-hidden', className)}>
      <div className="relative h-40 w-full bg-gray-100">
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

      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {item.logo ? (
              <Image
                src={item.logo}
                alt={`${item.displayTitle} logo`}
                width={100}
                height={100}
                className={cn(
                  'w-auto object-contain',
                  item.logo.includes('communities-in-focus') ? 'h-9' : 'h-10'
                )}
              />
            ) : (
              <>
                {logoStack.map((partner, index) => (
                  <div
                    key={partner?.id ?? index}
                    className={cn(
                      'rounded-full border border-white shadow-sm',
                      index > 0 && '-ml-2',
                    )}
                  >
                    {renderPartnerAvatar(
                      partner?.organizationName,
                      partner?.logo,
                    )}
                  </div>
                ))}
                <span className="text-xs text-gray-500">
                  {supportingName ? `${hostName} x ${supportingName}` : hostName}
                </span>
              </>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 text-xs">
            <Badge
              variant="outline"
              className={item.isPublic ? 'border-green-200 bg-green-50 text-green-700' : 'border-purple-200 bg-purple-50 text-purple-700'}
            >
              {item.isPublic ? 'Public program' : 'Invite-only'}
            </Badge>
            {membershipBadge && (
              <Badge className={membershipBadge.className}>{membershipBadge.label}</Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <CardTitle className="text-lg leading-tight text-gray-900">
            {item.displayTitle}
          </CardTitle>
          {item.marketingTagline ? (
            <p className="text-sm text-gray-600">{item.marketingTagline}</p>
          ) : (
            <p className="text-sm text-gray-600 line-clamp-3">{item.description}</p>
          )}
        </div>
      </CardHeader>

      <CardContent className="mt-auto space-y-4">
        <div className="flex flex-col gap-2">
          {actions}
          {item.isPublic && onJoin && membershipStatus !== 'member' && (
            <Button className="w-full bg-purple-600 text-white hover:bg-purple-700" onClick={onJoin}>
              Join program
            </Button>
          )}
          {!item.isPublic && membershipStatus !== 'member' && !actions && (
            <Button className="w-full" variant="ghost" disabled>
              Invite required
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
