export interface CrcArticle {
  id: string
  title: string
  description: string
}

export interface CrcCategory {
  id: string
  label: string
  description: string
  articles: string[]
}

export const CRC_CATEGORIES: CrcCategory[] = [
  {
    id: 'general-principles',
    label: 'General Principles',
    description: 'Core principles of the Convention',
    articles: ['1', '2', '3', '4'],
  },
  {
    id: 'civil-rights',
    label: 'Civil Rights & Freedoms',
    description: 'Identity, expression, and participation',
    articles: ['7', '8', '12', '13', '14', '15', '16', '17'],
  },
  {
    id: 'family-care',
    label: 'Family & Care',
    description: 'Family environment and protection',
    articles: ['5', '9', '10', '11', '18', '19', '20', '21', '25'],
  },
  {
    id: 'health-welfare',
    label: 'Health & Welfare',
    description: 'Health, disability, and standard of living',
    articles: ['6', '23', '24', '26', '27'],
  },
  {
    id: 'education-culture',
    label: 'Education & Culture',
    description: 'Education, leisure, and cultural activities',
    articles: ['28', '29', '30', '31'],
  },
  {
    id: 'special-protection',
    label: 'Special Protection',
    description: 'Protection from exploitation and abuse',
    articles: ['22', '32', '33', '34', '35', '36', '37', '38', '39', '40'],
  },
]

export const CRC_ARTICLES: CrcArticle[] = [
  { id: '1', title: 'Definition of child', description: 'Everyone under 18 years' },
  { id: '2', title: 'Non-discrimination', description: 'All rights apply to all children' },
  { id: '3', title: 'Best interests of child', description: 'Priority in all decisions' },
  { id: '4', title: 'Implementation of rights', description: 'Government responsibility' },
  { id: '5', title: 'Parental guidance', description: 'Respect for family rights and responsibilities' },
  { id: '6', title: 'Life, survival & development', description: 'Right to life and healthy development' },
  { id: '7', title: 'Birth registration & nationality', description: 'Right to name and identity' },
  { id: '8', title: 'Preservation of identity', description: 'Right to preserve identity' },
  { id: '9', title: 'Separation from parents', description: 'Right to live with parents unless harmful' },
  { id: '10', title: 'Family reunification', description: 'Right to maintain contact with parents' },
  { id: '11', title: 'Illicit transfer', description: 'Protection from kidnapping' },
  { id: '12', title: 'Respect for views of child', description: 'Right to be heard' },
  { id: '13', title: 'Freedom of expression', description: 'Right to seek and share information' },
  { id: '14', title: 'Freedom of thought', description: 'Conscience and religion' },
  { id: '15', title: 'Freedom of association', description: 'Right to join groups' },
  { id: '16', title: 'Right to privacy', description: 'Protection of privacy and reputation' },
  { id: '17', title: 'Access to information', description: 'Media and age-appropriate information' },
  { id: '18', title: 'Parental responsibilities', description: 'Both parents share responsibility' },
  { id: '19', title: 'Protection from violence', description: 'Safety from abuse and neglect' },
  { id: '20', title: 'Children without families', description: 'Alternative care for children' },
  { id: '21', title: 'Adoption', description: 'Best interests in adoption' },
  { id: '22', title: 'Refugee children', description: 'Special protection for refugees' },
  { id: '23', title: 'Children with disabilities', description: 'Rights and dignity' },
  { id: '24', title: 'Health services', description: 'Right to healthcare' },
  { id: '25', title: 'Periodic review', description: 'Review of treatment in care' },
  { id: '26', title: 'Social security', description: 'Right to social benefits' },
  { id: '27', title: 'Adequate standard of living', description: 'Basic needs and development' },
  { id: '28', title: 'Right to education', description: 'Free primary education' },
  { id: '29', title: 'Goals of education', description: 'Development of personality and talents' },
  { id: '30', title: 'Minority rights', description: 'Culture, language, and religion' },
  { id: '31', title: 'Leisure & play', description: 'Rest, play, and culture' },
  { id: '32', title: 'Child labour', description: 'Protection from economic exploitation' },
  { id: '33', title: 'Drug abuse', description: 'Protection from narcotic drugs' },
  { id: '34', title: 'Sexual exploitation', description: 'Protection from sexual abuse' },
  { id: '35', title: 'Abduction & trafficking', description: 'Prevention of sale and trafficking' },
  { id: '36', title: 'Other exploitation', description: 'Protection from all forms of exploitation' },
  { id: '37', title: 'Detention & punishment', description: 'No torture or degrading treatment' },
  { id: '38', title: 'Armed conflicts', description: 'Protection in war' },
  { id: '39', title: 'Rehabilitative care', description: 'Recovery and reintegration' },
  { id: '40', title: 'Juvenile justice', description: 'Fair treatment in justice system' },
]

export function getCrcArticle(id: string): CrcArticle | undefined {
  return CRC_ARTICLES.find((a) => a.id === id)
}

export function getCrcIconPath(articleId: string): string {
  return `/crc/icons/article-${articleId.padStart(2, '0')}.png`
}
