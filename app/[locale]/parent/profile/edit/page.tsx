'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from '@/i18n/navigation'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { getCurrentSession } from '@/lib/auth/session'
import { resolvePartnerContext } from '@/lib/auth/partner-context'
import { getParentOrganizationProfilePreset } from '@/lib/parent/network'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SDGIcon, SDG_DATA } from '@/components/sdg-icons'
import {
  ArrowLeft,
  CheckCircle,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react'

// CRC Categories (same as partner edit)
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
  { id: '1', title: 'Definition of child' },
  { id: '2', title: 'Non-discrimination' },
  { id: '3', title: 'Best interests of child' },
  { id: '4', title: 'Implementation of rights' },
  { id: '5', title: 'Parental guidance' },
  { id: '6', title: 'Life, survival & development' },
  { id: '7', title: 'Birth registration & nationality' },
  { id: '8', title: 'Preservation of identity' },
  { id: '9', title: 'Separation from parents' },
  { id: '10', title: 'Family reunification' },
  { id: '11', title: 'Illicit transfer' },
  { id: '12', title: 'Respect for views of child' },
  { id: '13', title: 'Freedom of expression' },
  { id: '14', title: 'Freedom of thought' },
  { id: '15', title: 'Freedom of association' },
  { id: '16', title: 'Right to privacy' },
  { id: '17', title: 'Access to information' },
  { id: '18', title: 'Parental responsibilities' },
  { id: '19', title: 'Protection from violence' },
  { id: '20', title: 'Children without families' },
  { id: '21', title: 'Adoption' },
  { id: '22', title: 'Refugee children' },
  { id: '23', title: 'Children with disabilities' },
  { id: '24', title: 'Health services' },
  { id: '25', title: 'Periodic review' },
  { id: '26', title: 'Social security' },
  { id: '27', title: 'Adequate standard of living' },
  { id: '28', title: 'Right to education' },
  { id: '29', title: 'Goals of education' },
  { id: '30', title: 'Minority rights' },
  { id: '31', title: 'Leisure & play' },
  { id: '32', title: 'Child labour' },
  { id: '33', title: 'Drug abuse' },
  { id: '34', title: 'Sexual exploitation' },
  { id: '35', title: 'Abduction & trafficking' },
  { id: '36', title: 'Other exploitation' },
  { id: '37', title: 'Detention & punishment' },
  { id: '38', title: 'Armed conflicts' },
  { id: '39', title: 'Rehabilitative care' },
  { id: '40', title: 'Juvenile justice' },
]

const THEMATIC_TAGS = [
  'Environmental Education',
  'Global Citizenship',
  'Cultural Exchange',
  'STEM Education',
  'Arts and Culture',
  'Language Learning',
  'Digital Literacy',
  'Social Innovation',
  'Community Development',
  'Youth Leadership',
  'Entrepreneurship',
  'Health and Wellness',
  'Human Rights',
  'Peace Education',
  'Sustainability'
]

const profileSchema = z.object({
  organizationName: z.string().min(2, 'Organization name is required'),
  mission: z.string().min(10, 'Mission statement should be at least 10 characters'),
  thematicAreas: z.array(z.string()).min(1, 'Select at least one thematic area'),
  sdgFocus: z.array(z.string()).min(1, 'Select at least one SDG'),
  crcFocus: z.array(z.string()).optional(),
  primaryContactName: z.string().min(2, 'Primary contact name is required'),
  primaryContactEmail: z.string().email('Valid email is required'),
  primaryContactRole: z.string().min(2, 'Role is required'),
  primaryContactPhone: z.string().optional(),
})

type ProfileData = z.infer<typeof profileSchema>

export default function ParentEditProfilePage() {
  const t = useTranslations('profile.edit')
  const tc = useTranslations('common')
  const tSdg = useTranslations('sdg')
  const tCrc = useTranslations('crc')
  const router = useRouter()
  const [saveComplete, setSaveComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSDGs, setSelectedSDGs] = useState<string[]>([])
  const [selectedCRCs, setSelectedCRCs] = useState<string[]>([])
  const [activeCRCCategory, setActiveCRCCategory] = useState('general-principles')
  const [selectedThematicAreas, setSelectedThematicAreas] = useState<string[]>([])

  const { ready: prototypeReady, database, updateRecord } = usePrototypeDb()
  const [session, setSession] = useState(() => getCurrentSession())

  useEffect(() => {
    setSession(getCurrentSession())
  }, [])

  const partnerContext = useMemo(() => {
    if (!prototypeReady || !database) return null
    return resolvePartnerContext(session, database)
  }, [prototypeReady, database, session])

  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      organizationName: '',
      mission: '',
      thematicAreas: [],
      sdgFocus: [],
      crcFocus: [],
      primaryContactName: '',
      primaryContactEmail: '',
      primaryContactRole: '',
      primaryContactPhone: '',
    },
  })

  // Load existing data from parent organization preset
  useEffect(() => {
    const preset = getParentOrganizationProfilePreset(session?.organization)
    const defaultOrgName = preset.name
    const defaultMission = preset.mission
    const defaultThematicAreas = preset.thematicTags
    const defaultSDGs = preset.sdgTags
    const defaultCRCs = ['12', '24', '28', '31']
    const defaultContact = {
      name: preset.contacts[0]?.name ?? 'Global Partnerships',
      email: preset.contacts[0]?.email ?? 'partnerships@class2class.org',
      role: preset.contacts[0]?.role ?? 'Partnerships Lead',
      phone: '',
    }

    form.setValue('organizationName', defaultOrgName)
    form.setValue('mission', defaultMission)
    form.setValue('thematicAreas', defaultThematicAreas)
    form.setValue('sdgFocus', defaultSDGs)
    form.setValue('crcFocus', defaultCRCs)

    setSelectedThematicAreas(defaultThematicAreas)
    setSelectedSDGs(defaultSDGs)
    setSelectedCRCs(defaultCRCs)

    form.setValue('primaryContactName', defaultContact.name)
    form.setValue('primaryContactEmail', defaultContact.email)
    form.setValue('primaryContactRole', defaultContact.role)
    form.setValue('primaryContactPhone', defaultContact.phone)
  }, [form, session?.organization])

  const handleSDGToggle = (sdgId: string) => {
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

  const handleThematicToggle = (area: string) => {
    const newSelection = selectedThematicAreas.includes(area)
      ? selectedThematicAreas.filter(a => a !== area)
      : [...selectedThematicAreas, area]

    setSelectedThematicAreas(newSelection)
    form.setValue('thematicAreas', newSelection)
  }

  const handleSubmit = async (data: ProfileData) => {
    if (!partnerContext?.partnerId || !updateRecord) {
      console.error('Missing partner context or update function')
      return
    }

    setIsLoading(true)
    try {
      // Update partner record
      updateRecord('partners', partnerContext.partnerId, {
        organizationName: data.organizationName,
        mission: data.mission,
        thematicTags: data.thematicAreas,
        sdgTags: data.sdgFocus.map(Number),
        childRightsFocus: data.crcFocus || [],
        primaryContact: {
          name: data.primaryContactName,
          email: data.primaryContactEmail,
          role: data.primaryContactRole,
          phone: data.primaryContactPhone || '',
        },
      } as any)

      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaveComplete(true)
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (saveComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('profileUpdated')}</h2>
            <p className="text-gray-600 mb-6">
              {t('profileUpdatedDesc')}
            </p>
            <Link href="/parent/profile/overview">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                {t('backToProfile')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!prototypeReady || !partnerContext?.partnerRecord) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">{tc('loading')}</div>
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
              <Link href="/parent/profile/overview">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('backToProfile')}
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                <p className="text-gray-600">{t('subtitle')}</p>
              </div>
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
                <CardTitle>{t('basicInfo')}</CardTitle>
                <CardDescription>{t('basicInfoDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="organizationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('orgName')} *</FormLabel>
                      <FormControl>
                        <Input placeholder={t('orgNamePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('ourMission')} *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('missionPlaceholder')}
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('missionHelper')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t('contacts')}</CardTitle>
                <CardDescription>{t('contactsDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="primaryContactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contactName')} *</FormLabel>
                        <FormControl>
                          <Input placeholder={t('contactNamePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="primaryContactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contactEmail')} *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder={t('contactEmailPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="primaryContactRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('roleTitle')} *</FormLabel>
                        <FormControl>
                          <Input placeholder={t('roleTitlePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="primaryContactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('phone')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('phonePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Thematic Areas */}
            <Card>
              <CardHeader>
                <CardTitle>{t('thematicAreas')} *</CardTitle>
                <CardDescription>{t('thematicAreasDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {THEMATIC_TAGS.map((area) => (
                    <Badge
                      key={area}
                      variant={selectedThematicAreas.includes(area) ? 'default' : 'outline'}
                      className={`cursor-pointer transition-colors ${
                        selectedThematicAreas.includes(area)
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => handleThematicToggle(area)}
                    >
                      {area}
                    </Badge>
                  ))}
                </div>
                {selectedThematicAreas.length > 0 && (
                  <p className="text-sm text-gray-600 mt-3">
                    {tc('areasSelected', { count: selectedThematicAreas.length })}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* SDG Focus */}
            <Card>
              <CardHeader>
                <CardTitle>{t('sdgFocus')} *</CardTitle>
                <CardDescription>{t('sdgFocusDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {Array.from({ length: 17 }, (_, i) => i + 1).map((sdgNumber) => {
                    const sdgId = String(sdgNumber)
                    const isSelected = selectedSDGs.includes(sdgId)
                    const sdgData = SDG_DATA[sdgNumber]

                    return (
                      <div
                        key={sdgId}
                        className="flex flex-col items-center cursor-pointer group"
                        onClick={() => handleSDGToggle(sdgId)}
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
                          {sdgData?.title || `SDG ${sdgNumber}`}
                        </p>
                      </div>
                    )
                  })}
                </div>
                {selectedSDGs.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700">
                      {t('selectedSDGs', { count: selectedSDGs.length })}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedSDGs.map(sdgId => (
                        <Badge key={sdgId} variant="secondary" className="text-xs">
                          SDG {sdgId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CRC Child Rights Focus */}
            <Card>
              <CardHeader>
                <CardTitle>{tCrc('childRightsFocusOptional')}</CardTitle>
                <CardDescription>{tCrc('childRightsFocusDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeCRCCategory} onValueChange={setActiveCRCCategory}>
                  <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full mb-4">
                    {CRC_CATEGORIES.map(category => {
                      const crcLabelKey = {
                        'general-principles': 'generalPrinciples',
                        'civil-rights': 'civilRights',
                        'family-care': 'familyCare',
                        'health-welfare': 'healthWelfare',
                        'education-culture': 'educationCulture',
                        'special-protection': 'specialProtection',
                      }[category.id] as string
                      return (
                        <TabsTrigger key={category.id} value={category.id} className="text-xs">
                          {tCrc(crcLabelKey)}
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>

                  {CRC_CATEGORIES.map(category => {
                    const crcDescKey = {
                      'general-principles': 'generalPrinciplesDesc',
                      'civil-rights': 'civilRightsDesc',
                      'family-care': 'familyCareDesc',
                      'health-welfare': 'healthWelfareDesc',
                      'education-culture': 'educationCultureDesc',
                      'special-protection': 'specialProtectionDesc',
                    }[category.id] as string
                    return (
                    <TabsContent key={category.id} value={category.id} className="mt-4">
                      <p className="text-sm text-gray-600 mb-4">{tCrc(crcDescKey)}</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                        {category.articles.map(articleId => {
                          const crc = crcOptions.find(c => c.id === articleId)
                          const isSelected = selectedCRCs.includes(articleId)
                          const iconPath = `/crc/icons/article-${articleId.padStart(2, '0')}.png`

                          return (
                            <div
                              key={articleId}
                              className="flex flex-col items-center cursor-pointer group"
                              onClick={() => handleCRCToggle(articleId)}
                              title={crc?.title}
                            >
                              <div className={`relative w-16 h-16 transition-all ${
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
                              <p className="text-xs text-gray-600 text-center mt-1 leading-tight">
                                Art. {articleId}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </TabsContent>
                  )})}
                </Tabs>

                {selectedCRCs.length > 0 && (
                  <div className="mt-6 space-y-2 pt-4 border-t">
                    <p className="text-sm font-medium text-gray-700">
                      {t('selectedCRCs', { count: selectedCRCs.length })}
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

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Link href="/parent/profile/overview" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  {tc('cancel')}
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {tc('saving')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t('saveChanges')}
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
