export type ResourceType =
  | 'document'
  | 'video'
  | 'website'
  | 'presentation'
  | 'book'
  | 'game'
  | 'quiz'

export type ResourceAvailabilityScope =
  | 'organization'
  | 'all_partners'
  | 'specific_partners'

export type ResourceOwnerRole = 'partner' | 'parent'

export interface ProgramResource {
  id: string
  title: string
  description: string
  type: ResourceType
  language: string
  targetAudience: string[]
  sdgAlignment: number[]
  crcAlignment: string[]
  tags: string[]
  isPublic: boolean
  sourceType: 'file' | 'url'
  sourceUrl?: string
  heroImageUrl?: string
  ownerRole: ResourceOwnerRole
  ownerOrganization: string
  ownerPartnerId?: string
  createdBy: string
  programAssignment: 'all' | 'specific'
  specificProgramIds?: string[]
  availabilityScope: ResourceAvailabilityScope
  targetPartnerIds?: string[]
  createdAt: string
  updatedAt: string
}
