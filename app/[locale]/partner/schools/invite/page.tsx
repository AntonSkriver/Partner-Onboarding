'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  X, 
  School, 
  Mail, 
  Globe, 
  Send,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { getProgramsForPartner } from '@/lib/programs/selectors'

const DEFAULT_PARTNER_ID = 'partner-unicef'

const schoolInviteSchema = z.object({
  schools: z.array(z.object({
    schoolName: z.string().min(2, 'School name is required'),
    country: z.string().min(2, 'Country is required'),
    contactEmail: z.string().email('Valid email is required'),
    contactName: z.string().optional(),
    programId: z.string().min(1, 'Program is required'),
  })).min(1, 'At least one school is required'),
  customMessage: z.string().optional(),
})

type SchoolInviteData = z.infer<typeof schoolInviteSchema>

// Pre-populated schools for UNICEF (Rights Schools in Denmark)
const rightsSchools = [
  { name: "Christianshavns Skole", country: "Denmark", email: "info@christianshavnsskole.kk.dk" },
  { name: "Frederiksberg Gymnasium", country: "Denmark", email: "rektorsekretariat@frederiksberg-gym.dk" },
  { name: "Ørestad Gymnasium", country: "Denmark", email: "oerestadgym@oerestadgym.dk" },
  { name: "Gammel Hellerup Gymnasium", country: "Denmark", email: "ghg@ghg.dk" },
  { name: "Rysensteen Gymnasium", country: "Denmark", email: "rysensteen@rysensteengym.dk" },
]

const countries = [
  "Denmark", "Sweden", "Norway", "Germany", "Netherlands", "United Kingdom", 
  "France", "Spain", "Italy", "Poland", "Finland", "Belgium", "Other"
]

export default function InviteSchoolsPage() {
  const t = useTranslations('schools')
  const tc = useTranslations('common')
  const [invitationsSent, setInvitationsSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPresetSchools, setSelectedPresetSchools] = useState<string[]>([])
  const { ready: prototypeReady, database } = usePrototypeDb()

  const programOptions = useMemo(() => {
    if (!prototypeReady || !database) return []
    const programs = getProgramsForPartner(database, DEFAULT_PARTNER_ID, { includeRelatedPrograms: true })
    return programs.map((program) => ({
      id: program.id,
      label: program.displayTitle || program.name,
    }))
  }, [prototypeReady, database])

  const defaultProgramId = programOptions[0]?.id ?? 'program-communities-2025'

  const form = useForm<SchoolInviteData>({
    resolver: zodResolver(schoolInviteSchema),
    defaultValues: {
      schools: [{ schoolName: '', country: '', contactEmail: '', contactName: '', programId: defaultProgramId }],
      customMessage: 'We would love to invite your school to join our partnership program with Class2Class. This platform enables meaningful educational collaborations between classrooms worldwide, aligned with our mission to promote children&apos;s rights and global citizenship.'
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'schools',
  })

  const addSchoolField = () => {
    append({ schoolName: '', country: '', contactEmail: '', contactName: '', programId: defaultProgramId })
  }

  const addPresetSchool = (school: typeof rightsSchools[0]) => {
    const schoolId = `${school.name}-${school.country}`
    if (selectedPresetSchools.includes(schoolId)) return
    
    append({
      schoolName: school.name,
      country: school.country,
      contactEmail: school.email,
      contactName: '',
      programId: defaultProgramId,
    })
    setSelectedPresetSchools([...selectedPresetSchools, schoolId])
  }

  const handleSubmit = async (data: SchoolInviteData) => {
    setIsLoading(true)
    try {
      // Enhanced invitation sending with tracking
      console.log('Sending invitations with enhanced email flow:', data)
      
      const countryCodeMap: Record<string, string> = {
        Denmark: 'DK',
        Sweden: 'SE',
        Norway: 'NO',
        Germany: 'DE',
        Netherlands: 'NL',
        'United Kingdom': 'UK',
        France: 'FR',
        Spain: 'ES',
        Italy: 'IT',
        Poland: 'PL',
        Finland: 'FI',
        Belgium: 'BE',
      }

      // Generate unique invitation tokens for each school
      const invitationsWithTokens = data.schools.map(school => ({
        ...school,
        countryCode: countryCodeMap[school.country] ?? school.country.slice(0, 2).toUpperCase(),
        programName: programOptions.find((program) => program.id === school.programId)?.label ?? 'Assigned program',
        partnerId: DEFAULT_PARTNER_ID,
        invitationId: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        invitedAt: new Date().toISOString(),
        status: 'sent',
        partnerName: 'UNICEF Denmark',
        inviteUrl: `${window.location.origin}/school/invite/accept?${new URLSearchParams({
          schoolName: school.schoolName,
          contactName: school.contactName || 'School Lead',
          email: school.contactEmail,
          partnerId: DEFAULT_PARTNER_ID,
          programId: school.programId,
          country: countryCodeMap[school.country] ?? school.country.slice(0, 2).toUpperCase(),
          city: school.country,
        }).toString()}`,
      }))
      
      // In a real app, this would:
      // 1. Save invitations to database with tracking
      // 2. Send personalized emails with invitation links
      // 3. Create invitation acceptance flow
      
      // Store invitations in localStorage for demo
      const existingInvitations = JSON.parse(localStorage.getItem('sentInvitations') || '[]')
      const updatedInvitations = [...existingInvitations, ...invitationsWithTokens]
      localStorage.setItem('sentInvitations', JSON.stringify(updatedInvitations))
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      setInvitationsSent(true)
      
    } catch (error) {
      console.error('Failed to send invitations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (invitationsSent) {
    const sentInvitations = JSON.parse(localStorage.getItem('sentInvitations') || '[]')
    const recentInvitations = sentInvitations.slice(-form.getValues('schools').length)
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('success')}</h2>
              <p className="text-gray-600">
                {recentInvitations.length} school{recentInvitations.length > 1 ? 's' : ''} have been invited to join Class2Class
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3">What happens next?</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Schools will receive personalized invitation emails with your custom message</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Each invitation includes a unique link to join Class2Class under your partnership</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Your selected program will already be waiting for them with resources.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>You&apos;ll be notified when schools accept and can start collaborative projects immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Track invitation status in your partner dashboard</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3 mb-6">
              <h4 className="font-semibold text-gray-900">Invited Schools:</h4>
              <div className="space-y-2">
                {recentInvitations.map((invitation: { schoolName: string; contactEmail: string; programName?: string }, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{invitation.schoolName}</p>
                      <p className="text-sm text-gray-600">{invitation.contactEmail}</p>
                      <p className="text-xs text-gray-500">Program: {invitation.programName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Sent</span>
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Link href="/partner/dashboard">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setInvitationsSent(false)} className="flex-1">
                  Send More Invitations
                </Button>
                <Link href="/partner/schools" className="flex-1">
                  <Button variant="outline" className="w-full">
                    View All Invitations
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/partner/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('inviteTitle')}</h1>
                <p className="text-gray-600">{t('inviteSubtitle')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <School className="h-4 w-4" />
              <span>UNICEF Denmark</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Pre-populated Rights Schools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <School className="h-5 w-5 mr-2 text-purple-600" />
              {t('rightsSchools')}
            </CardTitle>
            <CardDescription>
              {t('rightsSchoolsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rightsSchools.map((school, index) => {
                const schoolId = `${school.name}-${school.country}`
                const isSelected = selectedPresetSchools.includes(schoolId)
                
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                    onClick={() => !isSelected && addPresetSchool(school)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{school.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          <Globe className="h-3 w-3 inline mr-1" />
                          {school.country}
                        </p>
                        <p className="text-xs text-gray-600">
                          <Mail className="h-3 w-3 inline mr-1" />
                          {school.email}
                        </p>
                      </div>
                      <div>
                        {isSelected ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Plus className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Manual School Invitation */}
        <Card>
          <CardHeader>
            <CardTitle>{t('manualTitle')}</CardTitle>
            <CardDescription>
              Invite specific schools to join your partnership program
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium text-gray-900">School {index + 1}</h4>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`schools.${index}.schoolName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('schoolName')} *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter school name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`schools.${index}.country`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('country')} *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {countries.map((country) => (
                                      <SelectItem key={country} value={country}>
                                        {country}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`schools.${index}.contactEmail`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('contactEmail')} *</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="school@example.com" 
                                    type="email"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`schools.${index}.contactName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('contactName')} ({tc('optional')})</FormLabel>
                                <FormControl>
                                  <Input placeholder="Principal or coordinator name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`schools.${index}.programId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('assignProgram')} *</FormLabel>
                                {programOptions.length === 0 ? (
                                  <div className="text-sm text-gray-500">Loading programs...</div>
                                ) : (
                                  <Select onValueChange={field.onChange} value={field.value || defaultProgramId}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder={t('selectProgram')} />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {programOptions.map((program) => (
                                        <SelectItem key={program.id} value={program.id}>
                                          {program.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={addSchoolField}
                  className="w-full border-dashed border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another School
                </Button>

                <FormField
                  control={form.control}
                  name="customMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('customMessage')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add a personal message to your invitation..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Schools will receive an email invitation with a link to join Class2Class 
                    under your partnership. They can review your profile before accepting.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-4 pt-4">
                  <Link href="/partner/dashboard" className="flex-1">
                    <Button variant="outline" className="w-full">
                      {tc('cancel')}
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {t('send')}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
