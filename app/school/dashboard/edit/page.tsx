'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { SDG_DATA, SDGIcon } from '@/components/sdg-icons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { getCurrentSession } from '@/lib/auth/session'
import { cn } from '@/lib/utils'
import { ArrowLeft, Sparkles, Save } from 'lucide-react'
import type { UpdateInput } from '@/lib/storage/prototype-db'

type InstitutionWithProfile = {
  id: string
  name: string
  country?: string
  city?: string
  contactEmail?: string
  principalName?: string
  sdgFocus?: string[]
  childRightsFocus?: string[]
  mission?: string
  description?: string
}

const CRC_CATEGORIES = [
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

export default function SchoolProfileEditPage() {
  const router = useRouter()
  const { ready: prototypeReady, database, updateRecord } = usePrototypeDb()
  const [session, setSession] = useState(getCurrentSession())
  const [institution, setInstitution] = useState<InstitutionWithProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [activeCRCCategory, setActiveCRCCategory] = useState('general-principles')
  const [formState, setFormState] = useState({
    name: '',
    country: '',
    city: '',
    contactEmail: '',
    principalName: '',
    mission: '',
    description: '',
    sdgFocus: [] as string[],
    childRightsFocus: [] as string[],
  })

  useEffect(() => {
    setSession(getCurrentSession())
  }, [])

  const handleSDGToggle = (sdgId: string) => toggleSelection('sdgFocus', sdgId)
  const handleCRCToggle = (crcId: string) => toggleSelection('childRightsFocus', crcId)

  const loadInstitution = useCallback(() => {
    setLoading(true)
    const activeInstitutionId =
      typeof window !== 'undefined' ? window.localStorage.getItem('activeInstitutionId') : null
    const normalizedEmail = session?.email?.toLowerCase()
    const normalizedName = session?.organization?.trim().toLowerCase()

    const matchesCurrentSchool = (institution: { id: string; name?: string | null; contactEmail?: string | null }) => {
      if (activeInstitutionId && institution.id === activeInstitutionId) return true
      const name = institution.name?.trim().toLowerCase()
      const email = institution.contactEmail?.toLowerCase()
      return (normalizedName && name === normalizedName) || (normalizedEmail && email === normalizedEmail)
    }

    const match = database.institutions.find((inst) => matchesCurrentSchool(inst))

    if (!match) {
      setInstitution(null)
      setLoading(false)
      return
    }

    const profile: InstitutionWithProfile = {
      id: match.id,
      name: match.name,
      country: match.country,
      city: match.city,
      contactEmail: match.contactEmail,
      principalName: match.principalName,
      sdgFocus: (match as InstitutionWithProfile).sdgFocus ?? [],
      childRightsFocus: (match as InstitutionWithProfile).childRightsFocus ?? [],
      mission: (match as InstitutionWithProfile).mission ?? '',
      description: (match as InstitutionWithProfile).description ?? '',
    }

    setInstitution(profile)
    setFormState({
      name: profile.name || '',
      country: profile.country || '',
      city: profile.city || '',
      contactEmail: profile.contactEmail || '',
      principalName: profile.principalName || '',
      mission: profile.mission || '',
      description: profile.description || '',
      sdgFocus: [...(profile.sdgFocus ?? [])],
      childRightsFocus: [...(profile.childRightsFocus ?? [])],
    })
    setLoading(false)
  }, [database, session])

  useEffect(() => {
    if (!prototypeReady || !database) return
    loadInstitution()
  }, [prototypeReady, database, loadInstitution])

  const toggleSelection = (key: 'sdgFocus' | 'childRightsFocus', value: string) => {
    setFormState((prev) => {
      const current = new Set(prev[key])
      if (current.has(value)) {
        current.delete(value)
      } else {
        current.add(value)
      }
      return { ...prev, [key]: Array.from(current) }
    })
  }

  const handleSave = async () => {
    if (!institution) return
    setSaving(true)
    setSaveMessage('')
    try {
      const updates: Record<string, unknown> = {
        name: formState.name.trim(),
        country: formState.country,
        city: formState.city,
        contactEmail: formState.contactEmail,
        principalName: formState.principalName,
        mission: formState.mission,
        description: formState.description,
        sdgFocus: formState.sdgFocus,
        childRightsFocus: formState.childRightsFocus,
        updatedAt: new Date().toISOString(),
      }

      const updated = updateRecord(
        'institutions',
        institution.id,
        updates as unknown as UpdateInput<'institutions'>,
      )
      if (updated) {
        setSaveMessage('Profile updated')
        setInstitution({
          ...institution,
          ...updates,
          sdgFocus: formState.sdgFocus,
          childRightsFocus: formState.childRightsFocus,
        } as InstitutionWithProfile)
        setTimeout(() => setSaveMessage(''), 1800)
        router.refresh()
      }
    } catch (err) {
      console.error('Error saving school profile:', err)
      setSaveMessage('Could not save changes')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-1/2 rounded-xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    )
  }

  if (!institution) {
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <p className="mb-2 text-lg font-semibold text-gray-900">No school profile found</p>
          <p className="text-gray-600">Accept an invite first to edit your profile.</p>
          <Button className="mt-4 bg-purple-600 hover:bg-purple-700" asChild>
            <Link href="/school/dashboard/overview">Back to overview</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-purple-700">
            <Sparkles className="h-4 w-4" />
            <span>School profile</span>
          </div>
          <h1 className="text-3xl font-semibold text-gray-900">Edit profile</h1>
          <p className="text-sm text-gray-600">
            Update your school details, SDGs, and CRC focus areas.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/school/dashboard/overview">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to overview
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>School profile</CardTitle>
          <CardDescription>Core identity details for your school</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">School name</label>
              <Input
                value={formState.name}
                onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="School name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Contact email</label>
              <Input
                value={formState.contactEmail}
                onChange={(e) => setFormState((prev) => ({ ...prev, contactEmail: e.target.value }))}
                placeholder="contact@school.edu"
                type="email"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Our mission</CardTitle>
          <CardDescription>Share what drives your school and your goals</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Mission</label>
            <Textarea
              rows={5}
              value={formState.mission}
              onChange={(e) => setFormState((prev) => ({ ...prev, mission: e.target.value }))}
              placeholder="Describe your school mission and what you aim to achieve..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Overview</label>
            <Textarea
              rows={5}
              value={formState.description}
              onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description for your partners"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contacts</CardTitle>
          <CardDescription>Main school point of contact</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Principal / lead</label>
            <Input
              value={formState.principalName}
              onChange={(e) => setFormState((prev) => ({ ...prev, principalName: e.target.value }))}
              placeholder="Lead contact name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">City</label>
            <Input
              value={formState.city}
              onChange={(e) => setFormState((prev) => ({ ...prev, city: e.target.value }))}
              placeholder="City"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Country</label>
            <Input
              value={formState.country}
              onChange={(e) => setFormState((prev) => ({ ...prev, country: e.target.value }))}
              placeholder="Country"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>UN SDG Focus</CardTitle>
          <CardDescription>Select the Sustainable Development Goals you support</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {Array.from({ length: 17 }, (_, i) => i + 1).map((sdgNumber) => {
              const sdgId = String(sdgNumber)
              const isSelected = formState.sdgFocus.includes(sdgId)
              const sdgData = SDG_DATA[sdgNumber as keyof typeof SDG_DATA]

              return (
                <div
                  key={sdgId}
                  className="flex cursor-pointer flex-col items-center group"
                  onClick={() => handleSDGToggle(sdgId)}
                >
                  <div className={cn(
                    'relative transition-all',
                    isSelected
                      ? 'ring-4 ring-purple-500 ring-offset-2 rounded-lg shadow-lg scale-105'
                      : 'opacity-70 hover:opacity-100 hover:scale-105',
                  )}>
                    <SDGIcon
                      number={sdgNumber}
                      size="md"
                      showTitle={false}
                      className="w-16 h-16 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
                    />
                  </div>
                  <p className="mt-1 text-center text-xs leading-tight text-gray-600">
                    {sdgData?.title || `SDG ${sdgNumber}`}
                  </p>
                </div>
              )
            })}
          </div>
          {formState.sdgFocus.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700">
                Selected SDGs ({formState.sdgFocus.length}):
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {formState.sdgFocus.map((sdgId) => (
                  <Badge key={sdgId} variant="secondary" className="text-xs">
                    SDG {sdgId}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CRC Child Rights Focus (Optional)</CardTitle>
          <CardDescription>Select the UN Convention on the Rights of the Child articles you support</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeCRCCategory} onValueChange={setActiveCRCCategory}>
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-4">
              {CRC_CATEGORIES.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="text-xs">
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {CRC_CATEGORIES.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-4">
                <p className="mb-4 text-sm text-gray-600">{category.description}</p>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                  {category.articles.map((articleId) => {
                    const crc = crcOptions.find((c) => c.id === articleId)
                    const isSelected = formState.childRightsFocus.includes(articleId)
                    const iconPath = `/crc/icons/article-${articleId.padStart(2, '0')}.png`

                    return (
                      <div
                        key={articleId}
                        className="flex cursor-pointer flex-col items-center group"
                        onClick={() => handleCRCToggle(articleId)}
                        title={crc?.title}
                      >
                        <div className={cn(
                          'relative w-16 h-16 transition-all',
                          isSelected
                            ? 'ring-4 ring-purple-500 ring-offset-2 rounded-lg shadow-lg scale-105'
                            : 'opacity-70 hover:opacity-100 hover:scale-105',
                        )}>
                          <Image
                            src={iconPath}
                            alt={`CRC Article ${articleId}: ${crc?.title || ''}`}
                            width={64}
                            height={64}
                            className="object-contain rounded-lg"
                          />
                        </div>
                        <p className="mt-1 text-center text-xs leading-tight text-gray-600">
                          Art. {articleId}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {formState.childRightsFocus.length > 0 && (
            <div className="mt-6 space-y-2 border-t pt-4">
              <p className="text-sm font-medium text-gray-700">
                Selected CRC Articles ({formState.childRightsFocus.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {formState.childRightsFocus.map((crcId) => {
                  const crc = crcOptions.find((c) => c.id === crcId)
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          {saveMessage ? (
            <span className="text-green-700">{saveMessage}</span>
          ) : (
            'Changes save to your school workspace only.'
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/school/dashboard/overview">Cancel</Link>
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
