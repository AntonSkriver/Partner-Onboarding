'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, BookOpen } from 'lucide-react'

export default function SchoolResourcesPage() {
  const t = useTranslations('profile.resources')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">{t('title')}</h1>
          <p className="text-sm text-gray-600">
            {t('subtitleSchool')}
          </p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          {t('uploadResource')}
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-5 p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-50">
            <BookOpen className="h-8 w-8 text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">{t('noResources')}</h3>
          <p className="mx-auto max-w-md text-gray-500">
            {t('noResourcesDesc')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
