'use client'

import { Suspense, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import { z } from 'zod'
import { ArrowLeft, CheckCircle2, Lock, Mail, School, User as UserIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { createSession } from '@/lib/auth/session'

const inviteSchema = z.object({
  schoolName: z.string().min(2, 'Please provide your school name'),
  contactName: z.string().min(2, 'Please provide a contact name'),
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type SchoolInviteForm = z.infer<typeof inviteSchema>

function AcceptSchoolInviteForm() {
  const t = useTranslations('schoolInvite')
  const tc = useTranslations('common')
  const searchParams = useSearchParams()
  const router = useRouter()
  const { database, createRecord } = usePrototypeDb()
  const [step, setStep] = useState<'details' | 'password'>('details')
  const [formState, setFormState] = useState<SchoolInviteForm>(() => ({
    schoolName: searchParams.get('schoolName') ?? 'Langelinie Rettighedsskole',
    contactName: searchParams.get('contactName') ?? 'Emma Hansen',
    email: searchParams.get('email') ?? 'emma@langelinie.dk',
    password: '',
  }))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inviteMeta = useMemo(() => {
    const partnerId = searchParams.get('partnerId') ?? 'partner-unicef'
    const programId = searchParams.get('programId') ?? 'program-communities-2025'
    const country = searchParams.get('country') ?? 'DK'
    const city = searchParams.get('city') ?? 'Copenhagen'

    const partnerName =
      database?.partners.find((partner) => partner.id === partnerId)?.organizationName ??
      'UNICEF Denmark'

    const programName =
      database?.programs.find((program) => program.id === programId)?.displayTitle ??
      database?.programs.find((program) => program.id === programId)?.name ??
      'Communities in Focus'

    const coordinatorId = database?.coordinators.find((coord) => coord.programId === programId)?.id

    return { partnerId, partnerName, programId, programName, country, city, coordinatorId }
  }, [searchParams, database])

  const handleDetailsSubmit = () => {
    const parsed = inviteSchema.pick({ schoolName: true, contactName: true, email: true }).safeParse(formState)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Please fill out the required fields.')
      return
    }
    setError(null)
    setStep('password')
  }

  const handleAccept = async () => {
    const parsed = inviteSchema.safeParse(formState)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Please fill out the required fields.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const existingInstitution = database?.institutions.find(
        (institution) =>
          institution.programId === inviteMeta.programId &&
          institution.contactEmail.toLowerCase() === formState.email.toLowerCase(),
      )

      const now = new Date().toISOString()

      const institutionRecord = existingInstitution
        ? existingInstitution
        : createRecord('institutions', {
            programId: inviteMeta.programId,
            coordinatorId:
              inviteMeta.coordinatorId ??
              database?.coordinators.find((coord) => coord.programId === inviteMeta.programId)?.id ??
              'coordinator-onboarding',
          name: formState.schoolName,
          type: 'public_school',
          country: inviteMeta.country,
          city: inviteMeta.city,
          address: '',
          contactEmail: formState.email,
          principalName: formState.contactName,
          principalEmail: formState.email,
            studentCount: 0,
            teacherCount: 0,
            educationLevels: ['secondary'],
            languages: ['en'],
            status: 'active',
            invitedAt: now,
            joinedAt: now,
            createdAt: now,
            updatedAt: now,
          })

      if (typeof window !== 'undefined') {
        localStorage.setItem('activeInstitutionId', institutionRecord.id)
        localStorage.setItem('activeProgramIds', JSON.stringify([inviteMeta.programId]))
        localStorage.setItem('isNewlyInvitedSchool', 'true')
      }

      createSession({
        email: formState.email,
        role: 'teacher',
        organization: formState.schoolName,
        name: formState.contactName,
      })

      router.push('/school/dashboard/home')
    } catch (err) {
      console.error(err)
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-10">
        <header className="flex items-center justify-between">
          <Link href="/partner/login" className="inline-flex items-center text-sm text-purple-700 hover:text-purple-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToLogin')}
          </Link>
          <Badge variant="outline" className="border-purple-200 bg-white text-xs text-purple-700">
            {t('invitePreview')}
          </Badge>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">
              {t('setUp', { schoolName: formState.schoolName })}
            </CardTitle>
            <CardDescription>
              {t('acceptDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 'details' && (
              <div className="space-y-4">
                <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
                  <div className="font-semibold">{t('invitedTo')}</div>
                  <ul className="mt-1 space-y-1 text-blue-800">
                    <li>• {t('partnerLabel')} {inviteMeta.partnerName}</li>
                    <li>• {t('programLabel')} {inviteMeta.programName}</li>
                    <li>• {t('cityCountry', { city: inviteMeta.city, country: inviteMeta.country })}</li>
                  </ul>
                  <p className="mt-2 text-xs text-blue-700">
                    {t('blankStart')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schoolName">{t('schoolName')}</Label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="schoolName"
                      value={formState.schoolName}
                      onChange={(e) => setFormState((prev) => ({ ...prev, schoolName: e.target.value }))}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactName">{t('leadContact')}</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="contactName"
                      value={formState.contactName}
                      onChange={(e) => setFormState((prev) => ({ ...prev, contactName: e.target.value }))}
                      className="pl-9"
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('workEmail')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="email"
                      value={formState.email}
                      disabled
                      className="pl-9 bg-gray-50 text-gray-700"
                    />
                  </div>
                  <p className="text-xs text-gray-500">{t('emailLocked')}</p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">{t('step1of2')}</div>
                  <Button onClick={handleDetailsSubmit} className="bg-purple-600 hover:bg-purple-700">
                    {tc('continue')}
                  </Button>
                </div>
              </div>
            )}

            {step === 'password' && (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-50 p-4 text-sm text-green-900">
                  <div className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    {t('invitationAccepted')}
                  </div>
                  <p className="mt-1 text-green-800">
                    {t('createPasswordDesc')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t('createPassword')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      value={formState.password}
                      onChange={(e) => setFormState((prev) => ({ ...prev, password: e.target.value }))}
                      className="pl-9"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center justify-between">
                  <Button variant="ghost" onClick={() => setStep('details')} className="text-gray-600">
                    {t('editDetails')}
                  </Button>
                  <Button
                    onClick={handleAccept}
                    disabled={submitting}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {submitting ? t('finishing') : t('setPasswordContinue')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-10">
        <Skeleton className="h-6 w-32" />
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AcceptSchoolInvitePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AcceptSchoolInviteForm />
    </Suspense>
  )
}
