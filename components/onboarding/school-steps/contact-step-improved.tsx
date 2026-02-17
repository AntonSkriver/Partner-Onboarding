'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useSchoolForm } from '@/contexts/school-form-context'
import { Shield } from 'lucide-react'
import { useTranslations } from 'next-intl'

const contactSchema = z.object({
  contactName: z.string().min(2, 'Name must be at least 2 characters'),
  contactEmail: z.string().email('Please enter a valid email address'),
  contactRole: z.string().min(1, 'Please select a role'),
})

type ContactData = z.infer<typeof contactSchema>

interface ContactStepProps {
  onNext: () => void
  onPrevious: () => void
}

export function ContactStep({ onNext, onPrevious }: ContactStepProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { formData, updateFormData } = useSchoolForm()
  const t = useTranslations('schoolOnboarding')

  const roles = [
    { value: 'principal', label: t('contactRole_principal') },
    { value: 'vice-principal', label: t('contactRole_vice-principal') },
    { value: 'teacher', label: t('contactRole_teacher') },
    { value: 'coordinator', label: t('contactRole_coordinator') },
    { value: 'administrator', label: t('contactRole_administrator') },
    { value: 'counselor', label: t('contactRole_counselor') },
    { value: 'other', label: t('contactRole_other') },
  ]

  const form = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      contactName: formData.contactName || '',
      contactEmail: formData.contactEmail || '',
      contactRole: formData.contactRole || undefined,
    },
  })

  const handleSubmit = async (data: ContactData) => {
    setIsLoading(true)
    try {
      updateFormData(data)
      await new Promise(resolve => setTimeout(resolve, 300))
      onNext()
    } catch (error) {
      console.error('Error processing contact information:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-purple-600 mb-1">{t('contactStepLabel')}</p>
        <h1 className="text-2xl font-bold text-gray-900">{t('contactStepTitle')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('contactStepSubtitle')}</p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('contactNameLabel')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('contactNamePlaceholder')}
                    {...field}
                    className="h-14 text-base px-4 rounded-xl border-gray-200 focus:border-purple-600 focus:ring-purple-600/20"
                    autoFocus
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('contactEmailLabel')}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t('contactEmailPlaceholder')}
                    {...field}
                    className="h-14 text-base px-4 rounded-xl border-gray-200 focus:border-purple-600 focus:ring-purple-600/20"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactRole"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('contactRoleLabel')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-14 text-base rounded-xl">
                      <SelectValue placeholder={t('contactRolePlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Privacy notice */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 p-6 border border-amber-100/50">
            <div className="relative flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-amber-900 mb-1">{t('contactPrivacyTitle')}</h4>
                <p className="text-sm text-amber-700 leading-relaxed">
                  {t('contactPrivacyDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              className="flex-1 py-6 text-base border-gray-200 hover:bg-gray-50"
              size="lg"
            >
              {t('back')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-6 text-base bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
              size="lg"
            >
              {isLoading ? t('processing') : t('continue')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
