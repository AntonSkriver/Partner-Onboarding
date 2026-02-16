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

const normalizeOrganizationKey = (value: string | undefined | null): string | null => {
  const normalized = normalize(value)
  if (!normalized) return null

  return normalized
    .replace(/save\s+the\s+children/g, 'stc')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

const findPartnerByOrganization = (
  organizationName: string | undefined | null,
  database: PrototypeDatabase,
): StoredPartner | null => {
  const organizationKey = normalizeOrganizationKey(organizationName)
  if (!organizationKey) return null

  const partners = database.partners
  const exact = partners.find(
    (partner) => normalizeOrganizationKey(partner.organizationName) === organizationKey,
  )
  if (exact) return exact

  const partial = partners.find((partner) => {
    const partnerKey = normalizeOrganizationKey(partner.organizationName)
    if (!partnerKey) return false
    return partnerKey.includes(organizationKey) || organizationKey.includes(partnerKey)
  })

  return partial ?? null
}

export const resolvePartnerIdFromSession = (
  session: UserSession | null,
  database: PrototypeDatabase | null,
): string | null => {
  if (!session || !database) {
    return null
  }

  const partnerByOrganization = findPartnerByOrganization(session.organization, database)
  if (partnerByOrganization) {
    return partnerByOrganization.id
  }

  const normalizedEmail = normalize(session.email)
  if (normalizedEmail) {
    if (normalizedEmail.includes('lego')) return 'partner-lego-foundation'
    if (
      normalizedEmail.includes('unicef.org.uk') ||
      normalizedEmail.includes('.uk') ||
      normalizedEmail.includes('england')
    ) {
      return 'partner-unicef-england'
    }
    if (
      normalizedEmail.includes('savethechildren.it') ||
      normalizedEmail.includes('stc.it') ||
      normalizedEmail.includes('italy')
    ) {
      return 'partner-save-the-children-italy'
    }
    if (
      normalizedEmail.includes('savethechildren.mx') ||
      normalizedEmail.includes('stc.mx') ||
      normalizedEmail.includes('mexico')
    ) {
      return 'partner-save-the-children-mexico'
    }
    if (normalizedEmail.includes('savethechildren') || normalizedEmail.includes('stc')) {
      return 'partner-save-the-children'
    }
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
