'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { createSession, clearSession } from '@/lib/auth/session'
import { resetPrototypeDb } from '@/lib/storage/prototype-db'
import { seedPrototypeDb } from '@/lib/storage/seeds'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginData = z.infer<typeof loginSchema>

export default function PartnerLoginPage() {
  const t = useTranslations('auth')
  const tc = useTranslations('common')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoLoading, setIsDemoLoading] = useState<
    | 'stc-world'
    | 'unicef-world'
    | 'unicef-denmark'
    | 'stc-italy'
    | 'stc-mexico'
    | 'partner'
    | 'school'
    | null
  >(null)
  const [isResetting, setIsResetting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const partnerQuickOptions = [
    {
      id: 'stc-world' as const,
      label: 'StC World',
      description: 'See all Save the Children country programs and performance.',
      role: 'parent',
      organization: 'Save the Children World',
      name: 'StC Global Director',
      redirect: '/parent/profile/overview',
    },
    {
      id: 'unicef-world' as const,
      label: 'UNICEF World',
      description: 'See UNICEF country program performance and collaboration.',
      role: 'parent',
      organization: 'UNICEF World Organization',
      name: 'UNICEF Global Director',
      redirect: '/parent/profile/overview',
    },
    {
      id: 'unicef-denmark' as const,
      label: 'UNICEF Denmark',
      description: 'Manage UNICEF Denmark programs and partner schools.',
      role: 'partner',
      organization: 'UNICEF Denmark',
      name: 'UNICEF Denmark Coordinator',
      redirect: '/partner/profile/overview',
    },
    {
      id: 'stc-italy' as const,
      label: 'Save the Children Italy',
      description: 'Manage Italian Punti Luce and programs.',
      role: 'partner',
      organization: 'Save the Children Italy',
      name: 'STC Italy Director',
      redirect: '/partner/profile/overview',
    },
    {
      id: 'stc-mexico' as const,
      label: 'Save the Children Mexico',
      description: 'Manage Mexico programs and school partnerships.',
      role: 'partner',
      organization: 'Save the Children Mexico',
      name: 'STC Mexico Director',
      redirect: '/partner/profile/overview',
    },
  ]

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const handleSubmit = async (data: LoginData) => {
    setIsLoading(true)
    setError(null)
    
    // Clear any existing session first
    clearSession()
    
    try {
      // Simulate authentication API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // For demo: simulate successful login for partner accounts
      if (
        data.email.includes('partner') ||
        data.email.includes('unicef') ||
        data.email.includes('ngo') ||
        data.email.includes('savethechildren') ||
        data.email.includes('stc')
      ) {
        // Get organization name based on email
        let organizationName = 'Partner Organization'
        let userName = 'Partner Coordinator'
        const normalizedEmail = data.email.toLowerCase()

        if (normalizedEmail.includes('unicef')) {
          if (normalizedEmail.includes('.uk') || normalizedEmail.includes('england')) {
            organizationName = 'UNICEF England'
            userName = 'UNICEF England Coordinator'
          } else if (normalizedEmail.includes('world') || normalizedEmail.includes('global')) {
            organizationName = 'UNICEF World Organization'
            userName = 'UNICEF Global Coordinator'
          } else {
            organizationName = 'UNICEF Denmark'
            userName = 'UNICEF Denmark Coordinator'
          }
        } else if (normalizedEmail.includes('mx') || normalizedEmail.includes('mexico')) {
          organizationName = 'Save the Children Mexico'
          userName = 'STC Mexico Coordinator'
        } else if (normalizedEmail.includes('world') || normalizedEmail.includes('global')) {
          organizationName = 'Save the Children World'
          userName = 'STC Global Coordinator'
        } else if (normalizedEmail.includes('savethechildren') || normalizedEmail.includes('stc')) {
          organizationName = 'Save the Children Italy'
          userName = 'STC Coordinator'
        } else if (normalizedEmail.includes('ngo')) {
          organizationName = 'NGO Partner'
          userName = 'NGO Coordinator'
        }
        
        // Create proper session
        createSession({
          email: data.email,
          role: 'partner',
          organization: organizationName,
          name: userName
        })
        
        // Redirect to partner dashboard
        router.push('/partner/dashboard')
      } else {
        setError(t('accountNotFound'))
      }
    } catch {
      setError(t('loginFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (mode: 'partner' | 'school') => {
    setIsDemoLoading(mode)
    setError(null)
    clearSession()

    if (mode === 'partner') {
      createSession({
        email: 'demo.partner@class2class.org',
        role: 'partner',
        organization: 'Save the Children Italy',
        name: 'STC Coordinator',
      })
      router.push('/partner/profile')
    } else {
      createSession({
        email: 'demo.school@class2class.org',
        role: 'teacher',
        organization: 'Ørestad Gymnasium',
        name: 'School Coordinator',
      })
      router.push('/school/dashboard')
    }

    setIsDemoLoading(null)
  }

  const handlePartnerSelection = async (
    option: (typeof partnerQuickOptions)[number],
  ) => {
    setIsDemoLoading(option.id)
    setError(null)
    clearSession()

    createSession({
      email: `demo+${option.id}@class2class.org`,
      role: option.role,
      organization: option.organization,
      name: option.name,
    })

    router.push(option.redirect)
    setIsDemoLoading(null)
  }

  const handleResetPrototype = () => {
    setIsResetting(true)
    try {
      resetPrototypeDb()
      seedPrototypeDb({ force: true })
      window.location.reload()
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-10 lg:px-16">
        <header className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 text-purple-700 hover:text-purple-900 transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-200 bg-purple-100 text-sm font-semibold">
              C2C
            </div>
            <span className="text-lg font-semibold">Class2Class</span>
          </Link>
        </header>

        <main className="flex flex-1 items-center">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-semibold text-gray-900">{t('partnerLogin')}</h1>
            <p className="mt-2 text-sm text-gray-600">
              {t('partnerLoginSubtitle')}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-12 border border-purple-200 bg-white text-purple-700 hover:bg-purple-50"
                    disabled={Boolean(isDemoLoading)}
                  >
                    {isDemoLoading ? tc('loading') : t('continueAsPartner')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {t('signInAs')}
                    </div>
                    <div className="space-y-2">
                      {partnerQuickOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handlePartnerSelection(option)}
                          disabled={isDemoLoading === option.id}
                          className="w-full rounded-lg border border-gray-200 p-3 text-left transition hover:border-purple-300 hover:bg-purple-50 disabled:opacity-60"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                              <p className="text-xs text-gray-600">{option.description}</p>
                            </div>
                            <span className="text-[11px] font-medium text-purple-700">
                              {option.role === 'parent' ? t('roleParent') : t('roleCountry')}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              className="h-12 border-gray-200 text-gray-700 hover:text-purple-700"
              onClick={() => handleDemoLogin('school')}
              disabled={Boolean(isDemoLoading)}
            >
              {isDemoLoading === 'school' ? tc('loading') : t('continueAsSchool')}
            </Button>
            <Link
              href="/school/invite/accept?schoolName=Punto%20Luce%20Roma&contactName=Chiara%20Rossi&email=chiara@puntoluce.it&partnerId=partner-save-the-children-italy&programId=program-diritti-in-gioco-2025&country=IT&city=Rome"
              className="flex h-12 items-center justify-center rounded-md border border-purple-200 bg-purple-50 px-4 text-sm font-semibold text-purple-800 transition hover:bg-purple-100"
            >
              {t('previewSchoolInvite')}
            </Link>
          </div>

            <div className="mt-8 space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('emailAddress')}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            autoComplete="email"
                            placeholder={t('emailPlaceholder')}
                            className="h-12"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>{t('password')}</FormLabel>
                          <Link href="#" className="text-xs text-purple-600 hover:text-purple-700">
                            {t('forgotPassword')}
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              autoComplete="current-password"
                              placeholder={t('passwordPlaceholder')}
                              className="h-12 pr-12"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        {t('signingIn')}
                      </>
                    ) : (
                      t('signIn')
                    )}
                  </Button>
                </form>
              </Form>

              <div className="grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
                <Button asChild variant="ghost" className="justify-start px-0 text-purple-600 hover:text-purple-700">
                  <Link href="/partner/onboarding">{t('signUpAsPartner')}</Link>
                </Button>
                <Button asChild variant="ghost" className="justify-start px-0 text-gray-700 hover:text-purple-700">
                  <Link href="/school/onboarding">{t('signUpAsSchool')}</Link>
                </Button>
              </div>

              <div className="text-xs text-gray-400">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="px-0 text-gray-500 hover:text-purple-600"
                  onClick={handleResetPrototype}
                  disabled={isResetting || Boolean(isDemoLoading) || isLoading}
                >
                  {isResetting ? t('resettingData') : t('resetPrototypeData')}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#8f5afc] via-[#6d4ce6] to-[#2f2ba5] lg:flex">
        <div className="absolute inset-0 opacity-30">
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_45%)]" />
        </div>
        <div className="absolute inset-0 opacity-15">
          <div className="h-full w-full bg-[radial-gradient(circle_at_bottom,_rgba(255,255,255,0.25),_transparent_50%)]" />
        </div>
        <div className="relative z-10 flex w-full flex-col justify-between p-12 text-white">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.35em] text-white/70">{t('globalPartnerNetwork')}</p>
            <h2 className="text-3xl font-semibold leading-snug">
              {t('buildCollaborations')}
            </h2>
          </div>

          <div className="mt-auto">
            <div className="rounded-2xl bg-white/15 p-6 backdrop-blur-sm">
              <p className="text-sm leading-relaxed text-white/90">
                “Class2Class helps our UK schools see progress and stay in sync with partners abroad. It keeps coordinators and teachers aligned without extra overhead.”
              </p>
              <div className="mt-4">
                <p className="text-sm font-semibold text-white">Amelia Parker</p>
                <p className="text-xs uppercase tracking-wide text-white/70">Program Director · Save the Children Mexico</p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-white/40">
                <span className="h-2 w-2 rounded-full bg-white" />
                <span className="h-2 w-2 rounded-full bg-white/40" />
                <span className="h-2 w-2 rounded-full bg-white/40" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
