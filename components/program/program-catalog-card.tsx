'use client'

import Image from 'next/image'
import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
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
    item.hostPartner?.country || 'Copenhagen'

  const collaborationLabels: Record<string, string> = {
    explore_global_challenges: 'Explore Global Challenges',
    cultural_exchange: 'Explore Cultures',
    create_solutions: 'Explore Solutions',
  }

  const category =
    item.projectTypes && item.projectTypes.length > 0
      ? collaborationLabels[item.projectTypes[0]] ?? 'Explore Global Challenges'
      : 'Explore Global Challenges'

  const formatAgeRange = (range?: string): string => {
    if (!range) return 'All ages'
    if (range === '18+') return 'Ages 18+'
    const [start, end] = range.split('-')
    if (!end) return `Ages ${start}`
    return `Ages ${start} - ${end} years`
  }

  const ageRange =
    item.targetAgeRanges && item.targetAgeRanges.length > 0
      ? formatAgeRange(item.targetAgeRanges[0])
      : 'All ages'

  // Format languages
  const languageNames: Record<string, string> = {
    en: 'English',
    da: 'Danish',
    es: 'Spanish',
    fr: 'French',
    it: 'Italian',
    pt: 'Portuguese',
  }
  const languages =
    item.languages && item.languages.length > 0
      ? item.languages
          .map((code) => languageNames[code.toLowerCase()] ?? code.toUpperCase())
          .filter(Boolean)
          .join(', ')
      : 'English'

  const isUnicef = hostName?.toLowerCase().includes('unicef')
  const isSaveTheChildren = hostName?.toLowerCase().includes('save the children') ||
    item.displayTitle?.toLowerCase().includes('save the children') ||
    item.displayTitle?.toLowerCase().includes('build the change')

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

        {/* UNICEF Ribbon Banner */}
        {isUnicef && (
          <motion.div
            className="pointer-events-none absolute top-0 right-0 z-10 overflow-hidden w-28 h-28"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="absolute top-[16px] -right-[30px] w-[140px] bg-gradient-to-r from-[#00AEEF] via-[#29B6F6] to-[#00AEEF] py-2 rotate-45 shadow-lg flex items-center justify-center"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.2 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
              />
              <div className="relative z-10 flex items-center gap-1.5">
                <Image
                  src="/partners/unicef-logo.png"
                  alt="UNICEF"
                  width={26}
                  height={26}
                  className="drop-shadow-sm brightness-0 invert"
                />
                <span className="text-white text-[10px] font-bold tracking-wider drop-shadow-sm">UNICEF</span>
              </div>
            </motion.div>
            <div className="absolute top-[42px] right-0 w-0 h-0 border-l-[6px] border-l-[#0277BD] border-b-[6px] border-b-transparent" />
            <div className="absolute top-0 right-[42px] w-0 h-0 border-t-[6px] border-t-transparent border-r-[6px] border-r-[#0277BD]" />
          </motion.div>
        )}

        {/* Save the Children Ribbon Banner */}
        {isSaveTheChildren && (
          <motion.div
            className="pointer-events-none absolute top-0 right-0 z-10 overflow-hidden w-28 h-28"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="absolute top-[16px] -right-[30px] w-[140px] bg-gradient-to-r from-[#E31B23] via-[#FF3B3B] to-[#E31B23] py-2 rotate-45 shadow-lg flex items-center justify-center"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.2 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
              />
              <div className="relative z-10 flex items-center gap-1">
                <Image
                  src="/partners/save-the-children-logo.png"
                  alt="Save the Children"
                  width={24}
                  height={24}
                  className="drop-shadow-sm brightness-0 invert"
                />
                <div className="flex flex-col leading-none">
                  <span className="text-white text-[7px] font-bold tracking-wide drop-shadow-sm">Save the</span>
                  <span className="text-white text-[7px] font-bold tracking-wide drop-shadow-sm">Children</span>
                </div>
              </div>
            </motion.div>
            <div className="absolute top-[42px] right-0 w-0 h-0 border-l-[6px] border-l-[#B71C1C] border-b-[6px] border-b-transparent" />
            <div className="absolute top-0 right-[42px] w-0 h-0 border-t-[6px] border-t-transparent border-r-[6px] border-r-[#B71C1C]" />
          </motion.div>
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
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
              {ageRange}
            </span>
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
