'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, BookOpen } from 'lucide-react'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { buildProgramCatalog } from '@/lib/programs/selectors'
import { ProgramCatalogCard } from '@/components/program/program-catalog-card'

// For demo - hardcoded school info
const SCHOOL_NAME = 'Ørestad Gymnasium'
const SCHOOL_CITY = 'Copenhagen'
const SCHOOL_COUNTRY = 'Denmark'

export default function SchoolProgramsPage() {
  const { ready: prototypeReady, database } = usePrototypeDb()

  const normalizedSchoolName = SCHOOL_NAME.trim().toLowerCase()
  const normalizedCity = SCHOOL_CITY.trim().toLowerCase()
  const normalizedCountry = SCHOOL_COUNTRY.trim().toLowerCase()

  const programCatalog = useMemo(() => {
    if (!prototypeReady || !database) return []

    const allCatalog = buildProgramCatalog(database)

    // Filter to only show programs the school is part of, or public programs
    const matchingInstitutions = database.institutions.filter((institution) => {
      const name = institution.name?.trim().toLowerCase()
      const city = institution.city?.trim().toLowerCase()
      const country = institution.country?.trim().toLowerCase()

      const nameMatch = normalizedSchoolName && name === normalizedSchoolName
      const cityMatch =
        normalizedCity &&
        city === normalizedCity &&
        (!normalizedCountry || country === normalizedCountry)

      return nameMatch || cityMatch
    })

    const programIds = new Set(matchingInstitutions.map((institution) => institution.programId))

    return allCatalog.filter((item) =>
      programIds.has(item.programId) || item.isPublic
    )
  }, [prototypeReady, database, normalizedSchoolName, normalizedCity, normalizedCountry])

  const isMemberOfProgram = (programId: string) => {
    if (!database) return false
    const matchingInstitutions = database.institutions.filter((institution) => {
      const name = institution.name?.trim().toLowerCase()
      return name === normalizedSchoolName && institution.programId === programId
    })
    return matchingInstitutions.length > 0
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Programs</h1>
            <p className="text-sm text-gray-600">
              Explore partner programs and join collaborative projects worldwide.
            </p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700" asChild>
            <Link href="/discover">
              <Plus className="mr-2 h-4 w-4" />
              Join another program
            </Link>
          </Button>
        </div>
      </div>

      {/* Programs Grid */}
      {!prototypeReady ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-gray-500">
            Loading programs…
          </CardContent>
        </Card>
      ) : programCatalog.length === 0 ? (
        <Card className="border-dashed border-purple-200">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <BookOpen className="h-12 w-12 text-purple-300" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">You haven't joined a program yet</h3>
              <p className="mt-1 text-sm text-gray-600">
                Browse the catalog and connect your classrooms with partners worldwide.
              </p>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700" asChild>
              <Link href="/discover">Explore programs</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programCatalog.map((item) => {
            const isMember = isMemberOfProgram(item.programId)
            return (
              <ProgramCatalogCard
                key={item.programId}
                item={item}
                membershipStatus={isMember ? 'member' : item.isPublic ? 'available' : 'invite-only'}
                actions={
                  <>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/discover/programs/${item.programId}`}>View Details</Link>
                    </Button>
                    {!isMember && item.isPublic && (
                      <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                        <Link href={`/discover/programs/${item.programId}?join=1`}>
                          <Plus className="mr-2 h-4 w-4" />
                          Join Program
                        </Link>
                      </Button>
                    )}
                    {isMember && (
                      <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                        <Link href={`/discover/programs/${item.programId}?join=1`}>
                          Go to Workspace
                        </Link>
                      </Button>
                    )}
                  </>
                }
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
