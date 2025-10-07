import { z } from 'zod'

export const PROGRAM_TYPE_VALUES = [
  'pen_pal_exchange',
  'collaborative_project',
  'virtual_classroom',
  'cultural_exchange',
  'stem_challenge',
  'art_project',
  'language_learning',
  'environmental_action',
  'social_impact',
  'other',
] as const

export const PEDAGOGICAL_FRAMEWORK_VALUES = [
  'coil',
  'pbl',
  'esd',
  'design_thinking',
  'inquiry_based',
  'service_learning',
  'steam',
  'global_citizenship',
  'other',
] as const

export const AGE_RANGE_VALUES = ['3-5', '6-8', '9-11', '12-14', '15-18', '18+'] as const

export const STATUS_VALUES = ['draft', 'active', 'completed', 'archived'] as const

export const COUNTRY_OPTIONS = [
  { code: 'DK', name: 'Denmark' },
  { code: 'KE', name: 'Kenya' },
  { code: 'US', name: 'United States' },
  { code: 'BR', name: 'Brazil' },
  { code: 'IN', name: 'India' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'FI', name: 'Finland' },
  { code: 'JP', name: 'Japan' },
] as const

export const SDG_OPTIONS = Array.from({ length: 17 }, (_, index) => {
  const value = index + 1
  return {
    value,
    label: `SDG ${value}`,
  }
})

export const programSchema = z
  .object({
    name: z.string().min(3, 'Program name must be at least 3 characters long'),
    description: z.string().min(60, 'Provide a short description (minimum 60 characters)'),
    learningGoals: z.string().min(40, 'Outline the learning goals (minimum 40 characters)'),
    projectTypes: z.array(z.enum(PROGRAM_TYPE_VALUES)).min(1, 'Select at least one project type'),
    pedagogicalFramework: z
      .array(z.enum(PEDAGOGICAL_FRAMEWORK_VALUES))
      .min(1, 'Select at least one pedagogical framework'),
    targetAgeRanges: z.array(z.enum(AGE_RANGE_VALUES)).min(1, 'Select at least one age range'),
    countriesInScope: z.array(z.string()).min(1, 'Select at least one country'),
    sdgFocus: z.array(z.number()).min(1, 'Choose at least one SDG focus area'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    status: z.enum(STATUS_VALUES),
    isPublic: z.boolean(),
    programUrl: z.string().url('Enter a valid URL (including https://)').optional().or(z.literal('')),
    brandColor: z
      .string()
      .regex(/^#([0-9A-Fa-f]{6})$/, 'Enter a valid hex color (e.g. #7F56D9)'),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true
      return new Date(data.endDate) >= new Date(data.startDate)
    },
    {
      message: 'End date must be on or after the start date',
      path: ['endDate'],
    },
  )

export type ProgramFormValues = z.infer<typeof programSchema>

export const friendlyLabel = (value: string) =>
  value
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
