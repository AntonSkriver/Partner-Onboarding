'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { buildProgramSummariesForPartner, buildProgramSummary } from '@/lib/programs/selectors'
import { getCurrentSession } from '@/lib/auth/session'
import { resolvePartnerContext } from '@/lib/auth/partner-context'
import { getScopedParentPartnerIds, getScopedParentPartners } from '@/lib/parent/network'
import type { ResourceType } from '@/lib/types/resource'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload, 
  File, 
  Video, 
  Globe,
  Book,
  Gamepad2,
  Presentation,
  ArrowLeft,
  CheckCircle,
  X,
  Plus
} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { SDGIcon, SDG_DATA } from '@/components/sdg-icons'

const resourceSchema = z.object({
  title: z.string().min(3, 'Title is required (minimum 3 characters)'),
  description: z.string().min(10, 'Description is required (minimum 10 characters)'),
  type: z.enum(['document', 'video', 'website', 'presentation', 'book', 'game', 'quiz']),
  sdgAlignment: z.array(z.string()).min(1, 'Select at least one SDG'),
  crcAlignment: z.array(z.string()).min(1, 'Select at least one CRC article'),
  targetAudience: z.array(z.string()).min(1, 'Select at least one audience'),
  language: z.string().min(1, 'Language is required'),
  isPublic: z.boolean(),
  programAssignment: z.enum(['all', 'specific']),
  specificPrograms: z.array(z.string()).default([]),
  file: z.any().optional(),
  url: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  availabilityScope: z.enum(['all_partners', 'specific_partners']).default('all_partners'),
  targetPartners: z.array(z.string()).default([]),
}).superRefine((values, ctx) => {
  if (values.programAssignment === 'specific' && (!values.specificPrograms || values.specificPrograms.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['specificPrograms'],
      message: 'Select at least one program.',
    })
  }
  if (values.availabilityScope === 'specific_partners' && values.targetPartners.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['targetPartners'],
      message: 'Select at least one partner organization.',
    })
  }
})

type ResourceData = z.input<typeof resourceSchema>

const resourceTypes = [
  { value: 'document', label: 'Document (PDF, Word)', icon: File },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'website', label: 'Website/Link', icon: Globe },
  { value: 'presentation', label: 'Presentation', icon: Presentation },
  { value: 'book', label: 'Book/eBook', icon: Book },
  { value: 'game', label: 'Educational Game', icon: Gamepad2 },
]

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

const sdgOptions = [
  { id: '1', title: 'No Poverty', color: 'bg-red-500' },
  { id: '2', title: 'Zero Hunger', color: 'bg-yellow-500' },
  { id: '3', title: 'Good Health', color: 'bg-green-500' },
  { id: '4', title: 'Quality Education', color: 'bg-red-600' },
  { id: '5', title: 'Gender Equality', color: 'bg-orange-500' },
  { id: '6', title: 'Clean Water', color: 'bg-blue-400' },
  { id: '7', title: 'Clean Energy', color: 'bg-yellow-600' },
  { id: '8', title: 'Economic Growth', color: 'bg-red-700' },
  { id: '9', title: 'Innovation', color: 'bg-orange-600' },
  { id: '10', title: 'Reduced Inequalities', color: 'bg-pink-500' },
  { id: '11', title: 'Sustainable Cities', color: 'bg-yellow-700' },
  { id: '12', title: 'Responsible Consumption', color: 'bg-green-600' },
  { id: '13', title: 'Climate Action', color: 'bg-green-700' },
  { id: '14', title: 'Life Below Water', color: 'bg-blue-500' },
  { id: '15', title: 'Life on Land', color: 'bg-green-800' },
  { id: '16', title: 'Peace & Justice', color: 'bg-blue-600' },
  { id: '17', title: 'Partnerships', color: 'bg-blue-800' },
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

const audiences = [
  { value: 'primary', label: 'Primary School (Ages 6-11)' },
  { value: 'secondary', label: 'Secondary School (Ages 12-18)' },
  { value: 'teachers', label: 'Teachers' },
  { value: 'parents', label: 'Parents/Families' },
]

const languages = [
  'English', 'Danish', 'Swedish', 'Norwegian', 'German', 'French', 'Spanish', 'Italian', 'Other'
]

export default function UploadContentPage() {
  const t = useTranslations('content')
  const tc = useTranslations('common')
  const [uploadComplete, setUploadComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSDGs, setSelectedSDGs] = useState<string[]>([])
  const [selectedCRCs, setSelectedCRCs] = useState<string[]>([])
  const [activeCRCCategory, setActiveCRCCategory] = useState('general-principles')
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([])
  const [uploadTab, setUploadTab] = useState('file')
  const [tagInput, setTagInput] = useState('')
  const [customTags, setCustomTags] = useState<string[]>([])
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([])
  const [selectedTargetPartners, setSelectedTargetPartners] = useState<string[]>([])
  const [session, setSession] = useState(() => getCurrentSession())

  const { ready: prototypeReady, database, createRecord } = usePrototypeDb()

  useEffect(() => {
    setSession(getCurrentSession())
  }, [])

  const partnerContext = useMemo(
    () => resolvePartnerContext(session, database),
    [session, database],
  )

  const isParentUploader = session?.role === 'parent'
  const baseProfilePath = isParentUploader ? '/parent/profile' : '/partner/profile'
  const uploadRouteBackPath = `${baseProfilePath}/resources`

  const programSummaries = useMemo(() => {
    if (!prototypeReady || !database) {
      return []
    }

    if (isParentUploader) {
      const scopedPartnerIds = new Set(
        getScopedParentPartnerIds(database, session?.organization),
      )
      return database.programs
        .filter((program) => scopedPartnerIds.has(program.partnerId))
        .map((program) => buildProgramSummary(database, program))
    }

    // Partners can only see their own and related programs (host/co-host/sponsor)
    if (!partnerContext.partnerId) {
      return []
    }

    return buildProgramSummariesForPartner(database, partnerContext.partnerId, {
      includeRelatedPrograms: true,
    })
  }, [prototypeReady, database, isParentUploader, partnerContext])

  const targetablePartners = useMemo(() => {
    if (!database) return []

    const currentOrg = session?.organization?.trim().toLowerCase()

    if (isParentUploader) {
      return getScopedParentPartners(database, session?.organization).filter((partner) => {
        if (!currentOrg) return true
        return partner.organizationName.toLowerCase() !== currentOrg
      })
    }

    return database.partners.filter((partner) => {
      if (!currentOrg) return true
      return partner.organizationName.toLowerCase() !== currentOrg
    })
  }, [database, isParentUploader, session?.organization])

  const form = useForm<ResourceData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'document',
      sdgAlignment: [],
      crcAlignment: [],
      targetAudience: [],
      language: 'English',
      isPublic: false,
      programAssignment: 'all',
      specificPrograms: [],
      tags: [],
      availabilityScope: 'all_partners',
      targetPartners: [],
    },
  })

  const watchType = form.watch('type')
  const isWebsite = watchType === 'website'
  const watchProgramAssignment = form.watch('programAssignment')
  const watchAvailabilityScope = form.watch('availabilityScope')

  const handleProgramToggle = (programId: string) => {
    const newSelection = selectedPrograms.includes(programId)
      ? selectedPrograms.filter(id => id !== programId)
      : [...selectedPrograms, programId]

    setSelectedPrograms(newSelection)
    form.setValue('specificPrograms', newSelection)
  }

  const handleTargetPartnerToggle = (partnerId: string) => {
    const newSelection = selectedTargetPartners.includes(partnerId)
      ? selectedTargetPartners.filter((id) => id !== partnerId)
      : [...selectedTargetPartners, partnerId]

    setSelectedTargetPartners(newSelection)
    form.setValue('targetPartners', newSelection)
  }

  const handleSDGToggle = (sdgId: string) => {
    const newSelection = selectedSDGs.includes(sdgId)
      ? selectedSDGs.filter(id => id !== sdgId)
      : [...selectedSDGs, sdgId]

    setSelectedSDGs(newSelection)
    form.setValue('sdgAlignment', newSelection)
  }

  const handleCRCToggle = (crcId: string) => {
    const newSelection = selectedCRCs.includes(crcId)
      ? selectedCRCs.filter(id => id !== crcId)
      : [...selectedCRCs, crcId]

    setSelectedCRCs(newSelection)
    form.setValue('crcAlignment', newSelection)
  }

  const handleAudienceToggle = (audience: string) => {
    const newSelection = selectedAudiences.includes(audience)
      ? selectedAudiences.filter(a => a !== audience)
      : [...selectedAudiences, audience]
    
    setSelectedAudiences(newSelection)
    form.setValue('targetAudience', newSelection)
  }

  const addTag = () => {
    if (tagInput.trim() && !customTags.includes(tagInput.trim())) {
      const newTags = [...customTags, tagInput.trim()]
      setCustomTags(newTags)
      form.setValue('tags', newTags)
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    const newTags = customTags.filter(t => t !== tag)
    setCustomTags(newTags)
    form.setValue('tags', newTags)
  }

  const handleSubmit = async (data: ResourceData) => {
    setIsLoading(true)
    try {
      const sourceType: 'url' | 'file' =
        isWebsite || uploadTab === 'url' ? 'url' : 'file'
      const sourceUrl = data.url?.trim() || undefined
      const timestamp = new Date().toISOString()

      createRecord('resources', {
        title: data.title.trim(),
        description: data.description.trim(),
        type: data.type as ResourceType,
        language: data.language,
        targetAudience: selectedAudiences,
        sdgAlignment: selectedSDGs.map((value) => Number.parseInt(value, 10)).filter(Number.isInteger),
        crcAlignment: selectedCRCs,
        tags: customTags,
        isPublic: data.isPublic,
        sourceType,
        sourceUrl,
        heroImageUrl: sourceType === 'url' ? sourceUrl : undefined,
        ownerRole: isParentUploader ? 'parent' : 'partner',
        ownerOrganization:
          session?.organization ||
          partnerContext.partnerRecord?.organizationName ||
          'Unknown organization',
        ownerPartnerId: isParentUploader ? undefined : partnerContext.partnerId ?? undefined,
        createdBy: session?.email || 'unknown@class2class.org',
        programAssignment: data.programAssignment,
        specificProgramIds: data.programAssignment === 'specific' ? selectedPrograms : [],
        availabilityScope: isParentUploader ? data.availabilityScope : 'organization',
        targetPartnerIds:
          isParentUploader && data.availabilityScope === 'specific_partners'
            ? selectedTargetPartners
            : [],
        createdAt: timestamp,
        updatedAt: timestamp,
      })

      setUploadComplete(true)
    } catch (error) {
      console.error('Failed to upload resource:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (uploadComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('uploaded')}</h2>
            <p className="text-gray-600 mb-6">
              {isParentUploader
                ? 'Your resource is now published for the selected partner catalogs.'
                : 'Your resource has been added to your organization catalog.'}
            </p>
            <div className="space-y-2">
              <Link href={uploadRouteBackPath}>
                <Button variant="profile" className="w-full">
                  {t('backToResources')}
                </Button>
              </Link>
              <Button variant="outline" onClick={() => setUploadComplete(false)}>
                {t('uploadMore')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={uploadRouteBackPath}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('backToResources')}
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('uploadTitle')}</h1>
                <p className="text-gray-600">
                  {isParentUploader
                    ? 'Publish resources to all partners or selected partner catalogs.'
                    : t('uploadSubtitle')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Upload className="h-4 w-4" />
              <span>{t('contentBank')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t('resourceInfo')}</CardTitle>
                <CardDescription>Basic details about your educational resource</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('resourceTitle')} *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Children's Rights Activity Guide" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('resourceType')} *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('selectResourceType')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {resourceTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center">
                                  <type.icon className="h-4 w-4 mr-2" />
                                  {type.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                      <FormLabel>{t('description')} *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what this resource is about, how to use it, and what students will learn..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('language')} *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('selectLanguage')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {languages.map((lang) => (
                              <SelectItem key={lang} value={lang}>
                                {lang}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('sharing')}</label>
                    <FormField
                      control={form.control}
                      name="isPublic"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="isPublic"
                              checked={field.value}
                              onChange={field.onChange}
                              className="rounded border-gray-300"
                            />
                            <label htmlFor="isPublic" className="text-sm">
                              {t('shareWithAll')}
                            </label>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Program Assignment */}
            <Card>
              <CardHeader>
                <CardTitle>{t('programAssignment')} *</CardTitle>
                <CardDescription>
                  Assign this resource to specific programs or make it available to all programs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="programAssignment"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-3">
                        <div
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            field.value === 'all'
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                          }`}
                          onClick={() => {
                            field.onChange('all')
                            setSelectedPrograms([])
                            form.setValue('specificPrograms', [])
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{t('allPrograms')}</div>
                              <p className="text-sm text-gray-600 mt-1">
                                Make this resource available across all your programs (e.g., getting started guides, general educational materials)
                              </p>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                field.value === 'all'
                                  ? 'border-purple-500 bg-purple-500'
                                  : 'border-gray-300'
                              }`}
                            >
                              {field.value === 'all' && (
                                <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            field.value === 'specific'
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                          }`}
                          onClick={() => field.onChange('specific')}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{t('specificPrograms')}</div>
                              <p className="text-sm text-gray-600 mt-1">
                                Assign to specific programs only (e.g., program-specific activity guides, specialized content)
                              </p>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                field.value === 'specific'
                                  ? 'border-purple-500 bg-purple-500'
                                  : 'border-gray-300'
                              }`}
                            >
                              {field.value === 'specific' && (
                                <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchProgramAssignment === 'specific' && (
                  <div className="space-y-3 pt-2">
                    <label className="text-sm font-medium text-gray-700">{t('selectPrograms')} *</label>
                    {programSummaries.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {programSummaries.map(({ program }) => (
                          <div
                            key={program.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedPrograms.includes(program.id)
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                            }`}
                            onClick={() => handleProgramToggle(program.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  {program.displayTitle ?? program.name}
                                </div>
                                <p className="text-xs text-gray-600 mt-0.5">
                                  {program.status === 'active' ? 'Active' : 'Inactive'} • {program.description?.substring(0, 60)}...
                                </p>
                              </div>
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center ml-3 flex-shrink-0 ${
                                  selectedPrograms.includes(program.id)
                                    ? 'border-purple-500 bg-purple-500'
                                    : 'border-gray-300'
                                }`}
                              >
                                {selectedPrograms.includes(program.id) && (
                                  <CheckCircle className="w-3 h-3 text-white" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 border border-gray-200 rounded-lg bg-gray-50">
                        <p className="text-sm text-gray-600">{t('noPrograms')}</p>
                        <Link href={`${baseProfilePath}/programs/create`}>
                          <Button variant="link" size="sm" className="mt-2">
                            {t('createFirstProgram')}
                          </Button>
                        </Link>
                      </div>
                    )}
                    {selectedPrograms.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>{selectedPrograms.length}</strong> program{selectedPrograms.length > 1 ? 's' : ''} selected
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {isParentUploader && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('partnerCatalogVisibility')} *</CardTitle>
                  <CardDescription>
                    Decide whether this parent resource is available to all partner organizations
                    or only selected partners.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="availabilityScope"
                    render={({ field }) => (
                      <FormItem>
                        <div className="space-y-3">
                          <div
                            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                              field.value === 'all_partners'
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              field.onChange('all_partners')
                              setSelectedTargetPartners([])
                              form.setValue('targetPartners', [])
                            }}
                          >
                            <div className="font-medium text-gray-900">{t('allPartnerCatalogs')}</div>
                            <p className="text-sm text-gray-600 mt-1">
                              Every partner organization can access this resource.
                            </p>
                          </div>

                          <div
                            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                              field.value === 'specific_partners'
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                            }`}
                            onClick={() => field.onChange('specific_partners')}
                          >
                            <div className="font-medium text-gray-900">{t('specificPartnerCatalogs')}</div>
                            <p className="text-sm text-gray-600 mt-1">
                              Limit visibility to selected partner organizations.
                            </p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchAvailabilityScope === 'specific_partners' && (
                    <div className="space-y-3 pt-2">
                      <label className="text-sm font-medium text-gray-700">Select Partner Organizations *</label>
                      {targetablePartners.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                          {targetablePartners.map((partner) => (
                            <div
                              key={partner.id}
                              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                selectedTargetPartners.includes(partner.id)
                                  ? 'border-purple-500 bg-purple-50'
                                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                              }`}
                              onClick={() => handleTargetPartnerToggle(partner.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-gray-900">
                                  {partner.organizationName}
                                </div>
                                <div
                                  className={`w-4 h-4 rounded border flex items-center justify-center ml-3 flex-shrink-0 ${
                                    selectedTargetPartners.includes(partner.id)
                                      ? 'border-purple-500 bg-purple-500'
                                      : 'border-gray-300'
                                  }`}
                                >
                                  {selectedTargetPartners.includes(partner.id) && (
                                    <CheckCircle className="w-3 h-3 text-white" />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No partner organizations available.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* File Upload or URL */}
            <Card>
              <CardHeader>
                <CardTitle>{t('resourceContent')}</CardTitle>
                <CardDescription>
                  {isWebsite ? 'Provide the URL to your online resource' : 'Upload your file or provide a link'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isWebsite ? (
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('websiteUrl')} *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/educational-resource"
                            type="url"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <Tabs value={uploadTab} onValueChange={setUploadTab}>
                    <TabsList>
                      <TabsTrigger value="file">{t('uploadFile')}</TabsTrigger>
                      <TabsTrigger value="url">{t('provideLink')}</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="file" className="mt-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <div className="space-y-2">
                          <p className="text-gray-600">{t('dragDrop')}</p>
                          <Button type="button" variant="outline">
                            {t('chooseFile')}
                          </Button>
                          <p className="text-xs text-gray-500">
                            {t('maxFileSize')}
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="url" className="mt-4">
                      <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Resource URL</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://example.com/your-resource"
                                type="url"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>

            {/* Target Audience */}
            <Card>
              <CardHeader>
                <CardTitle>{t('targetAudience')} *</CardTitle>
                <CardDescription>Who is this resource designed for?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {audiences.map((audience) => (
                    <div
                      key={audience.value}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedAudiences.includes(audience.value)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                      onClick={() => handleAudienceToggle(audience.value)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{audience.label}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            selectedAudiences.includes(audience.value)
                              ? 'border-purple-500 bg-purple-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedAudiences.includes(audience.value) && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SDG Alignment */}
            <Card>
              <CardHeader>
                <CardTitle>SDG Alignment *</CardTitle>
                <CardDescription>Which UN Sustainable Development Goals does this resource support?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {sdgOptions.map((sdg) => {
                    const isSelected = selectedSDGs.includes(sdg.id)
                    const sdgNumber = parseInt(sdg.id)
                    const sdgData = SDG_DATA[sdgNumber]

                    return (
                      <div
                        key={sdg.id}
                        className="flex flex-col items-center cursor-pointer group"
                        onClick={() => handleSDGToggle(sdg.id)}
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
                          {sdgData?.title || sdg.title}
                        </p>
                      </div>
                    )
                  })}
                </div>
                {selectedSDGs.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Selected SDGs ({selectedSDGs.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSDGs.map(sdgId => {
                        const sdg = sdgOptions.find(s => s.id === sdgId)
                        return sdg ? (
                          <Badge key={sdgId} variant="secondary" className="text-xs">
                            SDG {sdg.id}: {sdg.title}
                          </Badge>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CRC Alignment */}
            <Card>
              <CardHeader>
                <CardTitle>CRC Alignment *</CardTitle>
                <CardDescription>Which UN Convention on the Rights of the Child articles does this resource address?</CardDescription>
              </CardHeader>
              <CardContent>
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
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {category.articles.map(articleId => {
                          const crc = crcOptions.find(c => c.id === articleId)
                          const isSelected = selectedCRCs.includes(articleId)
                          const iconPath = `/crc/icons/article-${articleId.padStart(2, '0')}.png`

                          return (
                            <div
                              key={articleId}
                              className={`flex flex-col items-center cursor-pointer p-3 rounded-lg border transition-all ${
                                isSelected
                                  ? 'border-purple-500 bg-purple-50 shadow-md'
                                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                              }`}
                              onClick={() => handleCRCToggle(articleId)}
                            >
                              <div className="relative w-16 h-16 mb-2">
                                <Image
                                  src={iconPath}
                                  alt={`CRC Article ${articleId}: ${crc?.title || ''}`}
                                  width={64}
                                  height={64}
                                  className="object-contain rounded-lg"
                                />
                              </div>
                              <p className="text-xs font-medium text-gray-900 text-center leading-tight">
                                Article {articleId}
                              </p>
                              <p className="text-xs text-gray-600 text-center mt-0.5 leading-tight">
                                {crc?.title}
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
                      Selected CRC Articles ({selectedCRCs.length}):
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
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>{t('tags')}</CardTitle>
                <CardDescription>Add tags to help teachers find your resource</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a tag (e.g., human rights, democracy, citizenship)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {customTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {customTags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="px-2 py-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 pt-4">
              <Link href={uploadRouteBackPath} className="flex-1">
                <Button variant="outline" className="w-full">
                  {tc('cancel')}
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  selectedSDGs.length === 0 ||
                  selectedCRCs.length === 0 ||
                  selectedAudiences.length === 0
                }
                variant="profile"
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Resource
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
