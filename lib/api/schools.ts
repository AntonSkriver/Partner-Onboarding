import { createSessionClient } from '../session-storage'
const supabase = createSessionClient()
const _supabaseAdmin = supabase

// Temporary types for session storage (replace database types)
type School = {
  id: string
  name: string
  school_type: 'public' | 'private' | 'charter' | 'international' | 'other'
  contact_email: string
  address: Record<string, unknown>
  grade_range: Record<string, unknown>
  languages: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  safeguarding_settings?: Record<string, unknown>
}

type SchoolInsert = Omit<School, 'id' | 'created_at' | 'updated_at'>
type SchoolUpdate = Partial<SchoolInsert>

type Teacher = {
  id: string
  school_id: string
  first_name: string
  last_name: string
  email: string
  role: 'teacher' | 'coordinator' | 'admin'
  is_active: boolean
  created_at: string
  updated_at: string
}

type TeacherInsert = Omit<Teacher, 'id' | 'created_at' | 'updated_at'>

export class SchoolAPI {
  // Get school by ID
  static async getById(id: string): Promise<School | null> {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching school:', error)
      return null
    }

    return data as unknown as School | null
  }

  // Get schools by country
  static async getByCountry(country: string) {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('is_active', true)
      .contains('address', { country })
      .order('name')

    if (error) {
      console.error('Error fetching schools by country:', error)
      return []
    }

    return data || []
  }

  // Get schools by type
  static async getByType(schoolType: School['school_type']) {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('school_type', schoolType)
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching schools by type:', error)
      return []
    }

    return data || []
  }

  // Create new school
  static async create(schoolData: SchoolInsert): Promise<School | null> {
    const { data, error } = await supabase
      .from('schools')
      .insert(schoolData)
      .select()
      .single()

    if (error) {
      console.error('Error creating school:', error)
      return null
    }

    // Log activity
    const school = data as unknown as School
    if (school) {
      await this.logActivity('create', 'school', school.id, {
        schoolName: school.name,
        schoolType: school.school_type,
        country: (school.address as Record<string, unknown>)?.country
      })
    }

    return school
  }

  // Update school
  static async update(id: string, updates: SchoolUpdate): Promise<School | null> {
    const { data, error } = await supabase
      .from('schools')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating school:', error)
      return null
    }

    // Log activity
    const school = data as unknown as School
    if (school) {
      await this.logActivity('update', 'school', school.id, {
        updatedFields: Object.keys(updates)
      })
    }

    return school
  }

  // Search schools
  static async search(query: string, filters: {
    country?: string
    schoolType?: School['school_type']
    gradeRange?: { min?: number, max?: number }
    languages?: string[]
  } = {}) {
    let queryBuilder = supabase
      .from('schools')
      .select('*')
      .eq('is_active', true)

    // Text search on name
    if (query) {
      queryBuilder = queryBuilder.ilike('name', `%${query}%`)
    }

    // Apply filters
    if (filters.country) {
      queryBuilder = queryBuilder.contains('address', { country: filters.country })
    }

    if (filters.schoolType) {
      queryBuilder = queryBuilder.eq('school_type', filters.schoolType)
    }

    if (filters.languages && filters.languages.length > 0) {
      queryBuilder = queryBuilder.overlaps('languages', filters.languages)
    }

    const { data, error } = await queryBuilder.order('name')

    if (error) {
      console.error('Error searching schools:', error)
      return []
    }

    return data || []
  }

  // Get school's teachers
  static async getTeachers(schoolId: string): Promise<Teacher[]> {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .order('last_name')

    if (error) {
      console.error('Error fetching school teachers:', error)
      return []
    }

    return (data || []) as unknown as Teacher[]
  }

  // Add teacher to school
  static async addTeacher(teacherData: TeacherInsert): Promise<Teacher | null> {
    const { data, error } = await supabase
      .from('teachers')
      .insert(teacherData)
      .select()
      .single()

    if (error) {
      console.error('Error adding teacher:', error)
      return null
    }

    // Log activity
    const teacher = data as unknown as Teacher
    if (teacher) {
      await this.logActivity('add_teacher', 'school', teacher.school_id, {
        teacherName: `${teacher.first_name} ${teacher.last_name}`,
        teacherEmail: teacher.email,
        role: teacher.role
      })
    }

    return teacher
  }

  // Update teacher
  static async updateTeacher(teacherId: string, updates: Partial<Teacher>): Promise<Teacher | null> {
    const { data, error } = await supabase
      .from('teachers')
      .update(updates)
      .eq('id', teacherId)
      .select()
      .single()

    if (error) {
      console.error('Error updating teacher:', error)
      return null
    }

    return data as unknown as Teacher | null
  }

  // Remove teacher from school (soft delete)
  static async removeTeacher(teacherId: string): Promise<boolean> {
    const { error } = await (supabase
      .from('teachers')
      .update({ is_active: false })
      .eq('id', teacherId) as unknown as Promise<{ error: unknown }>)

    if (error) {
      console.error('Error removing teacher:', error)
      return false
    }

    return true
  }

  // Get school's program memberships
  static async getProgramMemberships(_schoolId: string) {
    // This would join with collaboration_nodes and collaborations
    // For now, returning empty array as placeholder
    return []
  }

  // Get school analytics
  static async getAnalytics(schoolId: string, period: 'monthly' | 'quarterly' | 'annual' = 'quarterly') {
    const { data, error } = await supabase
      .from('kpi_snapshots')
      .select('*')
      .eq('scope', 'school')
      .eq('scope_id', schoolId)
      .eq('period', period)
      .order('date', { ascending: false })
      .limit(12) // Last 12 periods

    if (error) {
      console.error('Error fetching school analytics:', error)
      return []
    }

    return data || []
  }

  // Update safeguarding settings
  static async updateSafeguardingSettings(
    schoolId: string,
    safeguardingSettings: Record<string, unknown>
  ): Promise<boolean> {
    const { error } = await (supabase
      .from('schools')
      .update({ safeguarding_settings: safeguardingSettings })
      .eq('id', schoolId) as unknown as Promise<{ error: unknown }>)

    if (error) {
      console.error('Error updating safeguarding settings:', error)
      return false
    }

    // Log activity
    await this.logActivity('update_safeguarding', 'school', schoolId, {
      settingsUpdated: Object.keys(safeguardingSettings)
    })

    return true
  }

  // Get schools needing consent verification
  static async getSchoolsNeedingConsent() {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .contains('safeguarding_settings', { consentStatus: 'pending' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching schools needing consent:', error)
      return []
    }

    return data || []
  }

  // Invite school to program
  static async inviteToProgram(
    schoolId: string,
    collaborationId: string,
    invitedBy: string,
    message?: string
  ): Promise<boolean> {
    const school = await this.getById(schoolId)
    if (!school) return false

    const { error } = await (supabase
      .from('invitations')
      .insert({
        type: 'school',
        invited_by: invitedBy,
        invited_email: school.contact_email,
        target_role: 'school_admin',
        target_scope: 'collaboration',
        target_scope_id: collaborationId,
        message: message,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      }) as unknown as { error: unknown })

    if (error) {
      console.error('Error creating school invitation:', error)
      return false
    }

    // Log activity
    await this.logActivity('invite', 'school', schoolId, {
      collaborationId,
      invitedBy,
      action: 'program_invitation'
    })

    return true
  }

  // Deactivate school (soft delete)
  static async deactivate(id: string): Promise<boolean> {
    const { error } = await (supabase
      .from('schools')
      .update({ is_active: false })
      .eq('id', id) as unknown as Promise<{ error: unknown }>)

    if (error) {
      console.error('Error deactivating school:', error)
      return false
    }

    // Also deactivate all teachers
    await (supabase
      .from('teachers')
      .update({ is_active: false })
      .eq('school_id', id) as unknown as Promise<{ error: unknown }>)

    // Log activity
    await this.logActivity('deactivate', 'school', id, {})

    return true
  }

  // Private helper to log activities
  private static async logActivity(
    action: string,
    resourceType: string,
    resourceId: string,
    metadata: Record<string, unknown>
  ) {
    try {
      await supabase.rpc('log_activity', {
        p_action: action,
        p_resource_type: resourceType,
        p_resource_id: resourceId,
        p_scope: 'school',
        p_scope_id: resourceId,
        p_metadata: metadata
      })
    } catch (error) {
      console.error('Error logging activity:', error)
    }
  }
}

// Helper functions for school profile validation
export const validateSchoolData = (data: Partial<SchoolInsert>) => {
  const errors: Record<string, string> = {}

  if (!data.name?.trim()) {
    errors.name = 'School name is required'
  }

  if (!data.school_type) {
    errors.school_type = 'School type is required'
  }

  if (!data.contact_email?.trim()) {
    errors.contact_email = 'Contact email is required'
  } else if (!isValidEmail(data.contact_email)) {
    errors.contact_email = 'Please enter a valid email address'
  }

  const address = data.address as Record<string, unknown> | undefined
  if (!address?.country) {
    errors['address.country'] = 'Country is required'
  }

  if (!address?.city) {
    errors['address.city'] = 'City is required'
  }

  const gradeRange = data.grade_range as Record<string, number> | undefined
  if (!gradeRange?.min || !gradeRange?.max) {
    errors.grade_range = 'Grade range is required'
  } else if (gradeRange.min > gradeRange.max) {
    errors.grade_range = 'Minimum grade cannot be higher than maximum grade'
  }

  if (!data.languages || data.languages.length === 0) {
    errors.languages = 'At least one language is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Helper function to validate email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// School type options
export const SCHOOL_TYPES = [
  { value: 'public', label: 'Public School' },
  { value: 'private', label: 'Private School' },
  { value: 'charter', label: 'Charter School' },
  { value: 'international', label: 'International School' },
  { value: 'other', label: 'Other' }
]

// Grade levels for school profile
export const GRADE_LEVELS = Array.from({ length: 13 }, (_, i) => ({
  value: i,
  label: i === 0 ? 'Kindergarten' : `Grade ${i}`
}))

// Default safeguarding settings for new schools
export const DEFAULT_SAFEGUARDING_SETTINGS = {
  consentStatus: 'pending',
  defaultModerationMode: 'teacher_approval',
  mediaPreferences: {
    allowPhotos: false,
    allowVideos: false,
    requireParentConsent: true
  },
  consentTemplates: [],
  gdprCompliant: false
}

// Teacher role options
export const TEACHER_ROLES = [
  { value: 'teacher', label: 'Teacher' },
  { value: 'coordinator', label: 'Program Coordinator' },
  { value: 'admin', label: 'School Administrator' }
]