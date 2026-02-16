import type { ProgramResource } from '@/lib/types/resource'

const parseTimestamp = (value: string | undefined): number => {
  if (!value) return 0
  const time = Date.parse(value)
  return Number.isNaN(time) ? 0 : time
}

const sortByUpdatedDesc = (resources: ProgramResource[]): ProgramResource[] =>
  [...resources].sort((a, b) => {
    const aTime = parseTimestamp(a.updatedAt ?? a.createdAt)
    const bTime = parseTimestamp(b.updatedAt ?? b.createdAt)
    return bTime - aTime
  })

export const getResourcesForParent = (resources: ProgramResource[]): ProgramResource[] =>
  sortByUpdatedDesc(resources)

export const getResourcesForPartner = (
  resources: ProgramResource[],
  partnerId: string | null,
): ProgramResource[] => {
  if (!partnerId) return []

  return sortByUpdatedDesc(
    resources.filter((resource) => {
      if (resource.ownerRole === 'partner') {
        return resource.ownerPartnerId === partnerId
      }

      if (resource.availabilityScope === 'all_partners') {
        return true
      }

      if (resource.availabilityScope === 'specific_partners') {
        return (resource.targetPartnerIds ?? []).includes(partnerId)
      }

      return false
    }),
  )
}
