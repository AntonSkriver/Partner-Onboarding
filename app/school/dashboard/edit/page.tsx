'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { SDGIcon } from '@/components/sdg-icons'
import { SDG_OPTIONS } from '@/contexts/partner-onboarding-context'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { getCurrentSession } from '@/lib/auth/session'
import { cn } from '@/lib/utils'
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles, Save } from 'lucide-react'
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

const CRC_OPTIONS = [
  { id: '12', title: 'Respect for child views' },
  { id: '13', title: 'Freedom of expression' },
  { id: '24', title: 'Health & services' },
  { id: '28', title: 'Right to education' },
  { id: '29', title: 'Goals of education' },
  { id: '31', title: 'Leisure, play & culture' },
]

export default function SchoolProfileEditPage() {
  const router = useRouter()
  const { ready: prototypeReady, database, updateRecord } = usePrototypeDb()
  const [session, setSession] = useState(getCurrentSession())
  const [institution, setInstitution] = useState<InstitutionWithProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
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

  const sdgOptions = useMemo(
    () => SDG_OPTIONS.map((sdg) => ({ id: String(sdg.id), title: sdg.title })),
    [],
  )

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
          <CardTitle>Basics</CardTitle>
          <CardDescription>School identity and contact details</CardDescription>
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
          <div className="grid gap-4 md:grid-cols-3">
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
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Mission</label>
              <Textarea
                rows={4}
                value={formState.mission}
                onChange={(e) => setFormState((prev) => ({ ...prev, mission: e.target.value }))}
                placeholder="What your school aims to achieve"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Overview</label>
              <Textarea
                rows={4}
                value={formState.description}
                onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description for your partners"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            UN SDGs
          </CardTitle>
          <CardDescription>Select the goals your school advances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {sdgOptions.map((sdg) => {
              const isActive = formState.sdgFocus.includes(sdg.id)
              const numericId = Number.parseInt(sdg.id, 10)
              return (
                <button
                  key={sdg.id}
                  type="button"
                  onClick={() => toggleSelection('sdgFocus', sdg.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-3 text-left transition',
                    isActive ? 'border-purple-300 bg-purple-50 shadow-sm' : 'border-gray-200 bg-white hover:border-purple-200',
                  )}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white shadow-inner">
                    <SDGIcon number={numericId} size="md" showTitle={false} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">SDG {sdg.id}</p>
                    <p className="text-xs text-gray-600 line-clamp-2">{sdg.title}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            CRC focus
          </CardTitle>
          <CardDescription>Articles from the UN Convention on the Rights of the Child</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {CRC_OPTIONS.map((crc) => {
              const isActive = formState.childRightsFocus.includes(crc.id)
              return (
                <Button
                  key={crc.id}
                  type="button"
                  variant={isActive ? 'default' : 'outline'}
                  className={cn(
                    'border rounded-full px-3 py-1 text-sm',
                    isActive ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-gray-200 text-gray-700',
                  )}
                  onClick={() => toggleSelection('childRightsFocus', crc.id)}
                >
                  Article {crc.id}: {crc.title}
                </Button>
              )
            })}
          </div>
          {formState.childRightsFocus.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formState.childRightsFocus.map((article) => {
                const crc = CRC_OPTIONS.find((c) => c.id === article)
                return (
                  <Badge key={article} variant="secondary" className="bg-blue-50 text-blue-800 border-blue-200">
                    Article {article}{crc ? ` – ${crc.title}` : ''}
                  </Badge>
                )
              })}
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
