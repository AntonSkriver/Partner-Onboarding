'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Mail, Phone, MapPin, GraduationCap, Shield, Users } from 'lucide-react'
import { SchoolAPI, SCHOOL_TYPES, GRADE_LEVELS, DEFAULT_SAFEGUARDING_SETTINGS } from '@/lib/api/schools'
import { Database } from '@/lib/types/database'

type School = Database['public']['Tables']['schools']['Row']
type SchoolUpdate = Database['public']['Tables']['schools']['Update']

const schoolSchema = z.object({
  name: z.string().min(1, 'School name is required'),
  school_type: z.enum(['public', 'private', 'charter', 'international', 'other']),
  contact_email: z.string().email('Valid email is required'),
  contact_phone: z.string().optional(),
  principal_name: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    region: z.string().optional(),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().optional()
  }),
  grade_range: z.object({
    min: z.number().min(0).max(12),
    max: z.number().min(0).max(12)
  }).refine(data => data.min <= data.max, {
    message: "Minimum grade cannot be higher than maximum grade",
    path: ["max"]
  }),
  languages: z.array(z.string()).min(1, 'Select at least one language'),
  safeguarding_settings: z.object({
    consentStatus: z.enum(['pending', 'partial', 'complete']),
    defaultModerationMode: z.enum(['teacher_approval', 'auto_approve', 'strict_review']),
    mediaPreferences: z.object({
      allowPhotos: z.boolean(),
      allowVideos: z.boolean(),
      requireParentConsent: z.boolean()
    }),
    gdprCompliant: z.boolean()
  })
})

type SchoolFormData = z.infer<typeof schoolSchema>

interface SchoolProfileFormProps {
  school?: School
  onSave: (data: School) => void
  onCancel?: () => void
  isEditing?: boolean
}

const LANGUAGE_OPTIONS = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Mandarin', 'Japanese', 'Korean', 'Arabic', 'Russian', 'Hindi',
  'Dutch', 'Swedish', 'Danish', 'Norwegian', 'Finnish'
]

const COUNTRY_OPTIONS = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 
  'Spain', 'Italy', 'Australia', 'Japan', 'South Korea', 'Brazil',
  'Mexico', 'India', 'China', 'Russia', 'South Africa'
]

export function SchoolProfileForm({ 
  school, 
  onSave, 
  onCancel, 
  isEditing = false 
}: SchoolProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control
  } = useForm<SchoolFormData>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: school?.name || '',
      school_type: school?.school_type || 'public',
      contact_email: school?.contact_email || '',
      contact_phone: school?.contact_phone || '',
      principal_name: school?.principal_name || '',
      address: {
        street: (school?.address as any)?.street || '',
        city: (school?.address as any)?.city || '',
        region: (school?.address as any)?.region || '',
        country: (school?.address as any)?.country || '',
        postalCode: (school?.address as any)?.postalCode || ''
      },
      grade_range: {
        min: (school?.grade_range as any)?.min || 1,
        max: (school?.grade_range as any)?.max || 12
      },
      languages: school?.languages || [],
      safeguarding_settings: {
        consentStatus: (school?.safeguarding_settings as any)?.consentStatus || 'pending',
        defaultModerationMode: (school?.safeguarding_settings as any)?.defaultModerationMode || 'teacher_approval',
        mediaPreferences: {
          allowPhotos: (school?.safeguarding_settings as any)?.mediaPreferences?.allowPhotos || false,
          allowVideos: (school?.safeguarding_settings as any)?.mediaPreferences?.allowVideos || false,
          requireParentConsent: (school?.safeguarding_settings as any)?.mediaPreferences?.requireParentConsent || true
        },
        gdprCompliant: (school?.safeguarding_settings as any)?.gdprCompliant || false
      }
    }
  })

  const watchedLanguages = watch('languages')
  const watchedSafeguarding = watch('safeguarding_settings')

  const toggleLanguage = (language: string) => {
    const current = watchedLanguages || []
    if (current.includes(language)) {
      setValue('languages', current.filter(l => l !== language))
    } else {
      setValue('languages', [...current, language])
    }
  }

  const onSubmit = async (data: SchoolFormData) => {
    setIsSubmitting(true)
    try {
      const schoolData: SchoolUpdate = {
        ...data,
        updated_at: new Date().toISOString()
      }

      let result: School | null = null
      
      if (isEditing && school) {
        result = await SchoolAPI.update(school.id, schoolData)
      } else {
        result = await SchoolAPI.create({
          ...schoolData,
          is_active: true
        })
      }

      if (result) {
        onSave(result)
      } else {
        throw new Error('Failed to save school')
      }
    } catch (error) {
      console.error('Error saving school:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            School Information
          </CardTitle>
          <CardDescription>
            Basic details about your school
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* School Name */}
          <div className="space-y-2">
            <Label htmlFor="name">School Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter your school name"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* School Type */}
          <div className="space-y-2">
            <Label htmlFor="school_type">School Type *</Label>
            <Select 
              onValueChange={(value) => setValue('school_type', value as any)}
              defaultValue={school?.school_type}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select school type" />
              </SelectTrigger>
              <SelectContent>
                {SCHOOL_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.school_type && (
              <p className="text-sm text-red-600">{errors.school_type.message}</p>
            )}
          </div>

          {/* Grade Range */}
          <div className="space-y-2">
            <Label>Grade Range *</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade_min">Minimum Grade</Label>
                <Select 
                  onValueChange={(value) => setValue('grade_range.min', parseInt(value))}
                  defaultValue={(school?.grade_range as any)?.min?.toString() || '1'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_LEVELS.map((grade) => (
                      <SelectItem key={grade.value} value={grade.value.toString()}>
                        {grade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade_max">Maximum Grade</Label>
                <Select 
                  onValueChange={(value) => setValue('grade_range.max', parseInt(value))}
                  defaultValue={(school?.grade_range as any)?.max?.toString() || '12'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_LEVELS.map((grade) => (
                      <SelectItem key={grade.value} value={grade.value.toString()}>
                        {grade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {errors.grade_range && (
              <p className="text-sm text-red-600">{errors.grade_range.message}</p>
            )}
          </div>

          {/* Principal Name */}
          <div className="space-y-2">
            <Label htmlFor="principal_name">Principal Name</Label>
            <Input
              id="principal_name"
              {...register('principal_name')}
              placeholder="Enter principal's name"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact & Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Contact & Location
          </CardTitle>
          <CardDescription>
            How partners and coordinators can reach your school
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="contact_email"
                  type="email"
                  {...register('contact_email')}
                  placeholder="school@example.com"
                  className="pl-10"
                />
              </div>
              {errors.contact_email && (
                <p className="text-sm text-red-600">{errors.contact_email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="contact_phone"
                  {...register('contact_phone')}
                  placeholder="+1 (555) 123-4567"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <Label>Address</Label>
            
            <div className="space-y-2">
              <Input
                {...register('address.street')}
                placeholder="Street address (optional)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  {...register('address.city')}
                  placeholder="City *"
                />
                {errors.address?.city && (
                  <p className="text-sm text-red-600">{errors.address.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  {...register('address.region')}
                  placeholder="State/Region"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Select 
                  onValueChange={(value) => setValue('address.country', value)}
                  defaultValue={(school?.address as any)?.country}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country *" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_OPTIONS.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.address?.country && (
                  <p className="text-sm text-red-600">{errors.address.country.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  {...register('address.postalCode')}
                  placeholder="Postal Code"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Languages
          </CardTitle>
          <CardDescription>
            Languages taught and spoken at your school
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {LANGUAGE_OPTIONS.map((language) => (
              <div key={language} className="flex items-center space-x-2">
                <Checkbox
                  id={`lang-${language}`}
                  checked={watchedLanguages?.includes(language)}
                  onCheckedChange={() => toggleLanguage(language)}
                />
                <Label htmlFor={`lang-${language}`} className="text-sm">
                  {language}
                </Label>
              </div>
            ))}
          </div>
          
          {watchedLanguages && watchedLanguages.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {watchedLanguages.map((language) => (
                <Badge key={language} variant="secondary">
                  {language}
                </Badge>
              ))}
            </div>
          )}
          
          {errors.languages && (
            <p className="text-sm text-red-600">{errors.languages.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Safeguarding Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Safeguarding & Privacy
          </CardTitle>
          <CardDescription>
            Settings to protect student privacy and ensure safe participation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Consent Status */}
          <div className="space-y-2">
            <Label>Parent/Guardian Consent Status</Label>
            <Select 
              onValueChange={(value) => setValue('safeguarding_settings.consentStatus', value as any)}
              defaultValue={watchedSafeguarding.consentStatus}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending - Need to collect consents</SelectItem>
                <SelectItem value="partial">Partial - Some consents collected</SelectItem>
                <SelectItem value="complete">Complete - All consents collected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Moderation Mode */}
          <div className="space-y-2">
            <Label>Content Moderation</Label>
            <Select 
              onValueChange={(value) => setValue('safeguarding_settings.defaultModerationMode', value as any)}
              defaultValue={watchedSafeguarding.defaultModerationMode}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teacher_approval">Teacher Approval Required</SelectItem>
                <SelectItem value="auto_approve">Auto-Approve (Low Risk)</SelectItem>
                <SelectItem value="strict_review">Strict Review Process</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Media Preferences */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Media & Content Sharing</Label>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Allow Photos</Label>
                  <p className="text-sm text-gray-600">Students can share photos of their work</p>
                </div>
                <Switch
                  checked={watchedSafeguarding.mediaPreferences.allowPhotos}
                  onCheckedChange={(checked) => 
                    setValue('safeguarding_settings.mediaPreferences.allowPhotos', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Allow Videos</Label>
                  <p className="text-sm text-gray-600">Students can share video content</p>
                </div>
                <Switch
                  checked={watchedSafeguarding.mediaPreferences.allowVideos}
                  onCheckedChange={(checked) => 
                    setValue('safeguarding_settings.mediaPreferences.allowVideos', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Require Parent Consent</Label>
                  <p className="text-sm text-gray-600">Parent consent required for media sharing</p>
                </div>
                <Switch
                  checked={watchedSafeguarding.mediaPreferences.requireParentConsent}
                  onCheckedChange={(checked) => 
                    setValue('safeguarding_settings.mediaPreferences.requireParentConsent', checked)
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* GDPR Compliance */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>GDPR Compliant</Label>
              <p className="text-sm text-gray-600">
                School follows GDPR data protection guidelines
              </p>
            </div>
            <Switch
              checked={watchedSafeguarding.gdprCompliant}
              onCheckedChange={(checked) => 
                setValue('safeguarding_settings.gdprCompliant', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Profile' : 'Create Profile'}
        </Button>
      </div>
    </form>
  )
}