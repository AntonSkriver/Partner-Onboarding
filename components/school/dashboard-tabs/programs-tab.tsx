'use client'

import { Link } from '@/i18n/navigation'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TabsContent } from '@/components/ui/tabs'
import {
  BookOpen,
  Plus,
} from 'lucide-react'
import type { ProgramSummary, ProgramCatalogItem } from '@/lib/programs/selectors'
import { ProgramCatalogCard } from '@/components/program/program-catalog-card'

interface ProgramsTabProps {
  prototypeReady: boolean
  programCatalog: ProgramCatalogItem[]
  programSummaries: ProgramSummary[]
}

export function ProgramsTab({
  prototypeReady,
  programCatalog,
  programSummaries,
}: ProgramsTabProps) {
  return (
    <TabsContent value="programs" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Programs your school joins</h3>
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
              <h3 className="text-lg font-semibold text-gray-900">You haven&apos;t joined a program yet</h3>
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
            // Check if school is already a member
            const isMember = programSummaries.some(s => s.program.id === item.programId)
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
                          <Plus className="w-4 h-4 mr-2" />
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
    </TabsContent>
  )
}
