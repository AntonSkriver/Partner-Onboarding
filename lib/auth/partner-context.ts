import type { UserSession } from '@/lib/auth/session'
import type {
  PrototypeDatabase,
  StoredPartner,
  StoredPartnerUser,
} from '@/lib/storage/prototype-db'

interface PartnerContext {
  partnerId: string | null
  partnerRecord: StoredPartner | null
  partnerUser: StoredPartnerUser | null
}

const normalize = (value: string | undefined | null): string | null => {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed.toLowerCase() : null
}

export const resolvePartnerIdFromSession = (
  session: UserSession | null,
  database: PrototypeDatabase | null,
): string | null => {
  if (!session || !database) {
    return null
  }

  const normalizedOrganization = normalize(session.organization)
  if (normalizedOrganization) {
    const directMatch = database.partners.find(
      (partner) => partner.organizationName.toLowerCase() === normalizedOrganization,
    )
    if (directMatch) {
      return directMatch.id
    }
  }

  const normalizedEmail = normalize(session.email)
  if (normalizedEmail) {
    if (normalizedEmail.includes('lego')) return 'partner-lego-foundation'
    if (normalizedEmail.includes('unicef')) return 'partner-unicef'
    if (normalizedEmail.includes('ngo')) return 'partner-save-the-children'
    if (normalizedEmail.includes('partner')) return 'partner-save-the-children'
  }

  return database.partners.length > 0 ? database.partners[0].id : null
}

export const resolvePartnerContext = (
  session: UserSession | null,
  database: PrototypeDatabase | null,
): PartnerContext => {
  const partnerId = resolvePartnerIdFromSession(session, database)

  if (!database || !partnerId) {
    return {
      partnerId,
      partnerRecord: null,
      partnerUser: null,
    }
  }

  const partnerRecord =
    database.partners.find((partner) => partner.id === partnerId) ?? null

  const partnerUser = session?.email
    ? database.partnerUsers.find(
        (user) => user.email.toLowerCase() === session.email.toLowerCase(),
      ) ?? null
    : null

  return {
    partnerId,
    partnerRecord,
    partnerUser,
  }
}

export type { PartnerContext }
