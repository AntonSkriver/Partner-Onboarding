'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { LanguageSwitcher } from '@/components/language-switcher'
import { createSession, clearSession } from '@/lib/auth/session'

// Hardcoded credentials for the prototype
const VALID_CREDENTIALS = [
  { username: 'Unicefworld', password: '123', type: 'partner' as const, redirect: '/partner/profile/dashboard', org: 'UNICEF World Organization', name: 'UNICEF Global Coordinator' },
  { username: 'UnicefDK', password: '123', type: 'partner' as const, redirect: '/partner/profile/dashboard', org: 'UNICEF Denmark', name: 'UNICEF Denmark Coordinator' },
  { username: 'schoolDK', password: '123', type: 'school' as const, redirect: '/school/dashboard', org: 'Copenhagen International School', name: 'School Admin' },
]

const testimonials = [
  {
    quote: "Your guidance, constant support and meaningful suggestions make all the difference. You are an inspiration and our students can become global citizens and have life experiences that will change their lives for the better.",
    author: "Gisel Crespo",
    role: "Teacher",
    location: "Argentina",
    photo: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&h=200&fit=crop",
  },
  {
    quote: "Class2Class has transformed how we connect schools globally. The platform makes cross-cultural collaboration seamless and impactful.",
    author: "Maria Jensen",
    role: "Program Director",
    location: "UNICEF Denmark",
    photo: null,
  },
  {
    quote: "Our students have gained invaluable perspectives through Class2Class partnerships. It's education without borders.",
    author: "Thomas Andersen",
    role: "School Coordinator",
    location: "Copenhagen International School",
    photo: null,
  },
]

export default function LoginPage() {
  const t = useTranslations('auth')
  const tc = useTranslations('common')
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    await new Promise(resolve => setTimeout(resolve, 500))

    // Try hardcoded username/password credentials first
    const credential = VALID_CREDENTIALS.find(
      cred => cred.username.toLowerCase() === identifier.toLowerCase() && cred.password === password
    )

    if (credential) {
      clearSession()
      createSession({
        email: identifier,
        role: credential.type,
        organization: credential.org,
        name: credential.name,
      })
      router.push(credential.redirect)
      return
    }

    // Try email-pattern matching for partner demo accounts
    const normalizedEmail = identifier.toLowerCase()
    if (
      normalizedEmail.includes('partner') ||
      normalizedEmail.includes('unicef') ||
      normalizedEmail.includes('ngo') ||
      normalizedEmail.includes('savethechildren') ||
      normalizedEmail.includes('stc')
    ) {
      let organizationName = 'Partner Organization'
      let userName = 'Partner Coordinator'

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
      } else if (normalizedEmail.includes('savethechildren') || normalizedEmail.includes('stc')) {
        organizationName = 'Save the Children Italy'
        userName = 'STC Coordinator'
      } else if (normalizedEmail.includes('ngo')) {
        organizationName = 'NGO Partner'
        userName = 'NGO Coordinator'
      }

      clearSession()
      createSession({
        email: identifier,
        role: 'partner',
        organization: organizationName,
        name: userName,
      })
      router.push('/partner/dashboard')
      return
    }

    setError(t('invalidCredentials'))
    setIsLoading(false)
  }

  const testimonial = testimonials[currentTestimonial]

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-[45%] bg-white flex flex-col justify-center px-8 md:px-16 lg:px-20 py-12">
        <div className="max-w-md w-full mx-auto">
          {/* Logo & Language */}
          <div className="flex items-center justify-between mb-12">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <Image
                src="/isotipo.png"
                alt="Class2Class"
                width={48}
                height={48}
                className="w-12 h-12 group-hover:scale-105 transition-transform"
              />
            </Link>
            <LanguageSwitcher />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-[#1a1a2e] mb-2">
            {t('loginPageTitle')}
          </h1>
          <p className="text-gray-500 mb-8">
            {t('loginPageSubtitle')}
          </p>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-[#1a1a2e] font-medium">
                {t('emailOrUsername')} <span className="text-[#8157D9]">*</span>
              </Label>
              <Input
                id="identifier"
                type="text"
                placeholder={t('enterEmailOrUsername')}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="h-12 border-gray-200 focus:border-[#8157D9] focus:ring-[#8157D9]/20 rounded-lg"
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-[#1a1a2e] font-medium">
                  {t('password')} <span className="text-[#8157D9]">*</span>
                </Label>
                <Link href="#" className="text-sm text-[#8157D9] hover:text-[#7048C6] font-medium">
                  {t('forgotPasswordQ')}
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('enterPassword')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-gray-200 focus:border-[#8157D9] focus:ring-[#8157D9]/20 rounded-lg pr-12"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#8157D9] hover:bg-[#7048C6] text-white font-semibold rounded-lg transition-all disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t('signingIn')}
                </>
              ) : (
                t('logIn')
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-sm">{tc('or')}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google Login */}
          <Button
            variant="outline"
            className="w-full h-12 border-gray-200 hover:border-[#8157D9] hover:bg-[#8157D9]/5 text-gray-700 font-medium rounded-lg transition-all"
          >
            {t('continueWithGoogle')}
          </Button>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-gray-600">
            {t('dontHaveAccountQ')}{' '}
            <Link href="/signup" className="text-[#8157D9] hover:text-[#7048C6] font-semibold">
              {t('signUp')}
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Branding with Map & Testimonial */}
      <div className="hidden lg:flex lg:w-[55%] bg-[#E0CCFF] relative overflow-hidden flex-col justify-center items-center p-12">
        {/* World Map Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[120%] h-[80%]">
            <Image
              src="/images/world-map.webp"
              alt=""
              fill
              className="object-contain opacity-40 brightness-125"
            />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-lg">
          {/* Headline */}
          <h2 className="text-4xl font-bold text-[#1a1a2e] mb-6 leading-tight">
            {t('connectingClassrooms')}
          </h2>
          <p className="text-lg text-gray-700 mb-12">
            {t('joinThousands')}
          </p>

          {/* Testimonial Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-[#8157D9]/10 overflow-hidden">
            <div className="p-8">
              <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                &quot;{testimonial.quote}&quot;
              </p>
            </div>
            <div className="border-t border-gray-100 px-8 py-5 flex items-center gap-4">
              {testimonial.photo ? (
                <div className="w-12 h-12 overflow-hidden rounded-full bg-gray-200 shrink-0">
                  <img
                    src={testimonial.photo}
                    alt={testimonial.author}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-[#8157D9] to-[#A78BFA] rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {testimonial.author.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-semibold text-[#1a1a2e]">
                  {testimonial.author}
                </p>
                <p className="text-sm text-gray-500">
                  {testimonial.role} · {testimonial.location}
                </p>
              </div>
            </div>
          </div>

          {/* Testimonial Dots */}
          <div className="flex gap-2 mt-6 justify-center">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentTestimonial
                    ? 'bg-[#8157D9] w-6'
                    : 'bg-[#8157D9]/30 hover:bg-[#8157D9]/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-[#8157D9]/10 rounded-full blur-3xl" />
      </div>
    </div>
  )
}
