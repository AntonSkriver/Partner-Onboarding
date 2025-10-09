'use client'

import { useEffect, useMemo, useState } from 'react'

import { usePrototypeDb } from '@/hooks/use-prototype-db'
import {
  findProgramSummaryById,
  type ProgramSummary,
} from '@/lib/programs/selectors'
import {
  type InstitutionTeacher,
  type EducationalInstitution,
} from '@/lib/types/program'
import {
  getCurrentSession,
  type UserSession,
} from '@/lib/auth/session'

export interface TeacherContext {
  ready: boolean
  session: UserSession | null
  teacherEmail: string
  memberships: InstitutionTeacher[]
  membershipIds: Set<string>
  myProgramIds: Set<string>
  programSummaries: ProgramSummary[]
  programsById: Map<string, ProgramSummary>
  myInstitutions: EducationalInstitution[]
  database: ReturnType<typeof usePrototypeDb>['database']
}

export function useTeacherContext(): TeacherContext {
  const { ready, database } = usePrototypeDb()
  const [session, setSession] = useState<UserSession | null>(null)

  useEffect(() => {
    setSession(getCurrentSession())
  }, [])

  const teacherEmail = useMemo(() => session?.email?.toLowerCase().trim() ?? '', [session?.email])

  const memberships = useMemo<InstitutionTeacher[]>(() => {
    if (!database || !teacherEmail) return []
    return database.institutionTeachers.filter(
      (teacher) => teacher.email.toLowerCase() === teacherEmail,
    )
  }, [database, teacherEmail])

  const membershipIds = useMemo(() => new Set(memberships.map((membership) => membership.id)), [
    memberships,
  ])

  const myProgramIds = useMemo(
    () => new Set(memberships.map((membership) => membership.programId)),
    [memberships],
  )

  const programSummaries = useMemo<ProgramSummary[]>(() => {
    if (!database) return []

    const map = new Map<string, ProgramSummary>()
    memberships.forEach((membership) => {
      const summary = findProgramSummaryById(database, membership.programId)
      if (summary) {
        map.set(summary.program.id, summary)
      }
    })
    return Array.from(map.values())
  }, [database, memberships])

  const programsById = useMemo(() => {
    const map = new Map<string, ProgramSummary>()
    programSummaries.forEach((summary) => {
      map.set(summary.program.id, summary)
    })
    return map
  }, [programSummaries])

  const myInstitutions = useMemo<EducationalInstitution[]>(() => {
    if (!database) return []
    const map = new Map<string, EducationalInstitution>()
    memberships.forEach((membership) => {
      const institution = database.institutions.find(
        (entry) => entry.id === membership.institutionId,
      )
      if (institution) {
        map.set(institution.id, institution)
      }
    })
    return Array.from(map.values())
  }, [database, memberships])

  return {
    ready,
    database,
    session,
    teacherEmail,
    memberships,
    membershipIds,
    myProgramIds,
    programSummaries,
    programsById,
    myInstitutions,
  }
}
