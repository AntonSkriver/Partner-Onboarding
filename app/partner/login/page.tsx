'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Eye, EyeOff, Building, ArrowRight, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSession, clearSession } from '@/lib/auth/session'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginData = z.infer<typeof loginSchema>

export default function PartnerLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
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
    } catch (_err) {
      setError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="world-map-bg"></div>
      </div>
      
      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-center justify-start p-4 max-w-6xl mx-auto">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-purple-700 rounded-full flex items-center justify-center border border-white border-opacity-30">
              <span className="text-white text-sm font-bold">C2C</span>
            </div>
            <span className="font-semibold text-white text-lg">Class2Class</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Partner Login</CardTitle>
            <CardDescription className="text-gray-600">
              Access your organization&apos;s dashboard and manage your partnerships
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="partner@youorganization.org"
                          type="email"
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Enter your password"
                            type={showPassword ? "text" : "password"}
                            className="h-12 pr-12"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
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
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in to Dashboard
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="text-center text-sm text-gray-600">
              <Link href="#" className="text-purple-600 hover:text-purple-700 hover:underline">
                Forgot your password?
              </Link>
            </div>

            <Separator />

            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Don&apos;t have a partner account?
              </p>
              <Link href="/partner/onboarding">
                <Button variant="outline" className="w-full border-purple-200 text-purple-600 hover:bg-purple-50">
                  Start Your Partnership
                </Button>
              </Link>
            </div>

            <div className="text-center">
              <Separator className="mb-3" />
              <p className="text-xs text-gray-500 mb-3">
                Looking for teacher or student login?
              </p>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                  Go to Main Login
                </Button>
              </Link>
            </div>

            {/* Demo Credentials */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-900 mb-2">Demo Credentials:</p>
              <div className="text-xs text-blue-800 space-y-1">
                <div><strong>UNICEF Partner:</strong> unicef.partner@demo.org</div>
                <div><strong>NGO Partner:</strong> ngo.partner@demo.org</div>
                <div><strong>Password:</strong> demo123</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center text-white/80 pb-4">
        <p className="text-sm">
          © 2025 Class2Class - Connecting Classrooms for a Better World
        </p>
      </div>
    </div>
  )
}