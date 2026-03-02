'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from '@/i18n/navigation'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { getCurrentSession, isOnboardedUser } from '@/lib/auth/session'
import { resolvePartnerContext } from '@/lib/auth/partner-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { SdgDisplay, CrcDisplay } from '@/components/framework-selector'
import {
  ArrowLeft,
  CheckCircle,
  Save,
  Plus,
  Trash2,
  X,
} from 'lucide-react'

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

type ContactEntry = {
  name: string
  email: string
  role: string
  phone?: string
  isPrimary?: boolean
}

const DEFAULT_MISSION =
  "Save the Children works to protect children's rights through education, community partnerships, and youth participation."

const DEFAULT_PRIMARY_CONTACT: ContactEntry = {
  name: 'Giulia Ferraro',
  email: 'direttore@savethechildren.it',
  role: 'Country Program Lead',
  phone: '',
  isPrimary: true,
}

const DEFAULT_OTHER_CONTACTS: ContactEntry[] = [
  {
    name: 'Marco Bianchi',
    email: 'coordinamento@savethechildren.it',
    role: 'Regional Coordinator',
    phone: '',
    isPrimary: false,
  },
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

export default function EditProfilePage() {
  const t = useTranslations('profile.edit')
  const tc = useTranslations('common')
  const tCrc = useTranslations('crc')
  const [saveComplete, setSaveComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSDGs, setSelectedSDGs] = useState<string[]>([])
  const [selectedCRCs, setSelectedCRCs] = useState<string[]>([])
  const [selectedThematicAreas, setSelectedThematicAreas] = useState<string[]>([])
  const [customThematicInput, setCustomThematicInput] = useState('')
  const [otherContacts, setOtherContacts] = useState<ContactEntry[]>(DEFAULT_OTHER_CONTACTS)

  const { ready: prototypeReady, database, updateRecord } = usePrototypeDb()
  const [session, setSession] = useState(() => getCurrentSession())
  const [dataLoaded, setDataLoaded] = useState(false)

  useEffect(() => {
    setSession(getCurrentSession())
  }, [])

  const isFreshUser = useMemo(() => isOnboardedUser(session), [session])

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

  // Load existing data — from partnerRecord (demo) or localStorage (fresh)
  useEffect(() => {
    if (dataLoaded) return

    if (isFreshUser) {
      // Fresh onboarded user: load from localStorage
      const orgName = session?.organization ?? ''
      const storedContactName = typeof window !== 'undefined' ? localStorage.getItem('onboarding_contactName') : null
      const storedContactEmail = typeof window !== 'undefined' ? localStorage.getItem('onboarding_contactEmail') : null
      const storedContactRole = typeof window !== 'undefined' ? localStorage.getItem('onboarding_contactRole') : null
      const storedContactPhone = typeof window !== 'undefined' ? localStorage.getItem('onboarding_contactPhone') : null
      const storedSdgFocus = typeof window !== 'undefined' ? localStorage.getItem('onboarding_sdgFocus') : null
      const storedMission = typeof window !== 'undefined' ? localStorage.getItem('onboarding_missionStatement') : null
      const storedThematicAreas = typeof window !== 'undefined' ? localStorage.getItem('onboarding_thematicAreas') : null
      const storedCrcFocus = typeof window !== 'undefined' ? localStorage.getItem('onboarding_crcFocus') : null

      const sdgFocusArray: number[] = storedSdgFocus ? JSON.parse(storedSdgFocus) : []
      const sdgTags = sdgFocusArray.map(String)
      const thematicAreas: string[] = storedThematicAreas ? JSON.parse(storedThematicAreas) : []
      const crcFocus: string[] = storedCrcFocus ? JSON.parse(storedCrcFocus) : []

      form.setValue('organizationName', orgName)
      form.setValue('mission', storedMission || '')
      form.setValue('sdgFocus', sdgTags)
      form.setValue('thematicAreas', thematicAreas)
      form.setValue('crcFocus', crcFocus)
      form.setValue('primaryContactName', storedContactName || '')
      form.setValue('primaryContactEmail', storedContactEmail || '')
      form.setValue('primaryContactRole', storedContactRole || '')
      form.setValue('primaryContactPhone', storedContactPhone || '')

      setSelectedSDGs(sdgTags)
      setSelectedThematicAreas(thematicAreas)
      setSelectedCRCs(crcFocus)
      setOtherContacts([])
      setDataLoaded(true)
    } else if (partnerContext?.partnerRecord) {
      const partner = partnerContext.partnerRecord

      const mission = partner.mission?.trim() || DEFAULT_MISSION

      const primaryContact = (partner as unknown as { primaryContact?: ContactEntry }).primaryContact
      const normalizedPrimary: ContactEntry = {
        ...DEFAULT_PRIMARY_CONTACT,
        ...(primaryContact ?? {}),
        isPrimary: true,
      }

      const partnerOtherContacts =
        (partner as unknown as { otherContacts?: ContactEntry[] }).otherContacts ?? []
      const normalizedOthers =
        Array.isArray(partnerOtherContacts) && partnerOtherContacts.length > 0
          ? partnerOtherContacts.map((contact) => ({
              name: contact.name ?? '',
              email: contact.email ?? '',
              role: contact.role ?? '',
              phone: contact.phone ?? '',
              isPrimary: false,
            }))
          : DEFAULT_OTHER_CONTACTS

      form.setValue('organizationName', partner.organizationName || '')
      form.setValue('mission', mission)
      form.setValue('thematicAreas', partner.thematicTags || [])
      form.setValue('sdgFocus', partner.sdgTags?.map(String) || [])
      form.setValue('crcFocus', partner.childRightsFocus || [])

      setSelectedThematicAreas(partner.thematicTags || [])
      setSelectedSDGs(partner.sdgTags?.map(String) || [])
      setSelectedCRCs(partner.childRightsFocus || [])

      form.setValue('primaryContactName', normalizedPrimary.name)
      form.setValue('primaryContactEmail', normalizedPrimary.email)
      form.setValue('primaryContactRole', normalizedPrimary.role)
      form.setValue('primaryContactPhone', normalizedPrimary.phone || '')
      setOtherContacts(normalizedOthers)
      setDataLoaded(true)
    }
  }, [partnerContext, form, isFreshUser, session, dataLoaded])

  const handleSdgChange = (sdgs: number[]) => {
    const asStrings = sdgs.map(String)
    setSelectedSDGs(asStrings)
    form.setValue('sdgFocus', asStrings)
  }

  const handleCrcChange = (articles: string[]) => {
    setSelectedCRCs(articles)
    form.setValue('crcFocus', articles)
  }

  const handleThematicToggle = (area: string) => {
    const newSelection = selectedThematicAreas.includes(area)
      ? selectedThematicAreas.filter(a => a !== area)
      : [...selectedThematicAreas, area]

    setSelectedThematicAreas(newSelection)
    form.setValue('thematicAreas', newSelection)
  }

  const handleAddCustomThematic = () => {
    const trimmed = customThematicInput.trim()
    if (!trimmed) return
    if (selectedThematicAreas.some(a => a.toLowerCase() === trimmed.toLowerCase())) {
      setCustomThematicInput('')
      return
    }
    const newSelection = [...selectedThematicAreas, trimmed]
    setSelectedThematicAreas(newSelection)
    form.setValue('thematicAreas', newSelection)
    setCustomThematicInput('')
  }

  const handleOtherContactChange = (
    index: number,
    field: keyof ContactEntry,
    value: string,
  ) => {
    setOtherContacts((prev) =>
      prev.map((contact, i) =>
        i === index
          ? {
              ...contact,
              [field]: value,
            }
          : contact,
      ),
    )
  }

  const handleAddContact = () => {
    setOtherContacts((prev) => [
      ...prev,
      { name: '', email: '', role: '', phone: '', isPrimary: false },
    ])
  }

  const handleRemoveContact = (index: number) => {
    setOtherContacts((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (data: ProfileData) => {
    const normalizedOtherContacts = otherContacts
      .map((contact) => ({
        name: contact.name?.trim() ?? '',
        email: contact.email?.trim() ?? '',
        role: contact.role?.trim() ?? '',
        phone: contact.phone?.trim() ?? '',
        isPrimary: false,
      }))
      .filter((contact) => contact.name || contact.email || contact.role)

    setIsLoading(true)
    try {
      if (isFreshUser) {
        // Save to localStorage for fresh onboarded users
        localStorage.setItem('organizationName', data.organizationName)
        localStorage.setItem('onboarding_missionStatement', data.mission)
        localStorage.setItem('onboarding_contactName', data.primaryContactName)
        localStorage.setItem('onboarding_contactEmail', data.primaryContactEmail)
        localStorage.setItem('onboarding_contactRole', data.primaryContactRole)
        localStorage.setItem('onboarding_contactPhone', data.primaryContactPhone || '')
        localStorage.setItem('onboarding_sdgFocus', JSON.stringify(data.sdgFocus.map(Number)))
        localStorage.setItem('onboarding_thematicAreas', JSON.stringify(data.thematicAreas))
        localStorage.setItem('onboarding_crcFocus', JSON.stringify(data.crcFocus || []))
      } else if (partnerContext?.partnerId && updateRecord) {
        // Update partner record for demo users
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
          otherContacts: normalizedOtherContacts,
        } as Record<string, unknown>)
      }

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
            <Link href="/partner/profile/overview">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                {t('backToProfile')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!dataLoaded) {
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
              <Link href="/partner/profile/overview">
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
                <CardDescription>
                  {t('contactsDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-gray-800">{t('projectLeader')}</div>
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
                </div>

                <div className="space-y-3 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{t('otherContacts')}</div>
                      <p className="text-xs text-gray-600">
                        {t('otherContactsDesc')}
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddContact}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('addContact')}
                    </Button>
                  </div>

                  {otherContacts.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                      {t('noAdditionalContacts')}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {otherContacts.map((contact, index) => (
                        <div key={`${contact.email}-${index}`} className="rounded-lg border border-gray-200 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-sm font-medium text-gray-900">
                              Contact #{index + 1}
                            </div>
                            {otherContacts.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleRemoveContact(index)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                {tc('remove')}
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input
                                  value={contact.name}
                                  onChange={(e) => handleOtherContactChange(index, 'name', e.target.value)}
                                  placeholder="Full name"
                                />
                              </FormControl>
                            </FormItem>
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  value={contact.email}
                                  onChange={(e) => handleOtherContactChange(index, 'email', e.target.value)}
                                  placeholder="name@organization.org"
                                />
                              </FormControl>
                            </FormItem>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            <FormItem>
                              <FormLabel>Role/Title</FormLabel>
                              <FormControl>
                                <Input
                                  value={contact.role}
                                  onChange={(e) => handleOtherContactChange(index, 'role', e.target.value)}
                                  placeholder="e.g., Country Coordinator"
                                />
                              </FormControl>
                            </FormItem>
                            <FormItem>
                              <FormLabel>Phone (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  value={contact.phone}
                                  onChange={(e) => handleOtherContactChange(index, 'phone', e.target.value)}
                                  placeholder="+45 12 34 56 78"
                                />
                              </FormControl>
                            </FormItem>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Thematic Areas */}
            <Card>
              <CardHeader>
                <CardTitle>{t('thematicAreas')} *</CardTitle>
                <CardDescription>{t('thematicAreasDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                {selectedThematicAreas.filter(a => !THEMATIC_TAGS.includes(a)).length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                    {selectedThematicAreas.filter(a => !THEMATIC_TAGS.includes(a)).map(area => (
                      <Badge
                        key={area}
                        variant="default"
                        className="bg-purple-600 hover:bg-purple-700 cursor-pointer flex items-center gap-1"
                        onClick={() => handleThematicToggle(area)}
                      >
                        {area}
                        <X className="w-3 h-3 ml-0.5" />
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    value={customThematicInput}
                    onChange={(e) => setCustomThematicInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddCustomThematic()
                      }
                    }}
                    placeholder={t('customThematicPlaceholder')}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCustomThematic}
                    disabled={!customThematicInput.trim()}
                    className="px-4"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {t('addCustomThematic')}
                  </Button>
                </div>
                {selectedThematicAreas.length > 0 && (
                  <p className="text-sm text-gray-600">
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
                <SdgDisplay
                  selected={selectedSDGs.map(Number)}
                  onChange={handleSdgChange}
                  max={5}
                />
              </CardContent>
            </Card>

            {/* CRC Child Rights Focus */}
            <Card>
              <CardHeader>
                <CardTitle>{tCrc('childRightsFocusOptional')}</CardTitle>
                <CardDescription>{tCrc('childRightsFocusDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <CrcDisplay
                  selected={selectedCRCs}
                  onChange={handleCrcChange}
                  max={10}
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Link href="/partner/profile/overview" className="flex-1">
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
