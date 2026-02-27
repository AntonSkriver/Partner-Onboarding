'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
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
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, CheckCircle, Loader2, Sparkles } from 'lucide-react'
import { resolvePartnerContext } from '@/lib/auth/partner-context'
import { Badge } from '@/components/ui/badge'
import { SdgDisplay, CrcDisplay } from '@/components/framework-selector'
import {
  AGE_RANGE_VALUES,
  STATUS_VALUES,
  COLLABORATION_TYPE_VALUES,
  PROGRAM_LANGUAGE_OPTIONS,
  friendlyLabel,
  programSchema,
} from '../shared'
import type { ProgramFormValues } from '../shared'

const ProgramCreationSkeleton = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4 text-gray-600">
      <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
      <span>Loading partner data…</span>
    </div>
  </div>
)

export default function CreateProgramPage() {
  const t = useTranslations('programs')
  const tc = useTranslations('common')
  const tSdg = useTranslations('sdg')
  const tCrc = useTranslations('crc')
  const router = useRouter()
  const [session, setSession] = useState(() => getCurrentSession())
  const [createdProgram, setCreatedProgram] = useState<Program | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [selectedSDGs, setSelectedSDGs] = useState<number[]>([])
  const [selectedCRCs, setSelectedCRCs] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en'])

  const { ready: dataReady, database, createRecord } = usePrototypeDb()

  useEffect(() => {
    setSession(getCurrentSession())
  }, [])

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }

    if (session.role !== 'partner') {
      router.push('/login')
    }
  }, [session, router])

  const { partnerId, partnerRecord, partnerUser } = useMemo(
    () => resolvePartnerContext(session, database ?? null),
    [database, session],
  )

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
      collaborationType: 'explore_global_challenges',
      targetAgeRanges: [],
      languages: ['en'],
      sdgFocus: [],
      crcFocus: [],
      startDate: '',
      endDate: '',
      status: 'draft',
      isPublic: true,
      programUrl: '',
    },
  })

  const toggleValue = <T,>(value: T, current: T[], onChange: (next: T[]) => void) => {
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]
    onChange(next)
  }

  const handleSdgChange = (sdgs: number[]) => {
    setSelectedSDGs(sdgs)
    form.setValue('sdgFocus', sdgs)
  }

  const handleCrcChange = (articles: string[]) => {
    setSelectedCRCs(articles)
    form.setValue('crcFocus', articles)
  }

  const handleLanguageToggle = (code: string) => {
    const newSelection = selectedLanguages.includes(code)
      ? selectedLanguages.filter((lang) => lang !== code)
      : [...selectedLanguages, code]

    setSelectedLanguages(newSelection)
    form.setValue('languages', newSelection as ("en" | "da")[])
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
      const hostName = partnerRecord?.organizationName ?? 'Program Host'
      const displayTitle = `${hostName}: ${values.name}`
      const programRecord = createRecord('programs', {
        partnerId,
        displayTitle,
        name: values.name,
        description: values.description,
        projectTypes: [values.collaborationType],
        languages: values.languages,
        pedagogicalFramework: [],
        learningGoals: values.learningGoals,
        targetAgeRanges: values.targetAgeRanges,
        countriesInScope: [],
        sdgFocus: values.sdgFocus,
        crcFocus: values.crcFocus ?? [],
        startDate: values.startDate,
        endDate: values.endDate,
        programUrl: values.programUrl || undefined,
        brandColor: partnerRecord?.brandColor ?? '#7F56D9',
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
            <CardTitle className="text-2xl">{t('programCreated')}</CardTitle>
            <CardDescription>
              {t('programCreatedDesc', { name: createdProgram.name })}
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
              {t('createAnother')}
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
              <span>{t('programBuilder')}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{t('createNewProgram')}</h1>
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
            {tc('back')}
          </Button>
        </div>

        {formError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t('programOverview')}</CardTitle>
            <CardDescription>
              Share the core details partners and institutions need to understand your learning
              initiative.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form className="space-y-8" onSubmit={form.handleSubmit(handleSubmit)}>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('programName')}</FormLabel>
                      <FormControl>
                        <Input placeholder="Climate Changemakers 2025" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('programDescription')}</FormLabel>
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
                      <FormLabel>{t('learningGoals')}</FormLabel>
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

                <FormField
                  control={form.control}
                  name="collaborationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('collaborationTheme')}</FormLabel>
                      <p className="text-sm text-gray-600 mb-3">
                        Choose the headline teachers and schools will see on the program card.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {COLLABORATION_TYPE_VALUES.map((value) => {
                          const labelMap: Record<(typeof COLLABORATION_TYPE_VALUES)[number], string> = {
                            explore_global_challenges: t('themeGlobalChallenges'),
                            cultural_exchange: t('themeCultures'),
                            create_solutions: t('themeSolutions'),
                          }
                          const descriptionMap: Record<(typeof COLLABORATION_TYPE_VALUES)[number], string> = {
                            explore_global_challenges: t('themeGlobalChallengesDesc'),
                            cultural_exchange: t('themeCulturesDesc'),
                            create_solutions: t('themeSolutionsDesc'),
                          }
                          const isActive = field.value === value
                          return (
                            <button
                              type="button"
                              key={value}
                              onClick={() => field.onChange(value)}
                              className={`w-full text-left rounded-lg border p-3 transition-all ${
                                isActive
                                  ? 'border-purple-500 bg-purple-50 shadow-sm'
                                  : 'border-gray-200 hover:border-purple-300'
                              }`}
                            >
                              <p className="text-sm font-semibold text-gray-900">{labelMap[value]}</p>
                              <p className="text-xs text-gray-600 mt-1">{descriptionMap[value]}</p>
                            </button>
                          )
                        })}
                      </div>
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
                        <FormLabel>{t('startDate')}</FormLabel>
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
                        <FormLabel>{t('endDate')}</FormLabel>
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
                        <FormLabel>{tc('status')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('selectStatus')} />
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
                        <FormLabel>{t('programWebsite')}</FormLabel>
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
                  name="targetAgeRanges"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('targetAgeRanges')}</FormLabel>
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
                  name="languages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('programLanguages')}</FormLabel>
                      <p className="text-sm text-gray-600 mb-3">
                        {t('languagesDesc')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {PROGRAM_LANGUAGE_OPTIONS.map((code) => {
                          const labelMap: Record<(typeof PROGRAM_LANGUAGE_OPTIONS)[number], string> = {
                            en: 'English',
                            da: 'Danish',
                          }
                          const isActive = field.value?.includes(code)
                          return (
                            <Badge
                              key={code}
                              variant={isActive ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() => handleLanguageToggle(code)}
                            >
                              {labelMap[code]}
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
                  name="sdgFocus"
                  render={() => (
                    <FormItem>
                      <FormLabel>{tSdg('alignment')} *</FormLabel>
                      <p className="text-sm text-gray-600 mb-3">{tSdg('alignmentDesc')}</p>
                      <SdgDisplay
                        selected={selectedSDGs}
                        onChange={handleSdgChange}
                        max={5}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="crcFocus"
                  render={() => (
                    <FormItem>
                      <FormLabel>{tCrc('alignment')} *</FormLabel>
                      <p className="text-sm text-gray-600 mb-3">{tCrc('alignmentDesc')}</p>
                      <CrcDisplay
                        selected={selectedCRCs}
                        onChange={handleCrcChange}
                      />
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
                        <FormLabel>{t('visibility')}</FormLabel>
                        <p className="text-sm text-gray-600">
                          {t('visibilityDesc')}
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
                    {tc('cancel')}
                  </Button>
                  <Button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('savingProgram')}
                      </>
                    ) : (
                      t('createProgramBtn')
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
