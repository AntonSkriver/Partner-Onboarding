'use client'

import { useTranslations } from 'next-intl'
import type { Control } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  File,
  Video,
  Globe,
  Book,
  Gamepad2,
  Presentation,
} from 'lucide-react'

const resourceTypes = [
  { value: 'document', label: 'Document (PDF, Word)', icon: File },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'website', label: 'Website/Link', icon: Globe },
  { value: 'presentation', label: 'Presentation', icon: Presentation },
  { value: 'book', label: 'Book/eBook', icon: Book },
  { value: 'game', label: 'Educational Game', icon: Gamepad2 },
]

const languages = [
  'English', 'Danish', 'Swedish', 'Norwegian', 'German', 'French', 'Spanish', 'Italian', 'Other'
]

interface ResourceInfoSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
}

export function ResourceInfoSection({ control }: ResourceInfoSectionProps) {
  const t = useTranslations('content')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('resourceInfo')}</CardTitle>
        <CardDescription>Basic details about your educational resource</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('resourceTitle')} *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Children's Rights Activity Guide" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('resourceType')} *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectResourceType')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {resourceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center">
                          <type.icon className="h-4 w-4 mr-2" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('description')} *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what this resource is about, how to use it, and what students will learn..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('language')} *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectLanguage')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('sharing')}</label>
            <FormField
              control={control}
              name="isPublic"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="isPublic" className="text-sm">
                      {t('shareWithAll')}
                    </label>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
