'use client'

import { type ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface ProfilePageHeaderProps {
  title: string
  description: ReactNode
  action?: ReactNode
  className?: string
}

export function ProfilePageHeader({
  title,
  description,
  action,
  className,
}: ProfilePageHeaderProps) {
  return (
    <header className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        {action}
      </div>
    </header>
  )
}
