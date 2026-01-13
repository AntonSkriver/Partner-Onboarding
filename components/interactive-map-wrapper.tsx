'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import type { CountryData } from './interactive-map'

// Dynamically import the map component with no SSR
const InteractiveMap = dynamic(
  () => import('./interactive-map').then((mod) => mod.InteractiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-xl">
        <div className="text-center space-y-3">
          <Skeleton className="h-48 w-64 mx-auto rounded-lg" />
          <Skeleton className="h-4 w-32 mx-auto" />
          <p className="text-sm text-gray-500">Loading interactive map...</p>
        </div>
      </div>
    ),
  }
)

interface InteractiveMapWrapperProps {
  countries: CountryData[]
  onCountrySelect?: (country: CountryData | null) => void
}

export function InteractiveMapWrapper({ countries, onCountrySelect }: InteractiveMapWrapperProps) {
  return <InteractiveMap countries={countries} onCountrySelect={onCountrySelect} />
}

export type { CountryData }
