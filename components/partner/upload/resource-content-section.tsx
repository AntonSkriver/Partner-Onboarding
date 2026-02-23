'use client'

import { useTranslations } from 'next-intl'
import type { Control } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload } from 'lucide-react'

interface ResourceContentSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  isWebsite: boolean
  uploadTab: string
  onUploadTabChange: (value: string) => void
}

export function ResourceContentSection({
  control,
  isWebsite,
  uploadTab,
  onUploadTabChange,
}: ResourceContentSectionProps) {
  const t = useTranslations('content')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('resourceContent')}</CardTitle>
        <CardDescription>
          {isWebsite ? 'Provide the URL to your online resource' : 'Upload your file or provide a link'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isWebsite ? (
          <FormField
            control={control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('websiteUrl')} *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/educational-resource"
                    type="url"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <Tabs value={uploadTab} onValueChange={onUploadTabChange}>
            <TabsList>
              <TabsTrigger value="file">{t('uploadFile')}</TabsTrigger>
              <TabsTrigger value="url">{t('provideLink')}</TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="mt-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-gray-600">{t('dragDrop')}</p>
                  <Button type="button" variant="outline">
                    {t('chooseFile')}
                  </Button>
                  <p className="text-xs text-gray-500">
                    {t('maxFileSize')}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="url" className="mt-4">
              <FormField
                control={control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resource URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/your-resource"
                        type="url"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
