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
import Image from 'next/image'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, CheckCircle, Loader2, Sparkles } from 'lucide-react'
import { resolvePartnerContext } from '@/lib/auth/partner-context'
import { Badge } from '@/components/ui/badge'
import { SDGIcon, SDG_DATA } from '@/components/sdg-icons'
import {
  AGE_RANGE_VALUES,
  COUNTRY_OPTIONS,
  SDG_OPTIONS,
  STATUS_VALUES,
  COLLABORATION_TYPE_VALUES,
  PROGRAM_LANGUAGE_OPTIONS,
  friendlyLabel,
  programSchema,
} from '../shared'
import type { ProgramFormValues } from '../shared'

const CRC_CATEGORIES = [
  {
    id: 'general-principles',
    label: 'General Principles',
    description: 'Core principles of the Convention',
    articles: ['1', '2', '3', '4']
  },
  {
    id: 'civil-rights',
    label: 'Civil Rights & Freedoms',
    description: 'Identity, expression, and participation',
    articles: ['7', '8', '12', '13', '14', '15', '16', '17']
  },
  {
    id: 'family-care',
    label: 'Family & Care',
    description: 'Family environment and protection',
    articles: ['5', '9', '10', '11', '18', '19', '20', '21', '25']
  },
  {
    id: 'health-welfare',
    label: 'Health & Welfare',
    description: 'Health, disability, and standard of living',
    articles: ['6', '23', '24', '26', '27']
  },
  {
    id: 'education-culture',
    label: 'Education & Culture',
    description: 'Education, leisure, and cultural activities',
    articles: ['28', '29', '30', '31']
  },
  {
    id: 'special-protection',
    label: 'Special Protection',
    description: 'Protection from exploitation and abuse',
    articles: ['22', '32', '33', '34', '35', '36', '37', '38', '39', '40']
  }
]

const crcOptions = [
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
  const [activeCRCCategory, setActiveCRCCategory] = useState('general-principles')

  const { ready: dataReady, database, createRecord } = usePrototypeDb()

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

  const handleSDGToggle = (sdgId: number) => {
    const newSelection = selectedSDGs.includes(sdgId)
      ? selectedSDGs.filter(id => id !== sdgId)
      : [...selectedSDGs, sdgId]

    setSelectedSDGs(newSelection)
    form.setValue('sdgFocus', newSelection)
  }

  const handleCRCToggle = (crcId: string) => {
    const newSelection = selectedCRCs.includes(crcId)
      ? selectedCRCs.filter(id => id !== crcId)
      : [...selectedCRCs, crcId]

    setSelectedCRCs(newSelection)
    form.setValue('crcFocus', newSelection)
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
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                        {SDG_OPTIONS.map((sdg) => {
                          const isSelected = selectedSDGs.includes(sdg.value)
                          const sdgNumber = sdg.value
                          const sdgData = SDG_DATA[sdgNumber]

                          return (
                            <div
                              key={sdg.value}
                              className="flex flex-col items-center cursor-pointer group"
                              onClick={() => handleSDGToggle(sdg.value)}
                            >
                              <div className={`relative transition-all ${
                                isSelected
                                  ? 'ring-4 ring-purple-500 ring-offset-2 rounded-lg shadow-lg scale-105'
                                  : 'opacity-70 hover:opacity-100 hover:scale-105'
                              }`}>
                                <SDGIcon
                                  number={sdgNumber}
                                  size="md"
                                  showTitle={false}
                                  className="w-16 h-16 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
                                />
                              </div>
                              <p className="text-xs text-gray-600 text-center mt-1 leading-tight">
                                {sdgData?.title || sdg.label}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                      {selectedSDGs.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-medium text-gray-700">{tSdg('selectedSdgs', { count: selectedSDGs.length })}</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedSDGs.map(sdgId => {
                              const sdgData = SDG_DATA[sdgId]
                              return sdgData ? (
                                <Badge key={sdgId} variant="secondary" className="text-xs">
                                  SDG {sdgId}: {sdgData.title}
                                </Badge>
                              ) : null
                            })}
                          </div>
                        </div>
                      )}
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
                      <Tabs value={activeCRCCategory} onValueChange={setActiveCRCCategory}>
                        <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full mb-4">
                          {CRC_CATEGORIES.map(category => (
                            <TabsTrigger key={category.id} value={category.id} className="text-xs">
                              {category.label}
                            </TabsTrigger>
                          ))}
                        </TabsList>

                        {CRC_CATEGORIES.map(category => (
                          <TabsContent key={category.id} value={category.id} className="mt-4">
                            <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                              {category.articles.map(articleId => {
                                const crc = crcOptions.find(c => c.id === articleId)
                                const isSelected = selectedCRCs.includes(articleId)
                                const iconPath = `/crc/icons/article-${articleId.padStart(2, '0')}.png`

                                return (
                                  <div
                                    key={articleId}
                                    className="flex flex-col items-center cursor-pointer group"
                                    onClick={() => handleCRCToggle(articleId)}
                                  >
                                    <div className={`relative w-16 h-16 mb-[22px] transition-all ${
                                      isSelected
                                        ? 'ring-4 ring-purple-500 ring-offset-2 rounded-lg shadow-lg scale-105'
                                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                                    }`}>
                                      <Image
                                        src={iconPath}
                                        alt={`CRC Article ${articleId}: ${crc?.title || ''}`}
                                        width={64}
                                        height={64}
                                        className="object-contain rounded-lg"
                                      />
                                    </div>
                                    <p className="text-xs text-gray-600 text-center leading-tight">
                                      {crc?.title || `Art. ${articleId}`}
                                    </p>
                                  </div>
                                )
                              })}
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>

                      {selectedCRCs.length > 0 && (
                        <div className="mt-6 space-y-2 pt-4 border-t">
                          <p className="text-sm font-medium text-gray-700">
                            {tCrc('selectedArticles', { count: selectedCRCs.length })}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {selectedCRCs.map(crcId => {
                              const crc = crcOptions.find(c => c.id === crcId)
                              return crc ? (
                                <Badge key={crcId} variant="secondary" className="text-xs">
                                  Article {crc.id}: {crc.title}
                                </Badge>
                              ) : null
                            })}
                          </div>
                        </div>
                      )}
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
