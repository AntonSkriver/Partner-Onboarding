// Session storage utility for temporary data persistence
// This replaces Supabase database operations with in-memory session storage

type StoredRecord = Record<string, unknown>

interface SessionUser {
  id: string
  email: string
  user_metadata: Record<string, unknown>
}

interface SessionData {
  schools: StoredRecord[]
  organizations: StoredRecord[]
  teachers: StoredRecord[]
  collaborations: StoredRecord[]
  invitations: StoredRecord[]
  activities: StoredRecord[]
  user: SessionUser | null
  currentSession: string | null
}

interface QueryResult<T = StoredRecord | StoredRecord[] | null> {
  data: T
  error: unknown
}

class SessionStorage {
  private static instance: SessionStorage
  private data: SessionData

  private constructor() {
    this.data = this.loadFromStorage()
  }

  public static getInstance(): SessionStorage {
    if (!SessionStorage.instance) {
      SessionStorage.instance = new SessionStorage()
    }
    return SessionStorage.instance
  }

  private loadFromStorage(): SessionData {
    if (typeof window === 'undefined') {
      return this.getDefaultData()
    }

    try {
      const stored = window.sessionStorage.getItem('partnerOnboardingData')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load session data:', error)
    }

    return this.getDefaultData()
  }

  private getDefaultData(): SessionData {
    return {
      schools: [],
      organizations: [],
      teachers: [],
      collaborations: [],
      invitations: [],
      activities: [],
      user: null,
      currentSession: null
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return

    try {
      window.sessionStorage.setItem('partnerOnboardingData', JSON.stringify(this.data))
    } catch (error) {
      console.warn('Failed to save session data:', error)
    }
  }

  // Generic CRUD operations
  public insert(table: keyof SessionData, item: StoredRecord): QueryResult<StoredRecord> {
    if (!Array.isArray(this.data[table])) {
      throw new Error(`Table ${table} is not a collection`)
    }

    const collection = this.data[table] as StoredRecord[]
    const newItem: StoredRecord = {
      ...item,
      id: (item.id as string) || this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    collection.push(newItem)
    this.saveToStorage()
    return { data: newItem, error: null }
  }

  public select(table: keyof SessionData, options: {
    eq?: { field: string; value: unknown }
    contains?: { field: string; value: unknown }
    overlaps?: { field: string; value: unknown[] }
    ilike?: { field: string; value: string }
    in?: { field: string; value: unknown[] }
    or?: string
    order?: string
    limit?: number
    single?: boolean
  } = {}): QueryResult {
    if (!Array.isArray(this.data[table])) {
      return { data: this.data[table] as StoredRecord | null, error: null }
    }

    let collection = [...(this.data[table] as StoredRecord[])]

    // Apply filters
    if (options.eq) {
      collection = collection.filter(item => item[options.eq!.field] === options.eq!.value)
    }

    if (options.contains) {
      collection = collection.filter(item => {
        const fieldValue = item[options.contains!.field]
        if (typeof fieldValue === 'object' && fieldValue !== null) {
          return JSON.stringify(fieldValue).includes(JSON.stringify(options.contains!.value))
        }
        return false
      })
    }

    if (options.overlaps) {
      collection = collection.filter(item => {
        const fieldValue = item[options.overlaps!.field]
        if (Array.isArray(fieldValue)) {
          return options.overlaps!.value.some(val => fieldValue.includes(val))
        }
        return false
      })
    }

    if (options.ilike) {
      collection = collection.filter(item => {
        const fieldValue = item[options.ilike!.field]
        if (typeof fieldValue === 'string') {
          return fieldValue.toLowerCase().includes(options.ilike!.value.replace(/%/g, '').toLowerCase())
        }
        return false
      })
    }

    if (options.in) {
      collection = collection.filter(item =>
        options.in!.value.includes(item[options.in!.field])
      )
    }

    if (options.or) {
      // Simple OR implementation for name.ilike and description.ilike patterns
      const orConditions = options.or.split(',')
      collection = collection.filter(item => {
        return orConditions.some(condition => {
          const [field, operator, value] = condition.split('.')
          if (operator === 'ilike') {
            const fieldValue = item[field]
            if (typeof fieldValue === 'string') {
              return fieldValue.toLowerCase().includes(value.replace(/%/g, '').toLowerCase())
            }
          }
          return false
        })
      })
    }

    // Apply ordering
    if (options.order) {
      const orderField = options.order.replace(/\s+(asc|desc)$/i, '')
      const isDesc = /desc$/i.test(options.order)

      collection.sort((a, b) => {
        const aVal = a[orderField]
        const bVal = b[orderField]

        if ((aVal as string) < (bVal as string)) return isDesc ? 1 : -1
        if ((aVal as string) > (bVal as string)) return isDesc ? -1 : 1
        return 0
      })
    }

    // Apply limit
    if (options.limit) {
      collection = collection.slice(0, options.limit)
    }

    // Return single item or array
    if (options.single) {
      return { data: collection[0] || null, error: null }
    }

    return { data: collection, error: null }
  }

  public update(table: keyof SessionData, updates: StoredRecord, options: {
    eq?: { field: string; value: unknown }
  }): QueryResult<StoredRecord | null> {
    if (!Array.isArray(this.data[table])) {
      throw new Error(`Table ${table} is not a collection`)
    }

    const collection = this.data[table] as StoredRecord[]
    let updatedItem: StoredRecord | null = null

    if (options.eq) {
      const index = collection.findIndex(item => item[options.eq!.field] === options.eq!.value)
      if (index !== -1) {
        collection[index] = {
          ...collection[index],
          ...updates,
          updated_at: new Date().toISOString()
        }
        updatedItem = collection[index]
      }
    }

    this.saveToStorage()
    return { data: updatedItem, error: null }
  }

  public delete(table: keyof SessionData, options: {
    eq?: { field: string; value: unknown }
  }): QueryResult<null> {
    if (!Array.isArray(this.data[table])) {
      throw new Error(`Table ${table} is not a collection`)
    }

    const collection = this.data[table] as StoredRecord[]

    if (options.eq) {
      const index = collection.findIndex(item => item[options.eq!.field] === options.eq!.value)
      if (index !== -1) {
        collection.splice(index, 1)
      }
    }

    this.saveToStorage()
    return { data: null, error: null }
  }

  // RPC functions simulation
  public rpc(_functionName: string, _params: unknown): Promise<QueryResult<null>> {
    // Just return success for activity logging and other RPC calls
    return Promise.resolve({ data: null, error: null })
  }

  // Helper methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  public clearSession(): void {
    this.data = this.getDefaultData()
    this.saveToStorage()
  }

  public setUser(user: SessionUser): void {
    this.data.user = user
    this.data.currentSession = this.generateId()
    this.saveToStorage()
  }

  public getUser(): SessionUser | null {
    // Try to get user from existing session system
    if (typeof window !== 'undefined') {
      const sessionData = localStorage.getItem('class2class_session')
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData)
          return {
            id: session.email,
            email: session.email,
            user_metadata: {
              name: session.name,
              organization: session.organization,
              role: session.role
            }
          }
        } catch (error) {
          console.warn('Failed to parse session data:', error)
        }
      }
    }
    return this.data.user
  }

  public signOut(): void {
    this.data.user = null
    this.data.currentSession = null
    this.saveToStorage()

    // Also clear the existing session system
    if (typeof window !== 'undefined') {
      localStorage.removeItem('class2class_session')
    }
  }
}

// Query builder class to handle chained operations
interface QueryOptions {
  eqFilters?: { field: string; value: unknown }[]
  contains?: { field: string; value: unknown }
  overlaps?: { field: string; value: unknown[] }
  ilike?: { field: string; value: string }
  in?: { field: string; value: unknown[] }
  or?: string
  order?: string
  limit?: number
  single?: boolean
}

class QueryBuilder {
  private storage: SessionStorage
  private table: string
  private queryOptions: QueryOptions = {}

  constructor(storage: SessionStorage, table: string, _fields: string = '*') {
    this.storage = storage
    this.table = table
  }

  eq(field: string, value: unknown) {
    // Support multiple eq calls by storing them as an array
    if (!this.queryOptions.eqFilters) {
      this.queryOptions.eqFilters = []
    }
    this.queryOptions.eqFilters.push({ field, value })
    return this
  }

  contains(field: string, value: unknown) {
    this.queryOptions.contains = { field, value }
    return this
  }

  overlaps(field: string, value: unknown[]) {
    this.queryOptions.overlaps = { field, value }
    return this
  }

  or(condition: string) {
    this.queryOptions.or = condition
    return this
  }

  ilike(field: string, value: string) {
    this.queryOptions.ilike = { field, value }
    return this
  }

  in(field: string, value: unknown[]) {
    this.queryOptions.in = { field, value }
    return this
  }

  order(orderField: string, options?: { ascending?: boolean }) {
    this.queryOptions.order = `${orderField}${options?.ascending === false ? ' desc' : ''}`
    return this
  }

  limit(count: number) {
    this.queryOptions.limit = count
    return this
  }

  single() {
    this.queryOptions.single = true
    return this.executeQuery()
  }

  then(onResolve: (value: QueryResult) => unknown, onReject?: (reason: unknown) => unknown) {
    return this.executeQuery().then(onResolve, onReject)
  }

  private async executeQuery(): Promise<QueryResult> {
    // Apply multiple eq filters
    let collection = this.storage.select(this.table as keyof SessionData, {}).data
    if (!Array.isArray(collection)) {
      collection = []
    }

    // Apply eq filters (multiple conditions with AND logic)
    if (this.queryOptions.eqFilters) {
      collection = collection.filter((item: StoredRecord) => {
        return this.queryOptions.eqFilters!.every((filter) =>
          item[filter.field] === filter.value
        )
      })
    }

    // Apply other filters
    if (this.queryOptions.contains) {
      const { field, value } = this.queryOptions.contains
      collection = collection.filter((item: StoredRecord) => {
        const fieldValue = item[field]
        if (typeof fieldValue === 'object' && fieldValue !== null) {
          return JSON.stringify(fieldValue).includes(JSON.stringify(value))
        }
        return false
      })
    }

    if (this.queryOptions.overlaps) {
      const { field, value } = this.queryOptions.overlaps
      collection = collection.filter((item: StoredRecord) => {
        const fieldValue = item[field]
        if (Array.isArray(fieldValue)) {
          return value.some((val: unknown) => fieldValue.includes(val))
        }
        return false
      })
    }

    if (this.queryOptions.ilike) {
      const { field, value } = this.queryOptions.ilike
      collection = collection.filter((item: StoredRecord) => {
        const fieldValue = item[field]
        if (typeof fieldValue === 'string') {
          return fieldValue.toLowerCase().includes(value.replace(/%/g, '').toLowerCase())
        }
        return false
      })
    }

    if (this.queryOptions.in) {
      const { field, value } = this.queryOptions.in
      collection = collection.filter((item: StoredRecord) =>
        value.includes(item[field])
      )
    }

    if (this.queryOptions.or) {
      // Simple OR implementation for name.ilike and description.ilike patterns
      const orConditions = this.queryOptions.or.split(',')
      collection = collection.filter((item: StoredRecord) => {
        return orConditions.some((condition: string) => {
          const [field, operator, value] = condition.split('.')
          if (operator === 'ilike') {
            const fieldValue = item[field]
            if (typeof fieldValue === 'string') {
              return fieldValue.toLowerCase().includes(value.replace(/%/g, '').toLowerCase())
            }
          }
          return false
        })
      })
    }

    // Apply ordering
    if (this.queryOptions.order) {
      const orderField = this.queryOptions.order.replace(/\s+(asc|desc)$/i, '')
      const isDesc = /desc$/i.test(this.queryOptions.order)

      collection.sort((a: StoredRecord, b: StoredRecord) => {
        const aVal = a[orderField]
        const bVal = b[orderField]

        if ((aVal as string) < (bVal as string)) return isDesc ? 1 : -1
        if ((aVal as string) > (bVal as string)) return isDesc ? -1 : 1
        return 0
      })
    }

    // Apply limit
    if (this.queryOptions.limit) {
      collection = collection.slice(0, this.queryOptions.limit)
    }

    // Return single item or array
    if (this.queryOptions.single) {
      return { data: collection[0] || null, error: null }
    }

    return { data: collection, error: null }
  }
}

// Create session storage based client that mimics Supabase API
export const createSessionClient = () => {
  const storage = SessionStorage.getInstance()

  return {
    from: (table: string) => ({
      select: (fields: string = '*') => new QueryBuilder(storage, table, fields),
      insert: (data: StoredRecord) => ({
        select: () => ({
          single: () => storage.insert(table as keyof SessionData, data)
        })
      }),
      update: (updates: StoredRecord) => ({
        eq: (field: string, value: unknown) => ({
          select: () => ({
            single: () => storage.update(table as keyof SessionData, updates, { eq: { field, value } })
          })
        })
      })
    }),
    rpc: (functionName: string, params?: unknown) => storage.rpc(functionName, params),
    auth: {
      getUser: () => Promise.resolve({ data: { user: storage.getUser() }, error: null }),
      signOut: () => {
        storage.signOut()
        return Promise.resolve({ error: null })
      }
    }
  }
}

export const appSessionStorage = SessionStorage.getInstance()
