'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  Sparkles,
} from 'lucide-react'

import { getCurrentSession } from '@/lib/auth/session'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import type { Program } from '@/lib/types/program'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

import { resolvePartnerContext } from '@/lib/auth/partner-context'
import {
  AGE_RANGE_VALUES,
  COUNTRY_OPTIONS,
  PEDAGOGICAL_FRAMEWORK_VALUES,
  SDG_OPTIONS,
  STATUS_VALUES,
  friendlyLabel,
  programSchema,
} from '../../shared'
import type { ProgramFormValues } from '../../shared'
import { findProgramSummaryById } from '@/lib/programs/selectors'

const ProgramEditSkeleton = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4 text-gray-600">
      <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
      <span>Loading program data…</span>
    </div>
  </div>
)

const toFormValues = (program: Program): ProgramFormValues => ({
  name: program.name,
  description: program.description,
  learningGoals: program.learningGoals,
  pedagogicalFramework: program.pedagogicalFramework,
  targetAgeRanges: program.targetAgeRanges,
  countriesInScope: program.countriesInScope,
  sdgFocus: program.sdgFocus,
  startDate: program.startDate,
  endDate: program.endDate,
  status: program.status,
  isPublic: program.isPublic,
  programUrl: program.programUrl ?? '',
})

export default function EditProgramPage() {
  const router = useRouter()
  const params = useParams<{ programId: string }>()
  const [session, setSession] = useState(() => getCurrentSession())
  const [updatedProgram, setUpdatedProgram] = useState<Program | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const { ready: dataReady, database, updateRecord } = usePrototypeDb()

  useEffect(() => {
    setSession(getCurrentSession())
  }, [])

  useEffect(() => {
    if (!session) {
      router.push('/partner/login')
      return
    }

    if (session.role !== 'partner') {
      router.push('/partner/login')
    }
  }, [session, router])

  const { partnerRecord } = useMemo(
    () => resolvePartnerContext(session, database ?? null),
    [database, session],
  )

  const programSummary = useMemo(() => {
    if (!database || !params?.programId) return null
    return findProgramSummaryById(database, params.programId)
  }, [database, params?.programId])

  const program = programSummary?.program ?? null

  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: program ? toFormValues(program) : {
      name: '',
      description: '',
      learningGoals: '',
      pedagogicalFramework: [],
      targetAgeRanges: [],
      countriesInScope: [],
      sdgFocus: [],
      startDate: '',
      endDate: '',
      status: 'draft',
      isPublic: true,
      programUrl: '',
    },
  })

  useEffect(() => {
    if (program) {
      form.reset(toFormValues(program))
    }
  }, [program, form])

  const toggleValue = <T,>(value: T, current: T[], onChange: (next: T[]) => void) => {
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]
    onChange(next)
  }

  const handleSubmit = async (values: ProgramFormValues) => {
    if (!program) {
      setFormError('Program data was not found. Please return to the program list and try again.')
      return
    }

    setFormError(null)
    setIsSubmitting(true)

    try {
      const now = new Date().toISOString()
      const updated = updateRecord('programs', program.id, {
        name: values.name,
        description: values.description,
        learningGoals: values.learningGoals,
        pedagogicalFramework: values.pedagogicalFramework,
        targetAgeRanges: values.targetAgeRanges,
        countriesInScope: values.countriesInScope,
        sdgFocus: values.sdgFocus,
        startDate: values.startDate,
        endDate: values.endDate,
        status: values.status,
        isPublic: values.isPublic,
        programUrl: values.programUrl || undefined,
        updatedAt: now,
      })

      if (!updated) {
        throw new Error('Program not found in storage')
      }

      setUpdatedProgram(updated)
    } catch (error) {
      console.error('Failed to update program', error)
      setFormError('We were unable to save the changes. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session || !dataReady) {
    return <ProgramEditSkeleton />
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-lg w-full text-center space-y-4">
          <CardHeader>
            <CardTitle className="text-2xl">Program not found</CardTitle>
            <CardDescription>
              We couldn&apos;t locate this program in the prototype store. It may have been deleted.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/partner/profile?tab=programs">
              <Button variant="outline">Back to programs</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (updatedProgram) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-xl w-full">
          <CardHeader className="text-center space-y-3">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Program updated</CardTitle>
            <CardDescription>
              {updatedProgram.name} has been saved. Stakeholders will see the latest configuration
              when they review the prototype dashboards.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-purple-100 bg-purple-50 p-4">
              <h3 className="font-medium text-purple-900">Next steps</h3>
              <ul className="mt-2 text-sm text-purple-800 space-y-1 list-disc list-inside">
                <li>Review the updated overview page</li>
                <li>Invite co-partners and coordinators</li>
                <li>Test downstream flows with the latest data</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Link href={`/partner/programs/${program.id}/edit`} className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                Keep editing
              </Button>
            </Link>
            <Link href={`/partner/programs/${program.id}`} className="w-full sm:w-auto">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                View program details
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-purple-600 mb-2">
              <Sparkles className="h-4 w-4" />
              <span>Program Builder</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Program</h1>
            <p className="text-gray-600 mt-2 max-w-3xl">
              Update the configuration for your program. Changes are saved to the prototype
              localStorage store so dashboards and invitation flows stay aligned.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="hidden sm:inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {formError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Program Overview</CardTitle>
            <CardDescription>
              Update the key details partners and institutions use to understand your learning
              initiative.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form className="space-y-8" onSubmit={form.handleSubmit(handleSubmit)}>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Program name</FormLabel>
                      <FormControl>
                        <Input placeholder="Climate Changemakers 2025" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Program description</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Describe the program purpose, who it serves, and the experience you want participants to have."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="learningGoals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Learning goals</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="List the key learning outcomes or competencies the program develops."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {STATUS_VALUES.map((status) => (
                              <SelectItem key={status} value={status}>
                                {friendlyLabel(status)}
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
                    name="programUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Program website (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.org/program/climate-changemakers" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="pedagogicalFramework"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pedagogical frameworks</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {PEDAGOGICAL_FRAMEWORK_VALUES.map((value) => {
                          const isActive = field.value?.includes(value)
                          return (
                            <Badge
                              key={value}
                              variant={isActive ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() =>
                                toggleValue(value, field.value ?? [], field.onChange)
                              }
                            >
                              {friendlyLabel(value)}
                            </Badge>
                          )
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetAgeRanges"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target age ranges</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {AGE_RANGE_VALUES.map((value) => {
                          const isActive = field.value?.includes(value)
                          return (
                            <Badge
                              key={value}
                              variant={isActive ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() =>
                                toggleValue(value, field.value ?? [], field.onChange)
                              }
                            >
                              {value.replace('-', '–')}
                            </Badge>
                          )
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="countriesInScope"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Countries in scope</FormLabel>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {COUNTRY_OPTIONS.map((country) => (
                          <label
                            key={country.code}
                            className="flex items-start gap-2 rounded-lg border border-gray-200 bg-white p-3 hover:border-purple-300"
                          >
                            <Checkbox
                              checked={field.value?.includes(country.code) ?? false}
                              onCheckedChange={() =>
                                toggleValue(country.code, field.value ?? [], field.onChange)
                              }
                            />
                            <span className="text-sm leading-5 text-gray-700">
                              {country.name}
                            </span>
                          </label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sdgFocus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SDG focus areas</FormLabel>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {SDG_OPTIONS.map((sdg) => {
                          const isActive = field.value?.includes(sdg.value)
                          return (
                            <Badge
                              key={sdg.value}
                              variant={isActive ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() =>
                                toggleValue(sdg.value, field.value ?? [], field.onChange)
                              }
                            >
                              {sdg.label}
                            </Badge>
                          )
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex items-start justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="space-y-1">
                        <FormLabel>Visibility</FormLabel>
                        <p className="text-sm text-gray-600">
                          Public programs are discoverable by other partners in the prototype.
                        </p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/partner/programs/${program.id}`)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving changes…
                      </>
                    ) : (
                      'Save changes'
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
