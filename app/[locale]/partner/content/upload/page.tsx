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
import type { ResourceType, ResourceAvailabilityScope } from '@/lib/types/resource'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import {
  Upload,
  ArrowLeft,
  CheckCircle,
  X,
  Plus
} from 'lucide-react'
import { Link } from '@/i18n/navigation'

import { ResourceInfoSection } from '@/components/partner/upload/resource-info-section'
import { ProgramAssignmentSection } from '@/components/partner/upload/program-assignment-section'
import { PartnerVisibilitySection } from '@/components/partner/upload/partner-visibility-section'
import { ResourceContentSection } from '@/components/partner/upload/resource-content-section'
import { TargetAudienceSection } from '@/components/partner/upload/target-audience-section'
import { SdgAlignmentSection } from '@/components/partner/upload/sdg-alignment-section'
import { CrcAlignmentSection } from '@/components/partner/upload/crc-alignment-section'

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
        availabilityScope: (isParentUploader ? data.availabilityScope : 'organization') as ResourceAvailabilityScope,
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
            <ResourceInfoSection control={form.control} />

            {/* Program Assignment */}
            <ProgramAssignmentSection
              control={form.control}
              setValue={form.setValue}
              watchProgramAssignment={watchProgramAssignment}
              selectedPrograms={selectedPrograms}
              programSummaries={programSummaries}
              baseProfilePath={baseProfilePath}
              onProgramToggle={handleProgramToggle}
              onClearPrograms={() => setSelectedPrograms([])}
            />

            {isParentUploader && (
              <PartnerVisibilitySection
                control={form.control}
                setValue={form.setValue}
                watchAvailabilityScope={watchAvailabilityScope}
                selectedTargetPartners={selectedTargetPartners}
                targetablePartners={targetablePartners}
                onTargetPartnerToggle={handleTargetPartnerToggle}
                onClearTargetPartners={() => setSelectedTargetPartners([])}
              />
            )}

            {/* File Upload or URL */}
            <ResourceContentSection
              control={form.control}
              isWebsite={isWebsite}
              uploadTab={uploadTab}
              onUploadTabChange={setUploadTab}
            />

            {/* Target Audience */}
            <TargetAudienceSection
              selectedAudiences={selectedAudiences}
              onAudienceToggle={handleAudienceToggle}
            />

            {/* SDG Alignment */}
            <SdgAlignmentSection
              selectedSDGs={selectedSDGs}
              onSDGToggle={handleSDGToggle}
            />

            {/* CRC Alignment */}
            <CrcAlignmentSection
              selectedCRCs={selectedCRCs}
              activeCRCCategory={activeCRCCategory}
              onCRCToggle={handleCRCToggle}
              onCRCCategoryChange={setActiveCRCCategory}
            />

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
