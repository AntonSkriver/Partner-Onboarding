'use client'

import { Link } from '@/i18n/navigation'
import { useCallback, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, BookOpen } from 'lucide-react'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { buildProgramCatalog } from '@/lib/programs/selectors'
import { ProgramCatalogCard } from '@/components/program/program-catalog-card'
import { useTranslations } from 'next-intl'
import { getCurrentSession } from '@/lib/auth/session'

export default function SchoolProgramsPage() {
  const t = useTranslations('programs')
  const tc = useTranslations('common')
  const { ready: prototypeReady, database } = usePrototypeDb()
  const session = getCurrentSession()
  const normalizedSchoolName = session?.organization?.trim().toLowerCase() ?? ''
  const normalizedEmail = session?.email?.toLowerCase()
  const activeInstitutionId =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('activeInstitutionId')
      : null
  const activeProgramIds: string[] = useMemo(() => {
    if (typeof window === 'undefined') return []
    return JSON.parse(window.localStorage.getItem('activeProgramIds') || '[]')
  }, [])
  const rawNewlyInvited =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('isNewlyInvitedSchool') === 'true'
      : false

  const matchesCurrentSchool = useCallback((institution: { id?: string; name?: string | null; contactEmail?: string | null }) => {
    if (activeInstitutionId && institution.id === activeInstitutionId) return true
    const name = institution.name?.trim().toLowerCase()
    const email = institution.contactEmail?.toLowerCase()
    const nameMatch = normalizedSchoolName && name === normalizedSchoolName
    const emailMatch = normalizedEmail && email === normalizedEmail
    return nameMatch || emailMatch
  }, [normalizedSchoolName, normalizedEmail, activeInstitutionId])

  const programCatalog = useMemo(() => {
    if (!prototypeReady || !database) return []

    const allCatalog = buildProgramCatalog(database, { includePrivate: true })

    // Filter to only show programs the school is part of, or public programs
    const matchingInstitutions = database.institutions.filter((institution) => {
      return matchesCurrentSchool(institution)
    })

    const programIds = new Set(matchingInstitutions.map((institution) => institution.programId))
    const invitedPartnerIds = new Set<string>()

    programIds.forEach((programId) => {
      const hostProgram = database.programs.find((program) => program.id === programId)
      if (hostProgram?.partnerId) {
        invitedPartnerIds.add(hostProgram.partnerId)
      }
    })

    const assignedProgramIds = new Set([
      ...programIds,
      ...activeProgramIds,
    ])

    const isNewlyInvitedSchool =
      rawNewlyInvited && activeProgramIds.length > 0 && programIds.size <= activeProgramIds.length

    // If school was just invited (via invite flow), only show the invited program(s)
    // Don't show all public programs or partner programs to newly invited schools
    if (isNewlyInvitedSchool && activeProgramIds.length > 0) {
      const invitedOnly = new Set(activeProgramIds)
      return allCatalog.filter((item) => invitedOnly.has(item.programId))
    }

    // For established schools, show their programs + public + partner programs
    return allCatalog.filter((item) =>
      assignedProgramIds.has(item.programId) ||
      item.isPublic ||
      (item.hostPartner && invitedPartnerIds.has(item.hostPartner.id))
    )
  }, [prototypeReady, database, matchesCurrentSchool, activeProgramIds, rawNewlyInvited])

  const isMemberOfProgram = (programId: string) => {
    if (!database) return false
    if (activeProgramIds.length && activeProgramIds.includes(programId)) return true
    return database.institutions.some(
      (institution) =>
        matchesCurrentSchool(institution) &&
        institution.programId === programId &&
        institution.status === 'active',
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">{t('title')}</h1>
            <p className="text-sm text-gray-600">
              {t('subtitleSchool')}
            </p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700" asChild>
            <Link href="/discover">
              <Plus className="mr-2 h-4 w-4" />
              {t('joinAnotherProgram')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Programs Grid */}
      {!prototypeReady ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-gray-500">
            {t('loadingPrograms')}
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
              <Link href="/discover">{t('explorePrograms')}</Link>
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
                      <Link href={`/school/dashboard/programs/${item.programId}`}>{t('viewDetails')}</Link>
                    </Button>
                    {!isMember && item.isPublic && (
                      <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                        <Link href={`/discover/programs/${item.programId}?join=1`}>
                          <Plus className="mr-2 h-4 w-4" />
                          {t('joinProgram')}
                        </Link>
                      </Button>
                    )}
                    {isMember && (
                      <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                        <Link href={`/discover/programs/${item.programId}?join=1`}>
                          {t('goToWorkspace')}
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
