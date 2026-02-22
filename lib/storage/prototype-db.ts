import type {
  Partner,
  PartnerUser,
} from '@/lib/types/partner'
import type {
  Program,
  ProgramPartner,
  CountryCoordinator,
  EducationalInstitution,
  InstitutionTeacher,
  ProgramProject,
  ProgramProjectTemplate,
  ProgramInvitation,
  ProgramActivity,
} from '@/lib/types/program'
import type { ProgramResource } from '@/lib/types/resource'

// Local storage key – bump version when we need to invalidate older seeds
export const PROTOTYPE_STORAGE_KEY = 'class2class_prototype_db_v6'

export type StoredPartner = Omit<Partner, 'createdAt' | 'updatedAt'> & {
  createdAt: string
  updatedAt: string
}

export type StoredPartnerUser = Omit<PartnerUser, 'createdAt' | 'lastLoginAt'> & {
  createdAt: string
  lastLoginAt?: string
}

type PrototypeTables = {
  partners: StoredPartner[]
  partnerUsers: StoredPartnerUser[]
  programs: Program[]
  programPartners: ProgramPartner[]
  coordinators: CountryCoordinator[]
  institutions: EducationalInstitution[]
  institutionTeachers: InstitutionTeacher[]
  programProjects: ProgramProject[]
  programTemplates: ProgramProjectTemplate[]
  invitations: ProgramInvitation[]
  activities: ProgramActivity[]
  resources: ProgramResource[]
}

export type PrototypeTableKey = keyof PrototypeTables
export type PrototypeRecord<K extends PrototypeTableKey> =
  PrototypeTables[K] extends Array<infer T> ? T : never

export interface PrototypeDatabase extends PrototypeTables {
  metadata: {
    version: number
    seededAt: string | null
  }
}

const DEFAULT_DB: PrototypeDatabase = {
  partners: [],
  partnerUsers: [],
  programs: [],
  programPartners: [],
  coordinators: [],
  institutions: [],
  institutionTeachers: [],
  programProjects: [],
  programTemplates: [],
  invitations: [],
  activities: [],
  resources: [],
  metadata: {
    version: 5,
    seededAt: null,
  },
}

const isBrowser = (): boolean =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const clone = <T>(value: T): T =>
  JSON.parse(JSON.stringify(value)) as T

const mergeWithDefaults = (data: unknown): PrototypeDatabase => {
  const safe = clone(DEFAULT_DB)

  if (!data || typeof data !== 'object') {
    return safe
  }

  const parsed = data as Partial<PrototypeDatabase>

  for (const key of Object.keys(safe) as (keyof PrototypeDatabase)[]) {
    if (Array.isArray(safe[key])) {
      (safe as any)[key] = Array.isArray(parsed[key])
        ? clone(parsed[key])
        : []
    } else if (key === 'metadata') {
      safe.metadata = {
        ...safe.metadata,
        ...(typeof parsed.metadata === 'object' && parsed.metadata
          ? parsed.metadata
          : {}),
      }
    }
  }

  return safe
}

export const loadPrototypeDb = (): PrototypeDatabase => {
  if (!isBrowser()) {
    return clone(DEFAULT_DB)
  }

  try {
    const raw = window.localStorage.getItem(PROTOTYPE_STORAGE_KEY)
    if (!raw) {
      return clone(DEFAULT_DB)
    }

    const parsed = JSON.parse(raw)
    return mergeWithDefaults(parsed)
  } catch (error) {
    console.warn('Failed to load prototype database:', error)
    return clone(DEFAULT_DB)
  }
}

export const persistPrototypeDb = (db: PrototypeDatabase): void => {
  if (!isBrowser()) {
    return
  }

  try {
    window.localStorage.setItem(PROTOTYPE_STORAGE_KEY, JSON.stringify(db))
  } catch (error) {
    console.warn('Failed to persist prototype database:', error)
  }
}

const ensureId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `id_${Math.random().toString(36).slice(2, 10)}`
}

const stampRecord = <T extends Record<string, unknown>>(record: T): T => {
  const now = new Date().toISOString()

  if (!('createdAt' in record) || record.createdAt === undefined || record.createdAt === null) {
    ;(record as Record<string, unknown>).createdAt = now
  }

  if ('updatedAt' in record) {
    ;(record as Record<string, unknown>).updatedAt = now
  }

  return record
}

export type CreateInput<K extends PrototypeTableKey> =
  Partial<PrototypeRecord<K>> & Record<string, unknown>

export type UpdateInput<K extends PrototypeTableKey> = Partial<
  Omit<PrototypeRecord<K>, 'id' | 'createdAt' | 'updatedAt'>
>

export const getAll = <K extends PrototypeTableKey>(table: K): PrototypeRecord<K>[] => {
  const db = loadPrototypeDb()
  return clone(db[table]) as PrototypeRecord<K>[]
}

export const getById = <K extends PrototypeTableKey>(
  table: K,
  id: string,
): PrototypeRecord<K> | undefined => {
  const db = loadPrototypeDb()
  return clone((db[table] as any[]).find((item: any) => item.id === id)) as PrototypeRecord<K> | undefined
}

export const createRecord = <K extends PrototypeTableKey>(
  table: K,
  data: CreateInput<K>,
): PrototypeRecord<K> => {
  const db = loadPrototypeDb()
  const collection = db[table] as PrototypeRecord<K>[]

  const nextRecord = stampRecord({
    ...(data as any),
    id: (data as any).id ?? ensureId(),
  }) as PrototypeRecord<K>

  collection.push(nextRecord)
  persistPrototypeDb(db)

  return clone(nextRecord)
}

export const updateRecord = <K extends PrototypeTableKey>(
  table: K,
  id: string,
  updates: UpdateInput<K>,
): PrototypeRecord<K> | undefined => {
  const db = loadPrototypeDb()
  const collection = db[table] as PrototypeRecord<K>[]
  const index = collection.findIndex((item) => (item as any).id === id)

  if (index === -1) {
    return undefined
  }

  const current = collection[index]
  const nextRecord = stampRecord({
    ...(current as any),
    ...(updates as any),
    id,
  } as any) as PrototypeRecord<K>

  collection[index] = nextRecord
  persistPrototypeDb(db)

  return clone(nextRecord)
}

export const deleteRecord = <K extends PrototypeTableKey>(
  table: K,
  id: string,
): boolean => {
  const db = loadPrototypeDb()
  const collection = db[table] as PrototypeRecord<K>[]
  const initialLength = collection.length

  ;(db as any)[table] = (collection as any[]).filter((item: any) => item.id !== id)
  const didDelete = collection.length !== initialLength

  if (didDelete) {
    persistPrototypeDb(db)
  }

  return didDelete
}

export const resetPrototypeDb = (): void => {
  persistPrototypeDb(clone(DEFAULT_DB))
}

export const touchSeedMetadata = (): void => {
  const db = loadPrototypeDb()
  db.metadata.seededAt = new Date().toISOString()
  persistPrototypeDb(db)
}
