'use client'

import { Link } from '@/i18n/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TabsContent } from '@/components/ui/tabs'
import {
  Users,
  Edit,
  Plus,
} from 'lucide-react'
import type { ProgramCatalogItem } from '@/lib/programs/selectors'
import { ProgramCatalogCard } from '../../program/program-catalog-card'

interface ProgramsTabProps {
  isOwnProfile: boolean
  programDataLoading: boolean
  programCatalog: ProgramCatalogItem[]
}

export function ProgramsTab({
  isOwnProfile,
  programDataLoading,
  programCatalog,
}: ProgramsTabProps) {
  return (
    <TabsContent value="programs" className="space-y-6">
      {/* Create Program Button - shown when there are programs */}
      {isOwnProfile && programCatalog.length > 0 && (
        <div className="flex justify-end">
          <Button className="bg-purple-600 hover:bg-purple-700" asChild>
            <Link href="/partner/programs/create">
              <Plus className="w-4 h-4 mr-2" />
              Create Program
            </Link>
          </Button>
        </div>
      )}

      {programDataLoading ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-gray-500">
            Loading programs…
          </CardContent>
        </Card>
      ) : programCatalog.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programCatalog.map((item) => (
            <ProgramCatalogCard
              key={item.programId}
              item={item}
              actions={
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/partner/programs/${item.programId}`}>View Details</Link>
                  </Button>
                  {isOwnProfile && (
                    <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                      <Link href={`/partner/programs/${item.programId}/edit`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Program
                      </Link>
                    </Button>
                  )}
                </>
              }
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-10 text-center space-y-4">
            <Users className="w-12 h-12 text-gray-400 mx-auto" />
            <h3 className="text-lg font-medium text-gray-900">No Programs Yet</h3>
            <p className="text-gray-500">
              Create your first program to start collaborating with schools worldwide.
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700" asChild>
              <Link href="/partner/programs/create">
                <Plus className="w-4 h-4 mr-2" />
                Create Program
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </TabsContent>
  )
}
