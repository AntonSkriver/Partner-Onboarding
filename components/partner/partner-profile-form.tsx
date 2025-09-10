'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Upload, X, Globe, Mail, Phone, MapPin, Tag, Award } from 'lucide-react'
import { OrganizationAPI, SDG_OPTIONS, THEMATIC_TAGS } from '@/lib/api/organizations'
import { Database } from '@/lib/types/database'

type Organization = Database['public']['Tables']['organizations']['Row']
type OrganizationUpdate = Database['public']['Tables']['organizations']['Update']

const profileSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  organization_type: z.enum(['ngo', 'government', 'corporate', 'network', 'school_network']),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  short_description: z.string().min(10, 'Description must be at least 10 characters'),
  countries_of_operation: z.array(z.string()).min(1, 'Select at least one country'),
  regions_of_operation: z.array(z.string()).optional(),
  languages: z.array(z.string()).min(1, 'Select at least one language'),
  sdg_tags: z.array(z.string()).optional(),
  thematic_tags: z.array(z.string()).optional(),
  primary_contacts: z.array(z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().optional(),
    role: z.string().min(1, 'Role is required'),
    isPrimary: z.boolean().default(false)
  })).min(1, 'At least one contact is required')
})

type ProfileFormData = z.infer<typeof profileSchema>

interface PartnerProfileFormProps {
  organization?: Organization
  onSave: (data: Organization) => void
  onCancel?: () => void
  isEditing?: boolean
}

export function PartnerProfileForm({ 
  organization, 
  onSave, 
  onCancel, 
  isEditing = false 
}: PartnerProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(organization?.logo || null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: organization?.name || '',
      organization_type: organization?.organization_type || 'ngo',
      website: organization?.website || '',
      short_description: organization?.short_description || '',
      countries_of_operation: organization?.countries_of_operation || [],
      regions_of_operation: organization?.regions_of_operation || [],
      languages: organization?.languages || [],
      sdg_tags: organization?.sdg_tags || [],
      thematic_tags: organization?.thematic_tags || [],
      primary_contacts: Array.isArray(organization?.primary_contacts) 
        ? organization.primary_contacts as any[] 
        : [{ name: '', email: '', phone: '', role: '', isPrimary: true }]
    }
  })

  const watchedContacts = watch('primary_contacts')
  const watchedSDGs = watch('sdg_tags')
  const watchedThemes = watch('thematic_tags')

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addContact = () => {
    const contacts = watchedContacts || []
    setValue('primary_contacts', [
      ...contacts,
      { name: '', email: '', phone: '', role: '', isPrimary: false }
    ])
  }

  const removeContact = (index: number) => {
    const contacts = watchedContacts || []
    setValue('primary_contacts', contacts.filter((_, i) => i !== index))
  }

  const toggleSDG = (sdgValue: string) => {
    const current = watchedSDGs || []
    if (current.includes(sdgValue)) {
      setValue('sdg_tags', current.filter(s => s !== sdgValue))
    } else {
      setValue('sdg_tags', [...current, sdgValue])
    }
  }

  const toggleTheme = (theme: string) => {
    const current = watchedThemes || []
    if (current.includes(theme)) {
      setValue('thematic_tags', current.filter(t => t !== theme))
    } else {
      setValue('thematic_tags', [...current, theme])
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true)
    try {
      let logoUrl = organization?.logo || null

      // TODO: Upload logo to storage if logoFile exists
      if (logoFile) {
        // logoUrl = await uploadLogo(logoFile)
      }

      const organizationData: OrganizationUpdate = {
        ...data,
        logo: logoUrl,
        updated_at: new Date().toISOString()
      }

      let result: Organization | null = null
      
      if (isEditing && organization) {
        result = await OrganizationAPI.update(organization.id, organizationData)
      } else {
        result = await OrganizationAPI.create({
          ...organizationData,
          verification_status: 'pending',
          is_active: true
        })
      }

      if (result) {
        onSave(result)
      } else {
        throw new Error('Failed to save organization')
      }
    } catch (error) {
      console.error('Error saving organization:', error)
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
            <Award className="w-5 h-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Core details about your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Organization Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter your organization name"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Organization Type */}
          <div className="space-y-2">
            <Label htmlFor="organization_type">Organization Type *</Label>
            <Select 
              onValueChange={(value) => setValue('organization_type', value as any)}
              defaultValue={organization?.organization_type}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select organization type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ngo">Non-Governmental Organization (NGO)</SelectItem>
                <SelectItem value="government">Government Agency</SelectItem>
                <SelectItem value="corporate">Corporate/Business</SelectItem>
                <SelectItem value="network">Educational Network</SelectItem>
                <SelectItem value="school_network">School Network</SelectItem>
              </SelectContent>
            </Select>
            {errors.organization_type && (
              <p className="text-sm text-red-600">{errors.organization_type.message}</p>
            )}
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label>Organization Logo</Label>
            <div className="flex items-center space-x-4">
              {logoPreview && (
                <div className="relative w-20 h-20 border rounded-lg overflow-hidden">
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                    onClick={() => {
                      setLogoPreview(null)
                      setLogoFile(null)
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              <div>
                <input
                  type="file"
                  id="logo"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Label
                  htmlFor="logo"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  <Upload className="w-4 h-4" />
                  Upload Logo
                </Label>
              </div>
            </div>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="website"
                {...register('website')}
                placeholder="https://www.example.com"
                className="pl-10"
              />
            </div>
            {errors.website && (
              <p className="text-sm text-red-600">{errors.website.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="short_description">Short Description *</Label>
            <Textarea
              id="short_description"
              {...register('short_description')}
              placeholder="Briefly describe your organization's mission and work"
              rows={3}
            />
            {errors.short_description && (
              <p className="text-sm text-red-600">{errors.short_description.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Contact Information
          </CardTitle>
          <CardDescription>
            Primary contacts for your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {watchedContacts?.map((contact, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Contact {index + 1}</h4>
                {watchedContacts.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeContact(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    {...register(`primary_contacts.${index}.name`)}
                    placeholder="Contact name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Role *</Label>
                  <Input
                    {...register(`primary_contacts.${index}.role`)}
                    placeholder="e.g. Program Director"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    {...register(`primary_contacts.${index}.email`)}
                    placeholder="email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    {...register(`primary_contacts.${index}.phone`)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`primary-${index}`}
                  checked={contact.isPrimary}
                  onCheckedChange={(checked) => {
                    const contacts = [...watchedContacts]
                    contacts[index].isPrimary = !!checked
                    if (checked) {
                      // Only one primary contact
                      contacts.forEach((c, i) => {
                        if (i !== index) c.isPrimary = false
                      })
                    }
                    setValue('primary_contacts', contacts)
                  }}
                />
                <Label htmlFor={`primary-${index}`}>Primary contact</Label>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addContact}
            className="w-full"
          >
            Add Another Contact
          </Button>
        </CardContent>
      </Card>

      {/* Geographic Scope */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Geographic Scope
          </CardTitle>
          <CardDescription>
            Countries and regions where your organization operates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Countries - TODO: Implement country selector */}
          <div className="space-y-2">
            <Label>Countries of Operation *</Label>
            <p className="text-sm text-gray-500">
              Select countries where your organization operates
            </p>
            {/* Placeholder for country selector */}
            <div className="border rounded-md p-3 text-gray-500">
              Country selector component to be implemented
            </div>
          </div>

          {/* Languages */}
          <div className="space-y-2">
            <Label>Languages *</Label>
            <p className="text-sm text-gray-500">
              Languages your organization works in
            </p>
            {/* Placeholder for language selector */}
            <div className="border rounded-md p-3 text-gray-500">
              Language selector component to be implemented
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SDG Focus */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Focus Areas
          </CardTitle>
          <CardDescription>
            UN Sustainable Development Goals and thematic areas your organization focuses on
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* SDG Selection */}
          <div className="space-y-3">
            <Label>UN Sustainable Development Goals</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {SDG_OPTIONS.map((sdg) => (
                <div key={sdg.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sdg-${sdg.value}`}
                    checked={watchedSDGs?.includes(sdg.value)}
                    onCheckedChange={() => toggleSDG(sdg.value)}
                  />
                  <Label htmlFor={`sdg-${sdg.value}`} className="text-sm">
                    {sdg.value}. {sdg.label}
                  </Label>
                </div>
              ))}
            </div>
            {watchedSDGs && watchedSDGs.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {watchedSDGs.map((sdgValue) => {
                  const sdg = SDG_OPTIONS.find(s => s.value === sdgValue)
                  return sdg ? (
                    <Badge key={sdg.value} variant="secondary">
                      SDG {sdg.value}
                    </Badge>
                  ) : null
                })}
              </div>
            )}
          </div>

          <Separator />

          {/* Thematic Tags */}
          <div className="space-y-3">
            <Label>Thematic Focus Areas</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {THEMATIC_TAGS.map((theme) => (
                <div key={theme} className="flex items-center space-x-2">
                  <Checkbox
                    id={`theme-${theme}`}
                    checked={watchedThemes?.includes(theme)}
                    onCheckedChange={() => toggleTheme(theme)}
                  />
                  <Label htmlFor={`theme-${theme}`} className="text-sm">
                    {theme}
                  </Label>
                </div>
              ))}
            </div>
            {watchedThemes && watchedThemes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {watchedThemes.map((theme) => (
                  <Badge key={theme} variant="outline">
                    {theme}
                  </Badge>
                ))}
              </div>
            )}
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