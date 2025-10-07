'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  Loader2,
  Flag,
  Layers,
  MapPin,
  School,
  Share2,
  Plus,
  Check,
  X,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { getCurrentSession } from '@/lib/auth/session'
import { resolvePartnerContext } from '@/lib/auth/partner-context'
import {
  findProgramSummaryById,
  type ProgramSummary,
} from '@/lib/programs/selectors'
import {
  friendlyLabel,
  COUNTRY_OPTIONS,
} from '../shared'
import type {
  CoPartnerPermissions,
  CoPartnerRole,
  ProgramInvitation,
} from '@/lib/types/program'
import type {
  PrototypeDatabase,
  PrototypeRecord,
  PrototypeTableKey,
  CreateInput,
  UpdateInput,
} from '@/lib/storage/prototype-db'

const formatDate = (date: string) => {
  try {
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return date
  }
}

const formatRelativeTime = (timestamp: string) => {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) {
    return timestamp
  }

  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)

  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  }

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  }

  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 4) {
    return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`
  }

  return date.toLocaleDateString()
}

const statusStyles: Record<string, string> = {
  draft: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  active: 'bg-green-50 text-green-700 border-green-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  archived: 'bg-gray-100 text-gray-600 border-gray-200',
}

export default function ProgramDetailPage() {
  const router = useRouter()
  const params = useParams<{ programId: string }>()
  const [session, setSession] = useState(() => getCurrentSession())
  const { ready: dataReady, database, createRecord, updateRecord, refresh } = usePrototypeDb()

  useEffect(() => {
    setSession(getCurrentSession())
  }, [])

  useEffect(() => {
    if (!session || session.role !== 'partner') {
      router.push('/partner/login')
    }
  }, [router, session])

  const partnerContext = useMemo(
    () => resolvePartnerContext(session, database ?? null),
    [database, session],
  )
  const { partnerRecord } = partnerContext

  const summary = useMemo(() => {
    if (!database || !params?.programId) return null
    return findProgramSummaryById(database, params.programId)
  }, [database, params?.programId])

  if (!session || !dataReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3 text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto" />
          <p>Loading program details…</p>
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-lg w-full text-center space-y-4">
          <CardHeader>
            <CardTitle className="text-2xl">Program not found</CardTitle>
            <CardDescription>
              We couldn&apos;t locate that program in the prototype data store. It may have been
              deleted or you may have followed an outdated link.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/partner/programs">
              <Button variant="outline">Back to programs</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <ProgramDetail
      summary={summary}
      partnerName={partnerRecord?.organizationName}
      partnerContext={partnerContext}
      database={database}
      createRecord={createRecord}
      updateRecord={updateRecord}
      refresh={refresh}
    />
  )
}

interface ProgramDetailProps {
  summary: ProgramSummary
  partnerName?: string
  partnerContext: ReturnType<typeof resolvePartnerContext>
  database: PrototypeDatabase | null
  createRecord: <K extends PrototypeTableKey>(table: K, data: CreateInput<K>) => PrototypeRecord<K>
  updateRecord: <K extends PrototypeTableKey>(table: K, id: string, updates: UpdateInput<K>) => PrototypeRecord<K> | undefined
  refresh: () => void
}

const CO_PARTNER_INVITE_ROLES = ['co_host', 'sponsor', 'advisor', 'supporter'] as const

const DEFAULT_CO_PARTNER_PERMISSIONS: Record<CoPartnerRole, CoPartnerPermissions> = {
  host: {
    canEditProgram: true,
    canInviteCoordinators: true,
    canViewAllData: true,
    canManageProjects: true,
    canRemoveParticipants: true,
  },
  co_host: {
    canEditProgram: true,
    canInviteCoordinators: true,
    canViewAllData: true,
    canManageProjects: true,
    canRemoveParticipants: false,
  },
  sponsor: {
    canEditProgram: false,
    canInviteCoordinators: false,
    canViewAllData: true,
    canManageProjects: false,
    canRemoveParticipants: false,
  },
  advisor: {
    canEditProgram: false,
    canInviteCoordinators: true,
    canViewAllData: true,
    canManageProjects: false,
    canRemoveParticipants: false,
  },
  supporter: {
    canEditProgram: false,
    canInviteCoordinators: false,
    canViewAllData: true,
    canManageProjects: false,
    canRemoveParticipants: false,
  },
}

const coPartnerInviteSchema = z.object({
  partnerId: z.string().min(1, 'Select a partner organisation'),
  recipientName: z.string().min(2, 'Provide a contact name'),
  recipientEmail: z.string().email('Enter a valid email address'),
  role: z.enum(CO_PARTNER_INVITE_ROLES, {
    errorMap: () => ({ message: 'Select a collaboration role' }),
  }),
  customMessage: z.string().max(600, 'Keep the message under 600 characters').optional(),
})

type CoPartnerInviteFormValues = z.infer<typeof coPartnerInviteSchema>

const getDefaultPermissionsForRole = (role: CoPartnerRole): CoPartnerPermissions =>
  DEFAULT_CO_PARTNER_PERMISSIONS[role] ?? DEFAULT_CO_PARTNER_PERMISSIONS.supporter

const getPartnerIdFromInvitation = (invitation: ProgramInvitation): string | null => {
  if (typeof invitation.metadata !== 'object' || invitation.metadata === null) {
    return null
  }

  const candidate = (invitation.metadata as { partnerId?: unknown }).partnerId
  return typeof candidate === 'string' ? candidate : null
}

const coordinatorInviteSchema = z.object({
  firstName: z.string().min(2, 'Provide a first name'),
  lastName: z.string().min(2, 'Provide a last name'),
  email: z.string().email('Enter a valid email address'),
  country: z.string().min(2, 'Select a country'),
  region: z.string().optional(),
  customMessage: z.string().max(600, 'Keep the message under 600 characters').optional(),
})

type CoordinatorInviteFormValues = z.infer<typeof coordinatorInviteSchema>

const ProgramDetail = ({
  summary,
  partnerName,
  partnerContext,
  database,
  createRecord,
  updateRecord,
  refresh,
}: ProgramDetailProps) => {
  const { program, metrics } = summary
  const statusClass =
    statusStyles[program.status] ?? 'bg-gray-100 text-gray-700 border-gray-200'
  const hostRelationship = summary.coPartners.find(
    ({ relationship }) => relationship.role === 'host',
  )
  const hostName =
    hostRelationship?.partner?.organizationName ?? partnerName ?? 'Host organisation'

  const [isInviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [isSendingInvite, setIsSendingInvite] = useState(false)
  const [updatingCoPartnerInvitationId, setUpdatingCoPartnerInvitationId] = useState<string | null>(null)
  const [isCoordinatorDialogOpen, setCoordinatorDialogOpen] = useState(false)
  const [isSendingCoordinatorInvite, setIsSendingCoordinatorInvite] = useState(false)
  const [updatingCoordinatorInvitationId, setUpdatingCoordinatorInvitationId] = useState<string | null>(null)

  const inviterId = partnerContext.partnerUser?.id ?? 'partner-user-prototype-system'

  const existingPartnerIds = useMemo(() => {
    const ids = new Set<string>()
    ids.add(program.partnerId)
    summary.coPartners.forEach(({ relationship }) => ids.add(relationship.partnerId))
    return ids
  }, [program.partnerId, summary.coPartners])

  const availablePartners = useMemo(() => {
    if (!database) return []
    return database.partners.filter((partner) => !existingPartnerIds.has(partner.id))
  }, [database, existingPartnerIds])

  const inviteForm = useForm<CoPartnerInviteFormValues>({
    resolver: zodResolver(coPartnerInviteSchema),
    defaultValues: {
      partnerId: '',
      recipientName: '',
      recipientEmail: '',
      role: 'co_host',
      customMessage: '',
    },
  })

  const allowedCoordinatorCountries = useMemo(() => {
    const countrySet = new Set(program.countriesInScope)
    const filtered = COUNTRY_OPTIONS.filter((option) => countrySet.has(option.code))
    return filtered.length > 0 ? filtered : COUNTRY_OPTIONS
  }, [program.countriesInScope])

  const coordinatorForm = useForm<CoordinatorInviteFormValues>({
    resolver: zodResolver(coordinatorInviteSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      country: allowedCoordinatorCountries[0]?.code ?? '',
      region: '',
      customMessage: '',
    },
  })

  const selectedPartnerId = inviteForm.watch('partnerId')
  const selectedPartner = useMemo(
    () => availablePartners.find((partner) => partner.id === selectedPartnerId) ?? null,
    [availablePartners, selectedPartnerId],
  )

  useEffect(() => {
    if (!selectedPartner) return
    inviteForm.setValue('recipientName', selectedPartner.organizationName, {
      shouldDirty: false,
    })
    if (selectedPartner.contactEmail) {
      inviteForm.setValue('recipientEmail', selectedPartner.contactEmail, {
        shouldDirty: false,
      })
    }
  }, [inviteForm, selectedPartner])

  useEffect(() => {
    if (!isCoordinatorDialogOpen) return
    coordinatorForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      country: allowedCoordinatorCountries[0]?.code ?? '',
      region: '',
      customMessage: '',
    })
  }, [isCoordinatorDialogOpen, allowedCoordinatorCountries, coordinatorForm])

  const sortedCoPartners = useMemo(
    () =>
      summary.coPartners
        .slice()
        .sort((a, b) => a.relationship.role.localeCompare(b.relationship.role)),
    [summary.coPartners],
  )
  const sortedCoordinators = useMemo(
    () => summary.coordinators.slice().sort((a, b) => a.country.localeCompare(b.country)),
    [summary.coordinators],
  )
  const sortedInstitutions = useMemo(
    () =>
      summary.institutions.slice().sort((a, b) => a.country.localeCompare(b.country)),
    [summary.institutions],
  )
  const sortedActivities = useMemo(
    () =>
      summary.activities
        .slice()
        .sort((a, b) => new Date(b.timestamp).valueOf() - new Date(a.timestamp).valueOf()),
    [summary.activities],
  )
  const coPartnerInvitations = useMemo(
    () => summary.invitations.filter((invitation) => invitation.invitationType === 'co_partner'),
    [summary.invitations],
  )
  const coordinatorInvitations = useMemo(
    () => summary.invitations.filter((invitation) => invitation.invitationType === 'coordinator'),
    [summary.invitations],
  )
  const sortedInvitations = useMemo(
    () =>
      summary.invitations
        .slice()
        .sort((a, b) => new Date(b.sentAt).valueOf() - new Date(a.sentAt).valueOf()),
    [summary.invitations],
  )
  const pendingCoPartnerInvitations = useMemo(
    () => coPartnerInvitations.filter((invitation) => invitation.status === 'pending'),
    [coPartnerInvitations],
  )
  const pendingCoordinatorInvitations = useMemo(
    () => coordinatorInvitations.filter((invitation) => invitation.status === 'pending'),
    [coordinatorInvitations],
  )

  const handleDialogOpenChange = (open: boolean) => {
    setInviteDialogOpen(open)

    if (!open) {
      inviteForm.reset({
        partnerId: '',
        recipientName: '',
        recipientEmail: '',
        role: 'co_host',
        customMessage: '',
      })
      return
    }

    if (availablePartners.length > 0) {
      const [first] = availablePartners
      inviteForm.setValue('partnerId', first.id, { shouldDirty: false })
      inviteForm.setValue('role', 'co_host', { shouldDirty: false })
      inviteForm.setValue('recipientName', first.organizationName, { shouldDirty: false })
      if (first.contactEmail) {
        inviteForm.setValue('recipientEmail', first.contactEmail, { shouldDirty: false })
      }
    }
  }

  const handleCoordinatorDialogOpenChange = (open: boolean) => {
    setCoordinatorDialogOpen(open)

    if (!open) {
      coordinatorForm.reset({
        firstName: '',
        lastName: '',
        email: '',
        country: allowedCoordinatorCountries[0]?.code ?? '',
        region: '',
        customMessage: '',
      })
    }
  }

  const handleSendInvite = inviteForm.handleSubmit((values) => {
    if (!database) return
    const partner = database.partners.find((entry) => entry.id === values.partnerId)
    if (!partner) {
      inviteForm.setError('partnerId', { message: 'Select a valid partner' })
      return
    }

    setIsSendingInvite(true)
    try {
      const now = new Date()
      const nowIso = now.toISOString()
      const expiresAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString()
      const proposedPermissions = getDefaultPermissionsForRole(values.role as CoPartnerRole)
      const token = `c2c_invite_${program.id}_${now.getTime().toString(36)}`

      createRecord('invitations', {
        programId: program.id,
        invitationType: 'co_partner',
        recipientEmail: values.recipientEmail,
        recipientName: values.recipientName,
        sentBy: inviterId,
        sentByType: 'partner',
        customMessage: values.customMessage?.trim() ? values.customMessage.trim() : undefined,
        token,
        expiresAt,
        status: 'pending',
        sentAt: nowIso,
        createdAt: nowIso,
        updatedAt: nowIso,
        proposedRole: values.role as CoPartnerRole,
        proposedPermissions,
        metadata: {
          partnerId: partner.id,
          partnerOrganization: partner.organizationName,
        },
      })

      const existingRelationship = database.programPartners.find(
        (relationship) =>
          relationship.programId === program.id && relationship.partnerId === partner.id,
      )

      if (existingRelationship) {
        updateRecord('programPartners', existingRelationship.id, {
          role: values.role as CoPartnerRole,
          permissions: proposedPermissions,
          invitedBy: inviterId,
          invitedAt: nowIso,
          status: 'invited',
        })
      } else {
        createRecord('programPartners', {
          programId: program.id,
          partnerId: partner.id,
          role: values.role as CoPartnerRole,
          permissions: proposedPermissions,
          invitedBy: inviterId,
          invitedAt: nowIso,
          status: 'invited',
          createdAt: nowIso,
          updatedAt: nowIso,
        })
      }

      refresh()
      handleDialogOpenChange(false)
    } catch (error) {
      console.error('Failed to create co-partner invitation', error)
    } finally {
      setIsSendingInvite(false)
    }
  })

  const handleSendCoordinatorInvite = coordinatorForm.handleSubmit((values) => {
    if (!database) return

    setIsSendingCoordinatorInvite(true)
    try {
      const now = new Date()
      const nowIso = now.toISOString()
      const expiresAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString()
      const token = `c2c_invite_COORD_${program.id}_${now.getTime().toString(36)}`

      const coordinatorRecord = createRecord('coordinators', {
        programId: program.id,
        userId: values.email.toLowerCase(),
        country: values.country,
        region: values.region?.trim() || undefined,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: undefined,
        status: 'invited',
        invitedBy: inviterId,
        invitedAt: nowIso,
        createdAt: nowIso,
        updatedAt: nowIso,
      })

      createRecord('invitations', {
        programId: program.id,
        invitationType: 'coordinator',
        recipientEmail: values.email,
        recipientName: `${values.firstName} ${values.lastName}`.trim(),
        sentBy: inviterId,
        sentByType: 'partner',
        customMessage: values.customMessage?.trim() ? values.customMessage.trim() : undefined,
        token,
        expiresAt,
        status: 'pending',
        sentAt: nowIso,
        createdAt: nowIso,
        updatedAt: nowIso,
        assignedCountry: values.country,
        assignedRegion: values.region?.trim() || undefined,
        metadata: {
          coordinatorId: coordinatorRecord.id,
          country: values.country,
          region: values.region,
          firstName: values.firstName,
          lastName: values.lastName,
        },
      })

      refresh()
      setCoordinatorDialogOpen(false)
      coordinatorForm.reset({
        firstName: '',
        lastName: '',
        email: '',
        country: allowedCoordinatorCountries[0]?.code ?? '',
        region: '',
        customMessage: '',
      })
    } catch (error) {
      console.error('Failed to create coordinator invitation', error)
    } finally {
      setIsSendingCoordinatorInvite(false)
    }
  })

  const handleCoPartnerInvitationStatusChange = (
    invitation: ProgramInvitation,
    nextStatus: 'accepted' | 'declined',
  ) => {
    setUpdatingCoPartnerInvitationId(invitation.id)
    try {
      const nowIso = new Date().toISOString()
      updateRecord('invitations', invitation.id, {
        status: nextStatus,
        respondedAt: nowIso,
        viewedAt: invitation.viewedAt ?? nowIso,
      })

      const partnerId = getPartnerIdFromInvitation(invitation)
      if (!partnerId) {
        refresh()
        return
      }

      const relationship = database?.programPartners.find(
        (entry) => entry.programId === program.id && entry.partnerId === partnerId,
      )

      const role = invitation.proposedRole ?? (relationship?.role ?? 'co_host')
      const permissions =
        invitation.proposedPermissions ?? getDefaultPermissionsForRole(role)

      if (relationship) {
        const updates: UpdateInput<'programPartners'> = {
          role,
          permissions,
          status: nextStatus === 'accepted' ? 'accepted' : 'declined',
        }
        if (nextStatus === 'accepted') {
          updates.acceptedAt = nowIso
        }
        updateRecord('programPartners', relationship.id, updates)
      } else if (nextStatus === 'accepted') {
        createRecord('programPartners', {
          programId: program.id,
          partnerId,
          role,
          permissions,
          invitedBy: inviterId,
          invitedAt: invitation.sentAt,
          status: 'accepted',
          acceptedAt: nowIso,
          createdAt: invitation.sentAt,
          updatedAt: nowIso,
        })
      }

      refresh()
    } catch (error) {
      console.error('Failed to update invitation status', error)
    } finally {
      setUpdatingCoPartnerInvitationId(null)
    }
  }

  const handleCoordinatorInvitationStatusChange = (
    invitation: ProgramInvitation,
    nextStatus: 'accepted' | 'declined',
  ) => {
    setUpdatingCoordinatorInvitationId(invitation.id)
    try {
      const nowIso = new Date().toISOString()
      updateRecord('invitations', invitation.id, {
        status: nextStatus,
        respondedAt: nowIso,
        viewedAt: invitation.viewedAt ?? nowIso,
      })

      const coordinatorId =
        typeof invitation.metadata === 'object' && invitation.metadata
          ? (invitation.metadata as { coordinatorId?: unknown }).coordinatorId
          : undefined

      if (typeof coordinatorId === 'string' && coordinatorId) {
        const coordinatorUpdates: UpdateInput<'coordinators'> = {
          status: nextStatus === 'accepted' ? 'active' : 'inactive',
        }
        if (nextStatus === 'accepted') {
          coordinatorUpdates.acceptedAt = nowIso
        }
        updateRecord('coordinators', coordinatorId, coordinatorUpdates)
      }

      refresh()
    } catch (error) {
      console.error('Failed to update coordinator invitation', error)
    } finally {
      setUpdatingCoordinatorInvitationId(null)
    }
  }

  const canInviteCoPartner = availablePartners.length > 0
  const canInviteCoordinator = allowedCoordinatorCountries.length > 0

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/partner/programs" className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700">
              <ArrowLeft className="h-4 w-4" />
              Back to programs
            </Link>
            <div className="mt-3 flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{program.name}</h1>
              <Badge className={statusClass}>{friendlyLabel(program.status)}</Badge>
            </div>
            <p className="text-gray-600 mt-2 max-w-3xl">{program.description}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href={`/partner/programs/${program.id}/edit`}>
              <Button variant="outline">Edit program</Button>
            </Link>
            <Button className="bg-purple-600 hover:bg-purple-700" disabled>
              <Share2 className="mr-2 h-4 w-4" />
              Invite participants (coming soon)
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Program snapshot</CardTitle>
            <CardDescription>
              Live metrics from the prototype store so stakeholders can test dashboards before the
              production build.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KeyMetric icon={Layers} label="Co-Partners" value={metrics.coPartnerCount} />
              <KeyMetric icon={Users} label="Coordinators" value={metrics.coordinatorCount} />
              <KeyMetric icon={School} label="Institutions" value={metrics.institutionCount} />
              <KeyMetric
                icon={Users}
                label="Teachers"
                value={metrics.teacherCount}
              />
              <KeyMetric
                icon={Users}
                label="Students (est.)"
                value={metrics.studentCount.toLocaleString()}
              />
              <KeyMetric icon={Layers} label="Projects" value={metrics.projectCount} />
              <KeyMetric icon={Flag} label="Active invitations" value={metrics.pendingInvitations} />
              <KeyMetric icon={MapPin} label="Countries" value={metrics.countries.length} />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Program design</CardTitle>
              <CardDescription>
                Configuration the production team will replicate in Supabase during the backend
                build.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4 text-purple-500" />
                  {formatDate(program.startDate)} – {formatDate(program.endDate)}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-purple-500" />
                  Hosted by {hostName}
                </span>
              </div>
              <Separator />
              <DetailGroup title="Learning goals">
                <p className="text-sm text-gray-700 leading-relaxed">{program.learningGoals}</p>
              </DetailGroup>
              <DetailGroup title="Project types">
                <div className="flex flex-wrap gap-2">
                  {program.projectTypes.map((type) => (
                    <Badge key={type} variant="secondary">
                      {friendlyLabel(type)}
                    </Badge>
                  ))}
                </div>
              </DetailGroup>
              <DetailGroup title="Pedagogical frameworks">
                <div className="flex flex-wrap gap-2">
                  {program.pedagogicalFramework.map((framework) => (
                    <Badge key={framework} variant="secondary">
                      {friendlyLabel(framework)}
                    </Badge>
                  ))}
                </div>
              </DetailGroup>
              <DetailGroup title="Target age ranges">
                <div className="flex flex-wrap gap-2">
                  {program.targetAgeRanges.map((range) => (
                    <Badge key={range} variant="outline">
                      {range.replace('-', '–')}
                    </Badge>
                  ))}
                </div>
              </DetailGroup>
              <DetailGroup title="Countries in scope">
                <div className="flex flex-wrap gap-2">
                  {program.countriesInScope.map((country) => (
                    <Badge key={country} variant="outline">
                      {country}
                    </Badge>
                  ))}
                </div>
              </DetailGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prototype notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              <p>
                This page mirrors the production-ready specification in the implementation plan. All
                data is stored in localStorage so stakeholders can test flows without touching
                Supabase.
              </p>
              <p>
                The future engineering team will rebuild these views with real authentication,
                invitation tokens, and analytics once we hand off the prototype.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Co-partners</CardTitle>
              <CardDescription>
                Partner organisations collaborating on this program. Invite flow will be wired next.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sortedCoPartners.length === 0 ? (
                <div className="rounded-lg border border-dashed border-purple-200 bg-purple-50/60 p-4 text-sm text-purple-700">
                  No co-partners yet. The invitation flow prototype will create relationships here.
                </div>
              ) : (
                sortedCoPartners.map(({ relationship, partner }) => (
                  <div
                    key={relationship.id}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {partner?.organizationName ?? 'Partner pending'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Role: {friendlyLabel(relationship.role)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          relationship.status === 'accepted' ? 'default' : 'outline'
                        }
                      >
                        {friendlyLabel(relationship.status)}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-gray-600">
                      Invited {formatDate(relationship.invitedAt)} ·{' '}
                      {relationship.permissions.canInviteCoordinators
                        ? 'Can invite coordinators'
                        : 'Cannot invite coordinators'}
                    </p>
                  </div>
                ))
              )}
              {pendingCoPartnerInvitations.length > 0 && (
                <div className="rounded-lg border border-dashed border-purple-200 bg-purple-50/60 p-4">
                  <p className="text-sm font-medium text-purple-900">Pending invitations</p>
                  <div className="mt-3 space-y-3 text-sm text-purple-800">
                    {pendingCoPartnerInvitations.map((invitation) => (
                      <div key={invitation.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-purple-900">
                            {invitation.recipientName ?? invitation.recipientEmail}
                          </p>
                          <p>
                            Sent {formatDate(invitation.sentAt)} · Role{' '}
                            {friendlyLabel(invitation.proposedRole ?? 'co_host')}
                          </p>
                        </div>
                        <Badge variant="outline">Awaiting response</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Dialog open={isInviteDialogOpen} onOpenChange={handleDialogOpenChange}>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={!canInviteCoPartner}>
                    <Plus className="mr-2 h-4 w-4" />
                    Invite co-partner
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite a co-partner</DialogTitle>
                    <DialogDescription>
                      Send a prototype invitation to an existing partner organisation. The invite is
                      stored locally so upcoming flows can simulate acceptance.
                    </DialogDescription>
                  </DialogHeader>
                  {canInviteCoPartner ? (
                    <Form {...inviteForm}>
                      <form className="space-y-4" onSubmit={handleSendInvite}>
                        <FormField
                          control={inviteForm.control}
                          name="partnerId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Select partner</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choose a partner" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {availablePartners.map((partner) => (
                                    <SelectItem key={partner.id} value={partner.id}>
                                      {partner.organizationName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={inviteForm.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Collaboration role</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {CO_PARTNER_INVITE_ROLES.map((role) => (
                                    <SelectItem key={role} value={role}>
                                      {friendlyLabel(role)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={inviteForm.control}
                          name="recipientName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Recipient name</FormLabel>
                              <FormControl>
                                <Input placeholder="Pat Jensen" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={inviteForm.control}
                          name="recipientEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Recipient email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="pat@example.org" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={inviteForm.control}
                          name="customMessage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Personal message (optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  rows={4}
                                  placeholder="Share context for why you’re inviting this partner."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                          onClick={() => handleDialogOpenChange(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isSendingInvite}>
                            {isSendingInvite ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending…
                              </>
                            ) : (
                              <>
                                <Share2 className="mr-2 h-4 w-4" />
                                Send invite
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  ) : (
                    <div className="rounded-md border border-dashed border-purple-200 bg-purple-50/60 p-4 text-sm text-purple-700">
                      All known partners are already connected to this program. Add more partners to
                      the prototype seeds to invite additional organisations.
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Coordinator coverage</CardTitle>
              <CardDescription>
                Country coordinators linked to this program. Invite regional leads to help onboard
                institutions within their territory.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sortedCoordinators.length === 0 ? (
                <div className="rounded-lg border border-dashed border-purple-200 bg-purple-50/60 p-4 text-sm text-purple-700">
                  No coordinators yet. Use the invitation flow below to assign coverage.
                </div>
              ) : (
                sortedCoordinators.map((coordinator) => (
                  <div
                    key={coordinator.id}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {coordinator.firstName} {coordinator.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {coordinator.email} · {coordinator.country}
                          {coordinator.region ? `, ${coordinator.region}` : ''}
                        </p>
                      </div>
                      <Badge variant={coordinator.status === 'active' ? 'default' : 'outline'}>
                        {friendlyLabel(coordinator.status)}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-gray-600">
                      Invited {formatDate(coordinator.invitedAt)}
                      {coordinator.acceptedAt ? ` · Accepted ${formatDate(coordinator.acceptedAt)}` : ''}
                    </p>
                  </div>
                ))
              )}

              {pendingCoordinatorInvitations.length > 0 && (
                <div className="rounded-lg border border-dashed border-purple-200 bg-purple-50/60 p-4">
                  <p className="text-sm font-medium text-purple-900">Pending coordinator invitations</p>
                  <div className="mt-3 space-y-3 text-sm text-purple-800">
                    {pendingCoordinatorInvitations.map((invitation) => (
                      <div key={invitation.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-purple-900">
                            {invitation.recipientName ?? invitation.recipientEmail}
                          </p>
                          <p>
                            Sent {formatDate(invitation.sentAt)} · Country{' '}
                            {invitation.assignedCountry ?? '—'}
                          </p>
                        </div>
                        <Badge variant="outline">Awaiting response</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Dialog open={isCoordinatorDialogOpen} onOpenChange={handleCoordinatorDialogOpenChange}>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={!canInviteCoordinator}>
                    <Plus className="mr-2 h-4 w-4" />
                    Invite coordinator
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite a country coordinator</DialogTitle>
                    <DialogDescription>
                      Invite a regional lead to manage institutions for this program. The prototype will store the invite locally so you can simulate acceptance.
                    </DialogDescription>
                  </DialogHeader>
                  {canInviteCoordinator ? (
                    <Form {...coordinatorForm}>
                      <form className="space-y-4" onSubmit={handleSendCoordinatorInvite}>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={coordinatorForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First name</FormLabel>
                              <FormControl>
                                <Input placeholder="Jordan" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={coordinatorForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last name</FormLabel>
                              <FormControl>
                                <Input placeholder="Nguyen" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={coordinatorForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="coordinator@example.org" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={coordinatorForm.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {allowedCoordinatorCountries.map((country) => (
                                    <SelectItem key={country.code} value={country.code}>
                                      {country.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={coordinatorForm.control}
                          name="region"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Region / State (optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="California" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={coordinatorForm.control}
                        name="customMessage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Personal message (optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={4}
                                placeholder="Share context for why you’re inviting this coordinator."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleCoordinatorDialogOpenChange(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSendingCoordinatorInvite}>
                          {isSendingCoordinatorInvite ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending…
                            </>
                          ) : (
                            <>
                              <Share2 className="mr-2 h-4 w-4" />
                              Send invite
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                      </form>
                    </Form>
                  ) : (
                    <div className="rounded-md border border-dashed border-purple-200 bg-purple-50/60 p-4 text-sm text-purple-700">
                      Add countries to the program scope to enable coordinator invitations.
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Institutions</CardTitle>
              <CardDescription>
                Schools and learning centres connected through coordinators. Future flows will allow
                editing inside this view.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sortedInstitutions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-purple-200 bg-purple-50/60 p-4 text-sm text-purple-700">
                  No institutions recorded yet. Coordinator flows will populate this list when we
                  wire them up.
                </div>
              ) : (
                sortedInstitutions.map((institution) => (
                  <div
                    key={institution.id}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{institution.name}</p>
                        <p className="text-sm text-gray-500">
                          {institution.city ? `${institution.city}, ` : ''}
                          {institution.country} · Invited {formatDate(institution.invitedAt)}
                        </p>
                      </div>
                      <Badge
                        variant={institution.status === 'active' ? 'default' : 'outline'}
                      >
                        {friendlyLabel(institution.status)}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-gray-600">
                      Students: {institution.studentCount.toLocaleString()}
                      {institution.teacherCount
                        ? ` · Teachers: ${institution.teacherCount.toLocaleString()}`
                        : ''}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invitations</CardTitle>
              <CardDescription>
                Unified invitation records for co-partners, coordinators, institutions, and teachers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sortedInvitations.length === 0 ? (
                <div className="rounded-lg border border-dashed border-purple-200 bg-purple-50/60 p-4 text-sm text-purple-700">
                  No invitations sent yet. The upcoming flows will create entries here from the
                  prototype store.
                </div>
              ) : (
                sortedInvitations.map((invitation) => {
                  const isCoPartnerInvite = invitation.invitationType === 'co_partner'
                  const isCoordinatorInvite = invitation.invitationType === 'coordinator'
                  const isPending = invitation.status === 'pending'
                  const isUpdating = isCoordinatorInvite
                    ? updatingCoordinatorInvitationId === invitation.id
                    : updatingCoPartnerInvitationId === invitation.id

                  return (
                    <div
                      key={invitation.id}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {invitation.recipientName ?? invitation.recipientEmail}
                          </p>
                          <p className="text-sm text-gray-500">
                            {friendlyLabel(invitation.invitationType)} · Sent {formatDate(invitation.sentAt)}
                          </p>
                          {isCoordinatorInvite && (
                            <p className="text-xs text-gray-500">
                              Assigned country: {invitation.assignedCountry ?? '—'}
                              {invitation.assignedRegion ? ` · Region: ${invitation.assignedRegion}` : ''}
                            </p>
                          )}
                          {isCoPartnerInvite && invitation.proposedRole && (
                            <p className="text-xs text-gray-500">
                              Proposed role: {friendlyLabel(invitation.proposedRole)}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant={invitation.status === 'pending' ? 'secondary' : 'outline'}
                        >
                          {friendlyLabel(invitation.status)}
                        </Badge>
                      </div>
                      <p className="mt-3 text-sm text-gray-600">
                        Token: {invitation.token} · Expires {formatDate(invitation.expiresAt)}
                      </p>
                      {isPending && (isCoPartnerInvite || isCoordinatorInvite) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() =>
                              isCoordinatorInvite
                                ? handleCoordinatorInvitationStatusChange(invitation, 'accepted')
                                : handleCoPartnerInvitationStatusChange(invitation, 'accepted')
                            }
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="mr-2 h-4 w-4" />
                            )}
                            Mark accepted
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() =>
                              isCoordinatorInvite
                                ? handleCoordinatorInvitationStatusChange(invitation, 'declined')
                                : handleCoPartnerInvitationStatusChange(invitation, 'declined')
                            }
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <X className="mr-2 h-4 w-4" />
                            )}
                            Mark declined
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              Prototype-only feed that shows how program events will render once Supabase activity
              streams are wired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sortedActivities.length === 0 ? (
              <div className="rounded-lg border border-dashed border-purple-200 bg-purple-50/60 p-4 text-sm text-purple-700">
                Activity will appear here once coordinators, institutions, and teachers interact
                with the program in the prototype.
              </div>
            ) : (
              sortedActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <CheckCircle className="h-5 w-5 text-purple-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-800">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.actorName} · {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const KeyMetric = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  value: number | string
}) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-500">{label}</p>
      <Icon className="h-4 w-4 text-purple-500" />
    </div>
    <p className="mt-2 text-2xl font-semibold text-gray-900">
      {typeof value === 'number' ? value.toLocaleString() : value}
    </p>
  </div>
)

const DetailGroup = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="space-y-2">
    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h4>
    {children}
  </div>
)
