'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import Image from 'next/image'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { clearSession, startTeacherPreviewSession, startCoordinatorPreviewSession } from '@/lib/auth/session'
import { LanguageSwitcher } from '@/components/language-switcher'

export default function SignInPage() {
  const t = useTranslations('auth')
  const tc = useTranslations('common')
  const router = useRouter()
  const [role, setRole] = useState<'teacher' | 'student' | 'coordinator'>('teacher')
  const [showPassword, setShowPassword] = useState(false)
  const [isTeacherPreviewLoading, setIsTeacherPreviewLoading] = useState(false)
  const [isCoordinatorPreviewLoading, setIsCoordinatorPreviewLoading] = useState(false)

  const handleTeacherPreview = () => {
    setIsTeacherPreviewLoading(true)
    clearSession()
    startTeacherPreviewSession()
    router.push('/teacher/dashboard')
  }

  const handleCoordinatorPreview = () => {
    setIsCoordinatorPreviewLoading(true)
    clearSession()
    startCoordinatorPreviewSession()
    router.push('/coordinator/dashboard')
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
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">{t('loginTitle')}</h1>
              <p className="mt-2 text-sm text-gray-600">
                {t('loginSubtitle')}
              </p>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-700">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="teacher"
                  checked={role === 'teacher'}
                  onChange={() => setRole('teacher')}
                  className="h-4 w-4 border-purple-400 text-purple-600 focus:ring-purple-500"
                />
                {t('teacher')}
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={role === 'student'}
                  onChange={() => setRole('student')}
                  className="h-4 w-4 border-purple-400 text-purple-600 focus:ring-purple-500"
                />
                {t('student')}
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="coordinator"
                  checked={role === 'coordinator'}
                  onChange={() => setRole('coordinator')}
                  className="h-4 w-4 border-purple-400 text-purple-600 focus:ring-purple-500"
                />
                {t('coordinator')}
              </label>
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
                <div className="flex justify-end">
                  <Link href="#" className="text-xs font-medium text-purple-700 hover:text-purple-800">
                    {t('forgotPassword')}
                  </Link>
                </div>
              </div>

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                {t('logIn')}
              </Button>

              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="h-px flex-1 bg-gray-200" />
                {tc('or')}
                <span className="h-px flex-1 bg-gray-200" />
              </div>

              <Button variant="outline" className="w-full border-gray-300">
                {t('continueWithGoogle')}
              </Button>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 text-sm"
                  onClick={handleTeacherPreview}
                  disabled={isTeacherPreviewLoading}
                >
                  {isTeacherPreviewLoading ? tc('loading') : t('continueAsTeacher')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 text-sm"
                  onClick={handleCoordinatorPreview}
                  disabled={isCoordinatorPreviewLoading}
                >
                  {isCoordinatorPreviewLoading ? tc('loading') : t('continueAsCoordinator')}
                </Button>
              </div>

              <p className="text-center text-sm text-gray-600">
                {t('dontHaveAccount')}{' '}
                <Link href="/signup" className="font-semibold text-purple-700 hover:text-purple-800">
                  {t('signUp')}
                </Link>
              </p>
              <p className="text-center text-base font-semibold text-purple-700">
                <Link href="/partner/login" className="hover:text-purple-800">
                  {t('signUpAsOrg')}
                </Link>
              </p>
            </form>
          </div>
        </main>
      </div>

      {/* Right column: testimonial */}
      <div className="relative hidden overflow-hidden bg-[#eadbff] lg:block">
        <div className="absolute inset-0 opacity-40">
          <div className="h-full w-full bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.6),_transparent_55%)]" />
        </div>
        <div className="relative z-10 flex h-full items-center justify-center p-12">
          <div className="max-w-xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center gap-4 px-6 py-5">
              <div className="h-14 w-14 overflow-hidden rounded-full bg-gray-200">
                <img
                  src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&h=200&fit=crop"
                  alt="Teacher portrait"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Gisel Crespo</p>
                <p className="text-xs text-gray-600">Teacher · Argentina</p>
              </div>
            </div>
            <div className="border-t border-gray-100 px-6 py-5 text-sm leading-relaxed text-gray-700">
              “Your guidance, constant support and meaningful suggestions make all the difference.
              You are an inspiration and our students can become global citizens and have life
              experiences that will change their lives for the better.”
            </div>
            <div className="flex items-center justify-center gap-2 pb-5">
              <span className="h-2 w-2 rounded-full bg-purple-600" />
              <span className="h-2 w-2 rounded-full bg-purple-200" />
              <span className="h-2 w-2 rounded-full bg-purple-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
