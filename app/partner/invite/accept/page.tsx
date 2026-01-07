'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'
import { ArrowLeft, CheckCircle2, Lock, Mail, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { createSession } from '@/lib/auth/session'
import { Badge } from '@/components/ui/badge'

const inviteSchema = z.object({
  name: z.string().min(2, 'Please provide your name'),
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type InviteForm = z.infer<typeof inviteSchema>

export default function AcceptPartnerInvitePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { database, createRecord } = usePrototypeDb()
  const [step, setStep] = useState<'details' | 'password'>('details')
  const [formState, setFormState] = useState<InviteForm>(() => {
    const rawName = searchParams.get('name') ?? 'Amelia Parker'
    const rawEmail = searchParams.get('email') ?? 'amelia.parker@unicef.org.uk'
    return {
      name: rawName,
      email: rawEmail,
      password: '',
    }
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inviteMeta = useMemo(() => {
    const partnerId = searchParams.get('partnerId') ?? 'partner-unicef'
    const partnerName = 'UNICEF Denmark'

    return {
      partnerId,
      partnerName,
      roleLabel: 'Country Coordinator',
    }
  }, [searchParams])

  const handleDetailsSubmit = () => {
    const parsed = inviteSchema.pick({ name: true, email: true }).safeParse(formState)
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
      const [firstName, ...rest] = formState.name.trim().split(' ')
      const lastName = rest.join(' ') || 'Coordinator'

      // Avoid duplicate partner user entries for the same email
      const existingUser =
        database?.partnerUsers.find((user) => user.email.toLowerCase() === formState.email.toLowerCase()) ??
        null

      if (!existingUser) {
        createRecord('partnerUsers', {
          partnerId: inviteMeta.partnerId,
          email: formState.email,
          firstName,
          lastName,
          role: 'coordinator',
          hasAcceptedTerms: true,
          twoFactorEnabled: false,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          isActive: true,
        })
      }

      // Sign the user in as a partner coordinator
      createSession({
        email: formState.email,
        role: 'partner',
        organization: inviteMeta.partnerName,
        name: formState.name,
      })

      router.push('/partner/profile/overview')
    } catch (err) {
      console.error(err)
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-10">
        <header className="flex items-center justify-between">
          <Link href="/partner/login" className="inline-flex items-center text-sm text-purple-700 hover:text-purple-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>
          <Badge variant="outline" className="border-purple-200 bg-white text-xs text-purple-700">
            Invite preview
          </Badge>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">
              Join {inviteMeta.partnerName} as {inviteMeta.roleLabel}
            </CardTitle>
            <CardDescription>
              You'll have full access to manage programs, invite schools, and collaborate with your team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 'details' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="name"
                      value={formState.name}
                      onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                      className="pl-9"
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Work email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="email"
                      value={formState.email}
                      disabled
                      className="pl-9 bg-gray-50 text-gray-700"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Email is locked to your invitation.</p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">Step 1 of 2</div>
                  <Button onClick={handleDetailsSubmit} className="bg-purple-600 hover:bg-purple-700">
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 'password' && (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-50 p-4 text-sm text-green-900">
                  <div className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Invitation accepted
                  </div>
                  <p className="mt-1 text-green-800">Create a password to finish setting up your coordinator access.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Create password</Label>
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
                    Edit details
                  </Button>
                  <Button
                    onClick={handleAccept}
                    disabled={submitting}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {submitting ? 'Finishing…' : 'Set password & continue'}
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
