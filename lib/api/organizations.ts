import { createSessionClient } from '../session-storage'
const supabase = createSessionClient()
const supabaseAdmin = supabase

// Temporary types for session storage (replace database types)
type Organization = {
  id: string
  name: string
  organization_type: 'ngo' | 'corporate' | 'government' | 'educational' | 'other'
  short_description: string
  website?: string
  countries_of_operation: string[]
  languages: string[]
  verification_status: 'pending' | 'verified' | 'rejected'
  sdg_tags?: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

type OrganizationInsert = Omit<Organization, 'id' | 'created_at' | 'updated_at'>
type OrganizationUpdate = Partial<OrganizationInsert>

export class OrganizationAPI {
  // Get organization by ID
  static async getById(id: string): Promise<Organization | null> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching organization:', error)
      return null
    }

    return data
  }

  // Get organizations by type
  static async getByType(organizationType: Organization['organization_type']) {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('organization_type', organizationType)
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching organizations by type:', error)
      return []
    }

    return data || []
  }

  // Get organizations by verification status
  static async getByVerificationStatus(status: Organization['verification_status']) {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('verification_status', status)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching organizations by verification status:', error)
      return []
    }

    return data || []
  }

  // Create new organization
  static async create(orgData: OrganizationInsert): Promise<Organization | null> {
    const { data, error } = await supabase
      .from('organizations')
      .insert(orgData)
      .select()
      .single()

    if (error) {
      console.error('Error creating organization:', error)
      return null
    }

    // Log activity
    if (data) {
      await this.logActivity('create', 'organization', data.id, {
        organizationName: data.name,
        organizationType: data.organization_type
      })
    }

    return data
  }

  // Update organization
  static async update(id: string, updates: OrganizationUpdate): Promise<Organization | null> {
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating organization:', error)
      return null
    }

    // Log activity
    if (data) {
      await this.logActivity('update', 'organization', data.id, {
        updatedFields: Object.keys(updates)
      })
    }

    return data
  }

  // Update verification status (admin only)
  static async updateVerificationStatus(
    id: string, 
    status: Organization['verification_status']
  ): Promise<boolean> {
    const { error } = await (supabaseAdmin
      .from('organizations')
      .update({ verification_status: status })
      .eq('id', id) as any)

    if (error) {
      console.error('Error updating verification status:', error)
      return false
    }

    // Log activity
    await this.logActivity('verify', 'organization', id, {
      verificationStatus: status
    })

    return true
  }

  // Search organizations
  static async search(query: string, filters: {
    organizationType?: Organization['organization_type']
    country?: string
    sdgTags?: string[]
  } = {}) {
    let queryBuilder = supabase
      .from('organizations')
      .select('*')
      .eq('is_active', true)

    // Text search on name and description
    if (query) {
      queryBuilder = queryBuilder.or(
        `name.ilike.%${query}%,short_description.ilike.%${query}%`
      )
    }

    // Apply filters
    if (filters.organizationType) {
      queryBuilder = queryBuilder.eq('organization_type', filters.organizationType)
    }

    if (filters.country) {
      queryBuilder = queryBuilder.contains('countries_of_operation', [filters.country])
    }

    if (filters.sdgTags && filters.sdgTags.length > 0) {
      queryBuilder = queryBuilder.overlaps('sdg_tags', filters.sdgTags)
    }

    const { data, error } = await queryBuilder.order('name')

    if (error) {
      console.error('Error searching organizations:', error)
      return []
    }

    return data || []
  }

  // Get organization's program memberships
  static async getProgramMemberships(organizationId: string) {
    const { data, error } = await supabase
      .from('collaborations')
      .select(`
        id,
        title,
        description,
        type,
        status,
        start_date,
        end_date,
        lead_organization_id,
        co_host_organizations,
        partner_organizations
      `)
      .or(
        `lead_organization_id.eq.${organizationId},co_host_organizations.cs.{${organizationId}},partner_organizations.cs.{${organizationId}}`
      )
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching program memberships:', error)
      return []
    }

    return data || []
  }

  // Get organization analytics
  static async getAnalytics(organizationId: string, period: 'monthly' | 'quarterly' | 'annual' = 'quarterly') {
    const { data, error } = await supabase
      .from('kpi_snapshots')
      .select('*')
      .eq('scope', 'organization')
      .eq('scope_id', organizationId)
      .eq('period', period)
      .order('date', { ascending: false })
      .limit(12) // Last 12 periods

    if (error) {
      console.error('Error fetching organization analytics:', error)
      return []
    }

    return data || []
  }

  // Get organization resources
  static async getResources(organizationId: string) {
    // Get collaborations where this organization is involved
    const collaborations = await this.getProgramMemberships(organizationId)
    const collaborationIds = collaborations.map((c: any) => c.id)

    if (collaborationIds.length === 0) {
      return []
    }

    const { data, error } = await supabase
      .from('program_resources')
      .select('*')
      .in('collaboration_id', collaborationIds)
      .eq('is_public', true)
      .order('uploaded_at', { ascending: false })

    if (error) {
      console.error('Error fetching organization resources:', error)
      return []
    }

    return data || []
  }

  // Deactivate organization (soft delete)
  static async deactivate(id: string): Promise<boolean> {
    const { error } = await (supabase
      .from('organizations')
      .update({ is_active: false })
      .eq('id', id) as any)

    if (error) {
      console.error('Error deactivating organization:', error)
      return false
    }

    // Log activity
    await this.logActivity('deactivate', 'organization', id, {})

    return true
  }

  // Private helper to log activities
  private static async logActivity(
    action: string,
    resourceType: string,
    resourceId: string,
    metadata: Record<string, any>
  ) {
    try {
      await supabase.rpc('log_activity', {
        p_action: action,
        p_resource_type: resourceType,
        p_resource_id: resourceId,
        p_scope: 'organization',
        p_scope_id: resourceId,
        p_metadata: metadata
      })
    } catch (error) {
      console.error('Error logging activity:', error)
    }
  }
}

// Helper functions for partner profile validation
export const validateOrganizationData = (data: Partial<OrganizationInsert>) => {
  const errors: Record<string, string> = {}

  if (!data.name?.trim()) {
    errors.name = 'Organization name is required'
  }

  if (!data.organization_type) {
    errors.organization_type = 'Organization type is required'
  }

  if (!data.short_description?.trim()) {
    errors.short_description = 'Short description is required'
  }

  if (data.website && !isValidUrl(data.website)) {
    errors.website = 'Please enter a valid website URL'
  }

  if (data.countries_of_operation?.length === 0) {
    errors.countries_of_operation = 'At least one country of operation is required'
  }

  if (data.languages?.length === 0) {
    errors.languages = 'At least one language is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Helper function to validate URLs
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// SDG options for partner profiles
export const SDG_OPTIONS = [
  { value: '1', label: 'No Poverty' },
  { value: '2', label: 'Zero Hunger' },
  { value: '3', label: 'Good Health and Well-being' },
  { value: '4', label: 'Quality Education' },
  { value: '5', label: 'Gender Equality' },
  { value: '6', label: 'Clean Water and Sanitation' },
  { value: '7', label: 'Affordable and Clean Energy' },
  { value: '8', label: 'Decent Work and Economic Growth' },
  { value: '9', label: 'Industry, Innovation and Infrastructure' },
  { value: '10', label: 'Reduced Inequalities' },
  { value: '11', label: 'Sustainable Cities and Communities' },
  { value: '12', label: 'Responsible Consumption and Production' },
  { value: '13', label: 'Climate Action' },
  { value: '14', label: 'Life Below Water' },
  { value: '15', label: 'Life on Land' },
  { value: '16', label: 'Peace, Justice and Strong Institutions' },
  { value: '17', label: 'Partnerships for the Goals' }
]

// Thematic tags for partner categorization
export const THEMATIC_TAGS = [
  'Environmental Education',
  'Global Citizenship',
  'Cultural Exchange',
  'STEM Education',
  'Arts and Culture',
  'Language Learning',
  'Digital Literacy',
  'Social Innovation',
  'Community Development',
  'Youth Leadership',
  'Entrepreneurship',
  'Health and Wellness',
  'Human Rights',
  'Peace Education',
  'Sustainability'
]