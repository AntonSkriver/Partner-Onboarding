import type { PrototypeDatabase, StoredPartner } from '@/lib/storage/prototype-db'

type ParentNetwork = 'stc' | 'unicef' | 'generic'

interface ParentContactPreset {
  name: string
  email: string
  role: string
  isPrimary: boolean
}

interface ParentOrganizationPreset {
  name: string
  website: string
  shortDescription: string
  contacts: ParentContactPreset[]
  countries: string[]
  languages: string[]
  sdgTags: string[]
  thematicTags: string[]
  mission: string
}

const normalize = (value: string | undefined | null): string =>
  value?.trim().toLowerCase() ?? ''

const resolveParentNetwork = (organizationName: string | undefined | null): ParentNetwork => {
  const normalized = normalize(organizationName)

  if (normalized.includes('save the children') || normalized.includes('stc')) {
    return 'stc'
  }

  if (normalized.includes('unicef')) {
    return 'unicef'
  }

  return 'generic'
}

const isStcCountryPartner = (partner: StoredPartner): boolean => {
  const name = normalize(partner.organizationName)
  return name.startsWith('save the children ') && !name.includes('international')
}

const isUnicefCountryPartner = (partner: StoredPartner): boolean =>
  normalize(partner.organizationName).includes('unicef')

export const getScopedParentPartners = (
  database: PrototypeDatabase,
  organizationName: string | undefined | null,
): StoredPartner[] => {
  const network = resolveParentNetwork(organizationName)

  if (network === 'stc') {
    return database.partners.filter(isStcCountryPartner)
  }

  if (network === 'unicef') {
    return database.partners.filter(isUnicefCountryPartner)
  }

  return database.partners
}

export const getScopedParentPartnerIds = (
  database: PrototypeDatabase,
  organizationName: string | undefined | null,
): string[] => getScopedParentPartners(database, organizationName).map((partner) => partner.id)

export const getParentOrganizationProfilePreset = (
  organizationName: string | undefined | null,
): ParentOrganizationPreset => {
  const network = resolveParentNetwork(organizationName)

  if (network === 'stc') {
    return {
      name: 'Save the Children World',
      website: 'https://www.savethechildren.net',
      shortDescription:
        'Coordinating Save the Children country teams to scale child-centered education and rights programs.',
      contacts: [
        {
          name: 'Global Partnerships',
          email: 'partnerships@savethechildren.org',
          role: 'Global Partnerships Lead',
          isPrimary: true,
        },
        {
          name: 'Country Operations',
          email: 'country-operations@savethechildren.org',
          role: 'Country Operations Lead',
          isPrimary: false,
        },
      ],
      countries: ['Italy', 'Mexico'],
      languages: ['English', 'Italian', 'Spanish'],
      sdgTags: ['4', '10', '16', '17'],
      thematicTags: [
        "Children's Rights",
        'Global Citizenship',
        'Community-Based Learning',
        'Human Rights Education',
      ],
      mission:
        "Save the Children works to protect every child's rights through country partnerships, teacher support, and collaborative learning programs.",
    }
  }

  if (network === 'unicef') {
    return {
      name: 'UNICEF World Organization',
      website: 'https://www.unicef.org',
      shortDescription:
        'Connecting UNICEF country teams and partners to scale impact for children worldwide.',
      contacts: [
        {
          name: 'Global Partnerships',
          email: 'partners@unicef.org',
          role: 'Global Partnerships Lead',
          isPrimary: true,
        },
        {
          name: 'Regional Coordination',
          email: 'operations@unicef.org',
          role: 'Regional Operations',
          isPrimary: false,
        },
      ],
      countries: ['Denmark', 'England'],
      languages: ['English', 'French', 'Spanish'],
      sdgTags: ['4', '5', '10', '13', '16', '17'],
      thematicTags: [
        "Children's Rights",
        'Global Citizenship',
        'Cultural Exchange',
        'Human Rights Education',
        'Healthy Communities',
      ],
      mission:
        "UNICEF works to secure every child's rights through global coordination, fundraising, education, and advocacy.",
    }
  }

  const fallbackName = organizationName?.trim() || 'Parent Organization'

  return {
    name: fallbackName,
    website: 'https://class2class.org',
    shortDescription: 'Coordinating country partners to scale impact across programs and resources.',
    contacts: [
      {
        name: 'Global Partnerships',
        email: 'partnerships@class2class.org',
        role: 'Partnerships Lead',
        isPrimary: true,
      },
    ],
    countries: [],
    languages: ['English'],
    sdgTags: ['4', '16', '17'],
    thematicTags: ["Children's Rights", 'Global Citizenship'],
    mission:
      'Coordinate country teams, share resources, and ensure program quality across the network.',
  }
}
