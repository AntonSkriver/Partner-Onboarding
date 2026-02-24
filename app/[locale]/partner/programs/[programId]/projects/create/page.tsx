'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import {
  ArrowLeft,
  Rocket,
  CheckCircle,
  Sparkles,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SDGIcon } from '@/components/sdg-icons'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { getCurrentSession } from '@/lib/auth/session'
import { resolvePartnerContext } from '@/lib/auth/partner-context'
import { findProgramSummaryById } from '@/lib/programs/selectors'

const collaborationThemes = [
  {
    value: 'cultural_exchange',
    title: 'Explore Cultures',
    description: 'Share identities, traditions, and lived experiences across borders.',
  },
  {
    value: 'explore_global_challenges',
    title: 'Explore Global',
    description: 'Investigate world challenges together through research and dialogue.',
  },
  {
    value: 'create_solutions',
    title: 'Explore Solutions',
    description: 'Design and test ideas to solve real problems collaboratively.',
  },
] as const

export default function CreateProgramProjectPage() {
  const router = useRouter()
  const params = useParams<{ programId: string }>()
  const t = useTranslations('projects')
  const tc = useTranslations('common')
  const programId = params?.programId ?? ''

  const [session] = useState(() => getCurrentSession())
  const { ready, database, createRecord } = usePrototypeDb()

  const partnerContext = useMemo(
    () => resolvePartnerContext(session, database),
    [session, database],
  )

  const summary = useMemo(() => {
    if (!database || !programId) return null
    return findProgramSummaryById(database, programId)
  }, [database, programId])

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [theme, setTheme] = useState<string>('cultural_exchange')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [created, setCreated] = useState(false)

  // Redirect if no session
  useEffect(() => {
    if (!session) {
      router.push('/partners')
    }
  }, [session, router])

  const programName = summary?.program.displayTitle ?? summary?.program.name ?? 'Program'
  const programSdgs = summary?.program.sdgFocus ?? []
  const programAgeRanges = summary?.program.targetAgeRanges ?? []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return

    setIsSubmitting(true)
    try {
      const now = new Date().toISOString()
      const createdById = partnerContext.partnerId ?? session?.email ?? 'partner'

      createRecord('programProjects', {
        programId,
        projectId: `project-${Date.now()}`,
        title: title.trim(),
        createdByType: 'partner',
        createdById,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      })

      setCreated(true)
    } catch (err) {
      console.error('Failed to create project:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!ready || !session) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="py-8 text-sm text-gray-600">
            {tc('loading')}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (created) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">{t('projectCreated')}</h2>
            <p className="mb-6 text-gray-600">
              {t('projectCreatedDesc')}
            </p>
            <div className="space-y-2">
              <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                <Link href={`/partner/programs/${programId}`}>
                  {t('backToProgram')}
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setCreated(false)
                  setTitle('')
                  setDescription('')
                }}
              >
                {t('createAnother')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="pb-16">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="px-0 text-purple-600 hover:text-purple-700">
            <Link href={`/partner/programs/${programId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {programName}
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t('createProjectTitle')}</h1>
          <p className="mt-1 text-gray-600">
            {t('createProjectDesc')}
          </p>
        </div>

        {/* Program context badge */}
        <Card className="mb-6 border-purple-100 bg-purple-50/50">
          <CardContent className="flex items-center gap-3 p-4">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">{programName}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {programAgeRanges.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {programAgeRanges.join(', ')}
                  </Badge>
                )}
                {programSdgs.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {programSdgs.length} SDG{programSdgs.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title & Description */}
          <Card>
            <CardHeader>
              <CardTitle>{t('projectDetails')}</CardTitle>
              <CardDescription>{t('projectDetailsDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  {t('projectTitle')} *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('projectTitlePlaceholder')}
                  required
                  minLength={5}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  {t('projectDescription')} *
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('projectDescPlaceholder')}
                  className="min-h-[120px]"
                  required
                  minLength={20}
                />
              </div>
            </CardContent>
          </Card>

          {/* Collaboration Theme */}
          <Card>
            <CardHeader>
              <CardTitle>{t('collaborationTheme')}</CardTitle>
              <CardDescription>{t('collaborationThemeDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                {collaborationThemes.map((option) => {
                  const isActive = theme === option.value
                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className={`w-full rounded-lg border p-4 text-left transition-all ${
                        isActive
                          ? 'border-purple-500 bg-purple-50 shadow-sm'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <p className="text-sm font-semibold text-gray-900">{option.title}</p>
                      <p className="mt-1 text-xs text-gray-600">{option.description}</p>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* SDG alignment from program (read-only display) */}
          {programSdgs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('sdgAlignment')}</CardTitle>
                <CardDescription>{t('sdgAlignmentDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
                  {programSdgs.map((sdgNum) => (
                    <SDGIcon key={sdgNum} number={sdgNum} size="lg" showTitle />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button variant="outline" className="flex-1" asChild>
              <Link href={`/partner/programs/${programId}`}>
                {tc('cancel')}
              </Link>
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim() || !description.trim()}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t('creating')}
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  {t('createProject')}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
