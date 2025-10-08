import * as React from 'react'

import {
  loadPrototypeDb,
  createRecord as storageCreateRecord,
  updateRecord as storageUpdateRecord,
  deleteRecord as storageDeleteRecord,
  resetPrototypeDb,
  PROTOTYPE_STORAGE_KEY,
} from '@/lib/storage/prototype-db'
import type {
  PrototypeDatabase,
  PrototypeTableKey,
  PrototypeRecord,
  CreateInput,
  UpdateInput,
  StoredPartner,
} from '@/lib/storage/prototype-db'
import { seedPrototypeDb } from '@/lib/storage/seeds'
import type { ProgramPartner, CountryCoordinator, EducationalInstitution, InstitutionTeacher, ProgramInvitation } from '@/lib/types/program'

interface UsePrototypeDbResult {
  ready: boolean
  database: PrototypeDatabase | null
  refresh: () => void
  reset: () => void
  createRecord: <K extends PrototypeTableKey>(table: K, data: CreateInput<K>) => PrototypeRecord<K>
  updateRecord: <K extends PrototypeTableKey>(table: K, id: string, updates: UpdateInput<K>) => PrototypeRecord<K> | undefined
  deleteRecord: <K extends PrototypeTableKey>(table: K, id: string) => boolean
  selectors: {
    programsForPartner: (partnerId: string) => PrototypeDatabase['programs']
    coPartnersForProgram: (programId: string) => Array<{
      partner: StoredPartner | undefined
      relationship: ProgramPartner
    }>
    coordinatorsForProgram: (programId: string) => CountryCoordinator[]
    institutionsForProgram: (programId: string) => EducationalInstitution[]
    teachersForProgram: (programId: string) => InstitutionTeacher[]
    templatesForProgram: (programId: string) => PrototypeDatabase['programTemplates']
    invitationsForProgram: (programId: string, invitationType?: ProgramInvitation['invitationType']) => ProgramInvitation[]
  }
}

const useIsClient = () => {
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(typeof window !== 'undefined')
  }, [])

  return isClient
}

export function usePrototypeDb(): UsePrototypeDbResult {
  const isClient = useIsClient()
  const [database, setDatabase] = React.useState<PrototypeDatabase | null>(null)

  const load = React.useCallback(() => {
    setDatabase(loadPrototypeDb())
  }, [])

  React.useEffect(() => {
    if (!isClient) return

    // Seed the prototype database (no-op if already seeded)
    const { database: seededDb } = seedPrototypeDb()
    setDatabase(seededDb)

    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key !== PROTOTYPE_STORAGE_KEY) {
        return
      }
      load()
    }

    window.addEventListener('storage', handleStorage)

    // Ensure latest state in case another tab updated before listener registered
    load()

    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [isClient, load])

  const refresh = React.useCallback(() => {
    load()
  }, [load])

  const reset = React.useCallback(() => {
    resetPrototypeDb()
    seedPrototypeDb({ force: true })
    load()
  }, [load])

  const create = React.useCallback(
    <K extends PrototypeTableKey>(table: K, data: CreateInput<K>) => {
      const record = storageCreateRecord(table, data)
      load()
      return record
    },
    [load],
  )

  const update = React.useCallback(
    <K extends PrototypeTableKey>(table: K, id: string, updates: UpdateInput<K>) => {
      const record = storageUpdateRecord(table, id, updates)
      load()
      return record
    },
    [load],
  )

  const remove = React.useCallback(
    <K extends PrototypeTableKey>(table: K, id: string) => {
      const didDelete = storageDeleteRecord(table, id)
      if (didDelete) {
        load()
      }
      return didDelete
    },
    [load],
  )

  const selectors = React.useMemo(() => {
    const programs = database?.programs ?? []
    const programPartners = database?.programPartners ?? []
    const partners = database?.partners ?? []
    const coordinators = database?.coordinators ?? []
    const institutions = database?.institutions ?? []
    const teachers = database?.institutionTeachers ?? []
    const invitations = database?.invitations ?? []
    const templates = database?.programTemplates ?? []

    return {
      programsForPartner: (partnerId: string) =>
        programs.filter((program) => program.partnerId === partnerId),
      coPartnersForProgram: (programId: string) =>
        programPartners
          .filter((relationship) => relationship.programId === programId)
          .map((relationship) => ({
            relationship,
            partner: partners.find((partner) => partner.id === relationship.partnerId),
          })),
      coordinatorsForProgram: (programId: string) =>
        coordinators.filter((coordinator) => coordinator.programId === programId),
      institutionsForProgram: (programId: string) =>
        institutions.filter((institution) => institution.programId === programId),
      teachersForProgram: (programId: string) =>
        teachers.filter((teacher) => teacher.programId === programId),
      templatesForProgram: (programId: string) =>
        templates.filter((template) => template.programId === programId),
      invitationsForProgram: (programId: string, invitationType?: ProgramInvitation['invitationType']) =>
        invitations.filter((invitation) => {
          if (invitation.programId !== programId) return false
          if (invitationType) {
            return invitation.invitationType === invitationType
          }
          return true
        }),
    }
  }, [database])

  return {
    ready: Boolean(database),
    database,
    refresh,
    reset,
    createRecord: create,
    updateRecord: update,
    deleteRecord: remove,
    selectors,
  }
}
