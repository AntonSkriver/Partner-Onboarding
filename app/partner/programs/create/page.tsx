'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getCurrentSession } from '@/lib/auth/session'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import type { Program } from '@/lib/types/program'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle, Loader2, Sparkles } from 'lucide-react'

const PROGRAM_TYPE_VALUES = [
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

const PEDAGOGICAL_FRAMEWORK_VALUES = [
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

const AGE_RANGE_VALUES = ['3-5', '6-8', '9-11', '12-14', '15-18', '18+'] as const

const STATUS_VALUES = ['draft', 'active', 'completed', 'archived'] as const

const COUNTRY_OPTIONS = [
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

const SDG_OPTIONS = Array.from({ length: 17 }, (_, index) => {
  const value = index + 1
  return {
    value,
    label: `SDG ${value}`,
  }
})

const programSchema = z
  .object({
    name: z.string().min(3, 'Program name must be at least 3 characters long'),
    description: z
      .string()
      .min(60, 'Provide a short description (minimum 60 characters)'),
    learningGoals: z
      .string()
      .min(40, 'Outline the learning goals (minimum 40 characters)'),
    projectTypes: z
      .array(z.enum(PROGRAM_TYPE_VALUES))
      .min(1, 'Select at least one project type'),
    pedagogicalFramework: z
      .array(z.enum(PEDAGOGICAL_FRAMEWORK_VALUES))
      .min(1, 'Select at least one pedagogical framework'),
    targetAgeRanges: z
      .array(z.enum(AGE_RANGE_VALUES))
      .min(1, 'Select at least one age range'),
    countriesInScope: z
      .array(z.string())
      .min(1, 'Select at least one country'),
    sdgFocus: z
      .array(z.number())
      .min(1, 'Choose at least one SDG focus area'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    status: z.enum(STATUS_VALUES),
    isPublic: z.boolean(),
    programUrl: z
      .string()
      .url('Enter a valid URL (including https://)')
      .optional()
      .or(z.literal('')),
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

type ProgramFormValues = z.infer<typeof programSchema>

const friendlyLabel = (value: string) =>
  value
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')

const ProgramCreationSkeleton = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4 text-gray-600">
      <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
      <span>Loading partner data…</span>
    </div>
  </div>
)

export default function CreateProgramPage() {
  const router = useRouter()
  const [session, setSession] = useState(() => getCurrentSession())
  const [createdProgram, setCreatedProgram] = useState<Program | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    ready: dataReady,
    database,
    createRecord,
  } = usePrototypeDb()

  useEffect(() => {
    setSession(getCurrentSession())
  }, [])

  useEffect(() => {
    if (!session) {
      router.push('/partner/login')
      return
    }

    if (session.role !== 'partner') {
      router.push('/partner/login')
    }
  }, [session, router])

  const partnerId = useMemo(() => {
    if (!dataReady || !session) return null

    const partners = database?.partners ?? []
    const normalizedOrganization = session.organization?.trim().toLowerCase()

    if (normalizedOrganization) {
      const directMatch = partners.find(
        (partner) => partner.organizationName.toLowerCase() === normalizedOrganization,
      )
      if (directMatch) return directMatch.id
    }

    const email = session.email?.toLowerCase() ?? ''
    if (email.includes('lego')) return 'partner-lego-foundation'
    if (email.includes('unicef')) return 'partner-unicef'
    if (email.includes('ngo')) return 'partner-save-the-children'
    if (email.includes('partner')) return 'partner-save-the-children'

    return partners.length > 0 ? partners[0].id : null
  }, [dataReady, session, database])

  const partnerRecord = useMemo(() => {
    if (!database || !partnerId) return null
    return database.partners.find((partner) => partner.id === partnerId) ?? null
  }, [database, partnerId])

  const partnerUser = useMemo(() => {
    if (!database || !session?.email) return null
    const normalizedEmail = session.email.toLowerCase()
    return (
      database.partnerUsers.find((user) => user.email.toLowerCase() === normalizedEmail) ?? null
    )
  }, [database, session?.email])

  const fallbackPartnerUser = useMemo(() => {
    if (!database || !partnerId) return null
    return database.partnerUsers.find((user) => user.partnerId === partnerId) ?? null
  }, [database, partnerId])

  const createdById =
    partnerUser?.id ?? fallbackPartnerUser?.id ?? 'partner-user-prototype-system'

  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name: '',
      description: '',
      learningGoals: '',
      projectTypes: [],
      pedagogicalFramework: [],
      targetAgeRanges: [],
      countriesInScope: partnerRecord?.country ? [partnerRecord.country] : [],
      sdgFocus: [],
      startDate: '',
      endDate: '',
      status: 'draft',
      isPublic: true,
      programUrl: '',
      brandColor: partnerRecord?.brandColor ?? '#7F56D9',
    },
  })

  const toggleValue = <T,>(value: T, current: T[], onChange: (next: T[]) => void) => {
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]
    onChange(next)
  }

  const handleSubmit = async (values: ProgramFormValues) => {
    if (!partnerId) {
      setFormError('Unable to resolve your partner organisation. Please try signing in again.')
      return
    }

    setFormError(null)
    setIsSubmitting(true)

    try {
      const now = new Date().toISOString()
      const programRecord = createRecord('programs', {
        partnerId,
        name: values.name,
        description: values.description,
        projectTypes: values.projectTypes,
        pedagogicalFramework: values.pedagogicalFramework,
        learningGoals: values.learningGoals,
        targetAgeRanges: values.targetAgeRanges,
        countriesInScope: values.countriesInScope,
        sdgFocus: values.sdgFocus,
        startDate: values.startDate,
        endDate: values.endDate,
        programUrl: values.programUrl || undefined,
        brandColor: values.brandColor,
        status: values.status,
        isPublic: values.isPublic,
        createdBy: createdById,
        createdAt: now,
        updatedAt: now,
      })

      createRecord('programPartners', {
        programId: programRecord.id,
        partnerId,
        role: 'host',
        permissions: {
          canEditProgram: true,
          canInviteCoordinators: true,
          canViewAllData: true,
          canManageProjects: true,
          canRemoveParticipants: true,
        },
        invitedBy: createdById,
        invitedAt: now,
        status: 'accepted',
        acceptedAt: now,
        createdAt: now,
        updatedAt: now,
      })

      setCreatedProgram(programRecord)
    } catch (error) {
      console.error('Failed to create program', error)
      setFormError('We were unable to create the program. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!dataReady || !session) {
    return <ProgramCreationSkeleton />
  }

  if (createdProgram) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-xl w-full">
          <CardHeader className="text-center space-y-3">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Program Created</CardTitle>
            <CardDescription>
              {createdProgram.name} is now available in your partner dashboard. Invite co-partners
              and coordinators to begin onboarding.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-purple-100 bg-purple-50 p-4">
              <h3 className="font-medium text-purple-900">Next steps</h3>
              <ul className="mt-2 text-sm text-purple-800 space-y-1 list-disc list-inside">
                <li>Review the program overview from your dashboard</li>
                <li>Invite co-partners and country coordinators</li>
                <li>Connect participating institutions and teachers</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={() => setCreatedProgram(null)}>
              Create another program
            </Button>
            <Link href="/partner/dashboard" className="w-full sm:w-auto">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Go to Dashboard
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-purple-600 mb-2">
              <Sparkles className="h-4 w-4" />
              <span>Program Builder</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Create a New Program</h1>
            <p className="text-gray-600 mt-2 max-w-3xl">
              Design a collaboration that aligns with your mission. We&apos;ll add it to the
              prototype database so the dashboard and upcoming flows can reference the same local
              data.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="hidden sm:inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {formError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Program Overview</CardTitle>
            <CardDescription>
              Share the core details partners and institutions need to understand your learning
              initiative.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form className="space-y-8" onSubmit={form.handleSubmit(handleSubmit)}>
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Program name</FormLabel>
                        <FormControl>
                          <Input placeholder="Climate Changemakers 2025" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="brandColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand color</FormLabel>
                        <FormControl>
                          <Input type="color" className="h-10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Program description</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Describe the program purpose, who it serves, and the experience you want participants to have."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="learningGoals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Learning goals</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="List the key learning outcomes or competencies the program develops."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {STATUS_VALUES.map((status) => (
                              <SelectItem key={status} value={status}>
                                {friendlyLabel(status)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="programUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Program website (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.org/program/climate-changemakers" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="projectTypes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project types</FormLabel>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {PROGRAM_TYPE_VALUES.map((value) => (
                          <label
                            key={value}
                            className="flex items-start gap-2 rounded-lg border border-gray-200 bg-white p-3 hover:border-purple-300"
                          >
                            <Checkbox
                              checked={field.value?.includes(value) ?? false}
                              onCheckedChange={() =>
                                toggleValue(value, field.value ?? [], field.onChange)
                              }
                            />
                            <span className="text-sm leading-5 text-gray-700">
                              {friendlyLabel(value)}
                            </span>
                          </label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pedagogicalFramework"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pedagogical frameworks</FormLabel>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {PEDAGOGICAL_FRAMEWORK_VALUES.map((value) => (
                          <label
                            key={value}
                            className="flex items-start gap-2 rounded-lg border border-gray-200 bg-white p-3 hover:border-purple-300"
                          >
                            <Checkbox
                              checked={field.value?.includes(value) ?? false}
                              onCheckedChange={() =>
                                toggleValue(value, field.value ?? [], field.onChange)
                              }
                            />
                            <span className="text-sm leading-5 text-gray-700">
                              {friendlyLabel(value)}
                            </span>
                          </label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetAgeRanges"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target age ranges</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {AGE_RANGE_VALUES.map((value) => {
                          const isActive = field.value?.includes(value)
                          return (
                            <Badge
                              key={value}
                              variant={isActive ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() =>
                                toggleValue(value, field.value ?? [], field.onChange)
                              }
                            >
                              {value.replace('-', '–')}
                            </Badge>
                          )
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="countriesInScope"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Countries in scope</FormLabel>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {COUNTRY_OPTIONS.map((country) => (
                          <label
                            key={country.code}
                            className="flex items-start gap-2 rounded-lg border border-gray-200 bg-white p-3 hover:border-purple-300"
                          >
                            <Checkbox
                              checked={field.value?.includes(country.code) ?? false}
                              onCheckedChange={() =>
                                toggleValue(country.code, field.value ?? [], field.onChange)
                              }
                            />
                            <span className="text-sm leading-5 text-gray-700">
                              {country.name}
                            </span>
                          </label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sdgFocus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SDG focus areas</FormLabel>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {SDG_OPTIONS.map((sdg) => {
                          const isActive = field.value?.includes(sdg.value)
                          return (
                            <Badge
                              key={sdg.value}
                              variant={isActive ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() =>
                                toggleValue(sdg.value, field.value ?? [], field.onChange)
                              }
                            >
                              {sdg.label}
                            </Badge>
                          )
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex items-start justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="space-y-1">
                        <FormLabel>Visibility</FormLabel>
                        <p className="text-sm text-gray-600">
                          Public programs are discoverable by other partners in the prototype.
                        </p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/partner/dashboard')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving program…
                      </>
                    ) : (
                      'Create program'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
