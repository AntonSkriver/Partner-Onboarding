'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import Image from 'next/image'
import { Eye, EyeOff, Lock, Mail, GraduationCap, Users, Building2, School } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LanguageSwitcher } from '@/components/language-switcher'

type SignupRole = 'teacher' | 'student' | 'organization' | 'school'

const ROLE_OPTIONS: { value: SignupRole; labelKey: string; descKey: string; icon: typeof GraduationCap }[] = [
  { value: 'teacher', labelKey: 'teacher', descKey: 'signUpRoleTeacherDesc', icon: GraduationCap },
  { value: 'student', labelKey: 'student', descKey: 'signUpRoleStudentDesc', icon: Users },
  { value: 'organization', labelKey: 'signUpRoleOrg', descKey: 'signUpRoleOrgDesc', icon: Building2 },
  { value: 'school', labelKey: 'school', descKey: 'signUpRoleSchoolDesc', icon: School },
]

export default function SignUpPage() {
  const t = useTranslations('auth')
  const tc = useTranslations('common')
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<SignupRole | null>(null)
  const [step, setStep] = useState<'role' | 'form'>('role')
  const [showPassword, setShowPassword] = useState(false)

  const handleRoleSelect = (role: SignupRole) => {
    setSelectedRole(role)
  }

  const handleContinue = () => {
    if (!selectedRole) return

    // Organization and School roles route to their specific onboarding flows
    if (selectedRole === 'organization') {
      router.push('/partner/onboarding')
      return
    }
    if (selectedRole === 'school') {
      router.push('/school/onboarding')
      return
    }

    // Teacher and Student continue to the inline form
    setStep('form')
  }

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* Left column: form */}
      <div className="flex flex-col px-6 py-10 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-purple-700 hover:text-purple-900">
            <Image
              src="/isotipo.png"
              alt="Class2Class Logo"
              width={40}
              height={40}
              className="h-10 w-10"
              priority
            />
            <span className="text-lg font-semibold">Class2Class</span>
          </Link>
          <LanguageSwitcher />
        </header>

        <main className="mx-auto flex w-full max-w-md flex-1 items-center">
          <div className="w-full space-y-6">
            {step === 'role' ? (
              <>
                <div>
                  <h1 className="text-3xl font-semibold text-gray-900">
                    {t('signUpTitle')}
                  </h1>
                  <p className="mt-2 text-sm text-gray-600">{t('signUpRolePrompt')}</p>
                </div>

                <div className="space-y-3">
                  {ROLE_OPTIONS.map((option) => {
                    const Icon = option.icon
                    const isSelected = selectedRole === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleRoleSelect(option.value)}
                        className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            isSelected ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className={`font-medium ${isSelected ? 'text-purple-900' : 'text-gray-900'}`}>
                              {t(option.labelKey)}
                            </p>
                            <p className="text-xs text-gray-500">{t(option.descKey)}</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <Button
                  onClick={handleContinue}
                  disabled={!selectedRole}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                >
                  {tc('continue')}
                </Button>

                <p className="text-center text-sm text-gray-600">
                  {t('alreadyHaveAccount')}{' '}
                  <Link href="/login" className="font-semibold text-purple-700 hover:text-purple-800">
                    {t('logIn')}
                  </Link>
                </p>
              </>
            ) : (
              <>
                <div>
                  <button
                    type="button"
                    onClick={() => setStep('role')}
                    className="mb-2 text-sm text-purple-600 hover:text-purple-700"
                  >
                    &larr; {tc('back')}
                  </button>
                  <h1 className="text-3xl font-semibold text-gray-900">
                    {t('signUpTitle')}
                  </h1>
                  <p className="mt-2 text-sm text-gray-600">{t('signUpSubtitle')}</p>
                </div>

                <form className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">
                      {t('email')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder={t('enterEmail')}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">
                      {t('password')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('enterPassword')}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-2.5 text-gray-500"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="text-xs text-purple-700">{t('passwordStrength')}</div>
                    <div className="h-1 rounded-full bg-purple-100">
                      <div className="h-1 w-1/2 rounded-full bg-purple-500" />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                    {t('signUpBtn')}
                  </Button>

                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="h-px flex-1 bg-gray-200" />
                    {tc('or')}
                    <span className="h-px flex-1 bg-gray-200" />
                  </div>

                  <Button variant="outline" className="w-full border-gray-300">
                    {t('signUpWithGoogle')}
                  </Button>

                  <p className="text-center text-sm text-gray-600">
                    {t('alreadyHaveAccount')}{' '}
                    <Link href="/login" className="font-semibold text-purple-700 hover:text-purple-800">
                      {t('logIn')}
                    </Link>
                  </p>
                </form>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Right column: testimonial */}
      <div className="relative hidden overflow-hidden bg-[#E0CCFF] lg:block">
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
        <div className="relative z-10 flex h-full items-center justify-center p-12">
          <div className="max-w-xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center gap-4 px-6 py-5">
              <div className="h-14 w-14 overflow-hidden rounded-full bg-gray-200">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"
                  alt="Teacher portrait"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Kellie Mason</p>
                <p className="text-xs text-gray-600">Teacher · United States</p>
              </div>
            </div>
            <div className="border-t border-gray-100 px-6 py-5 text-sm leading-relaxed text-gray-700">
              &quot;Thank you to the Class2Class.org team for creating such an unforgettable and
              life-changing experience for me and my students! I value the connections we&apos;ve
              made through this platform and look forward to growing with C2C in the future!&quot;
            </div>
            <div className="flex items-center justify-center gap-2 pb-5">
              <span className="h-2 w-2 rounded-full bg-purple-200" />
              <span className="h-2 w-2 rounded-full bg-purple-600" />
              <span className="h-2 w-2 rounded-full bg-purple-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
