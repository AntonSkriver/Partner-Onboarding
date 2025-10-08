'use client'

import Image from 'next/image'
import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ProgramCatalogItem } from '@/lib/programs/selectors'

interface ProgramCatalogCardProps {
  item: ProgramCatalogItem
  className?: string
  actions?: ReactNode
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

const formatCount = (value: number | undefined): string => {
  if (!value) return '0'
  return value.toLocaleString()
}

export function ProgramCatalogCard({ item, className, actions }: ProgramCatalogCardProps) {
  const hostName = item.hostPartner?.organizationName ?? 'Partner'
  const supportingName = item.supportingPartner?.organizationName
  const logoStack = [item.hostPartner, item.supportingPartner].filter(Boolean) as typeof item.hostPartner[]

  const stats = [
    { label: 'Teacher projects', value: item.metrics.activeProjects },
    { label: 'Templates', value: item.metrics.templates },
    { label: 'Countries', value: item.metrics.countries },
  ]

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

      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
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
      </div>
          {item.startMonthLabel && (
            <Badge variant="secondary" className="text-xs">
              Starts {item.startMonthLabel}
            </Badge>
          )}
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
        <div className="flex items-center justify-between text-xs text-gray-500">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-semibold text-gray-900">{formatCount(stat.value)}</div>
              <div>{stat.label}</div>
            </div>
          ))}
        </div>
        {actions}
      </CardContent>
    </Card>
  )
}
