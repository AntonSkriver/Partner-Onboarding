// Supabase-style Database type definition for session-storage compatibility
// These mirror the shapes used by lib/api/organizations.ts and lib/api/schools.ts

type OrganizationRow = {
  id: string
  name: string
  organization_type: 'ngo' | 'corporate' | 'government' | 'educational' | 'school_network' | 'other'
  short_description: string
  website?: string | null
  countries_of_operation: string[]
  languages: string[]
  verification_status: 'pending' | 'verified' | 'rejected'
  sdg_tags?: string[]
  thematic_tags?: string[]
  is_active: boolean
  logo_url?: string
  contact_email?: string
  mission?: string
  logo?: string | null
  primary_contacts?: { name: string; email: string; role: string; phone?: string; isPrimary?: boolean }[]
  regions_of_operation?: string[]
  brand_settings?: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

type SchoolRow = {
  id: string
  name: string
  school_type: 'public' | 'private' | 'charter' | 'international' | 'other'
  contact_email: string
  address: Record<string, unknown>
  grade_range: Record<string, unknown>
  languages: string[]
  is_active: boolean
  contact_phone?: string
  principal_name?: string
  created_at: string
  updated_at: string
  safeguarding_settings?: Record<string, unknown>
}

type TableDefinition<Row> = {
  Row: Row
  Insert: Omit<Row, 'id' | 'created_at' | 'updated_at'>
  Update: Partial<Omit<Row, 'id' | 'created_at' | 'updated_at'>>
}

export interface Database {
  public: {
    Tables: {
      organizations: TableDefinition<OrganizationRow>
      schools: TableDefinition<SchoolRow>
    }
  }
}
