'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createSession, clearSession, startTeacherPreviewSession } from '@/lib/auth/session'
import { resetPrototypeDb } from '@/lib/storage/prototype-db'
import { seedPrototypeDb } from '@/lib/storage/seeds'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginData = z.infer<typeof loginSchema>

export default function PartnerLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoLoading, setIsDemoLoading] = useState<'partner' | 'school' | 'teacher' | null>(null)
  const [isResetting, setIsResetting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

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
      if (data.email.includes('partner') || data.email.includes('unicef') || data.email.includes('ngo')) {
        // Get organization name based on email
        let organizationName = 'Partner Organization'
        let userName = 'Partner User'
        
        if (data.email.includes('unicef')) {
          organizationName = 'UNICEF Denmark'
          userName = 'UNICEF Coordinator'
        } else if (data.email.includes('ngo')) {
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
        setError('Partner account not found. Please check your credentials or sign up for a new partner account.')
      }
    } catch {
      setError('Login failed. Please try again.')
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
        organization: 'UNICEF Denmark',
        name: 'UNICEF Coordinator',
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

  const handleTeacherPreview = () => {
    setIsDemoLoading('teacher')
    clearSession()
    startTeacherPreviewSession()
    router.push('/teacher/dashboard')
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
            <h1 className="text-3xl font-semibold text-gray-900">Partner login</h1>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to manage programs, invitations, and school partnerships across your network.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Button
                variant="outline"
                className="h-12 border border-purple-200 bg-white text-purple-700 hover:bg-purple-50"
                onClick={() => handleDemoLogin('partner')}
                disabled={Boolean(isDemoLoading)}
              >
                {isDemoLoading === 'partner' ? 'Loading...' : 'Continue as Partner'}
              </Button>
              <Button
                variant="outline"
                className="h-12 border-gray-200 text-gray-700 hover:text-purple-700"
                onClick={() => handleDemoLogin('school')}
                disabled={Boolean(isDemoLoading)}
              >
                {isDemoLoading === 'school' ? 'Loading...' : 'Continue as School'}
              </Button>
              <Button
                variant="outline"
                className="h-12 border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100"
                onClick={handleTeacherPreview}
                disabled={isDemoLoading === 'teacher'}
              >
                {isDemoLoading === 'teacher' ? 'Loading...' : 'Continue as Teacher'}
              </Button>
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
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            autoComplete="email"
                            placeholder="you@organization.org"
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
                          <FormLabel>Password</FormLabel>
                          <Link href="#" className="text-xs text-purple-600 hover:text-purple-700">
                            Forgot password?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              autoComplete="current-password"
                              placeholder="Enter your password"
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
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </Button>
                </form>
              </Form>

              <div className="grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
                <Button asChild variant="ghost" className="justify-start px-0 text-purple-600 hover:text-purple-700">
                  <Link href="/partner/onboarding">Sign up as Partner</Link>
                </Button>
                <Button asChild variant="ghost" className="justify-start px-0 text-gray-700 hover:text-purple-700">
                  <Link href="/school/onboarding">Sign up as School</Link>
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
                  {isResetting ? 'Resetting data...' : 'Reset prototype data'}
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
            <p className="text-xs uppercase tracking-[0.35em] text-white/70">Global partner network</p>
            <h2 className="text-3xl font-semibold leading-snug">
              Build meaningful collaborations and bring cross-cultural learning to every classroom you support.
            </h2>
          </div>

          <div className="mt-auto">
            <div className="rounded-2xl bg-white/15 p-6 backdrop-blur-sm">
              <p className="text-sm leading-relaxed text-white/90">
                “Working with Class2Class has given our organisation a clear view of how schools progress together.
                The platform keeps every stakeholder aligned—from coordinators to teachers.”
              </p>
              <div className="mt-4">
                <p className="text-sm font-semibold text-white">Maria Jensen</p>
                <p className="text-xs uppercase tracking-wide text-white/70">Program Director · UNICEF Denmark</p>
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
