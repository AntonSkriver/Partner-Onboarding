'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CalendarDays,
  Flag,
  Globe2,
  Layers,
  Mail,
  MapPin,
  School,
  Trash2,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { getCurrentSession } from '@/lib/auth/session'
import { resolvePartnerContext } from '@/lib/auth/partner-context'
import {
  aggregateProgramMetrics,
  buildProgramSummariesForPartner,
  cascadeDeleteProgram,
  type ProgramSummary,
} from '@/lib/programs/selectors'

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

const statusStyles: Record<string, string> = {
  draft: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  active: 'bg-green-50 text-green-700 border-green-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  archived: 'bg-gray-100 text-gray-600 border-gray-200',
}

const friendly = (value: string) =>
  value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')

export default function ProgramsIndexPage() {
  const router = useRouter()
  const [session, setSession] = useState(() => getCurrentSession())
  const [deletingProgramId, setDeletingProgramId] = useState<string | null>(null)

  const { ready: dataReady, database, deleteRecord } = usePrototypeDb()

  useEffect(() => {
    setSession(getCurrentSession())
  }, [])

  useEffect(() => {
    if (!session || session.role !== 'partner') {
      router.push('/partner/login')
    }
  }, [router, session])

  const { partnerId, partnerRecord } = useMemo(
    () => resolvePartnerContext(session, database ?? null),
    [database, session],
  )

  const programSummaries = useMemo(() => {
    if (!database || !partnerId) return []
    return buildProgramSummariesForPartner(database, partnerId, {
      includeRelatedPrograms: true,
    })
  }, [database, partnerId])

  const metrics = useMemo(
    () => aggregateProgramMetrics(programSummaries),
    [programSummaries],
  )

  const handleDeleteProgram = (programId: string) => {
    if (!database) return
    const program = programSummaries.find((summary) => summary.program.id === programId)
    const programName = program?.program.name ?? 'this program'

    const confirmed = window.confirm(
      `Delete ${programName}? This will remove all associated coordinators, institutions, teachers, invitations, and activity history from the prototype store.`,
    )

    if (!confirmed) return

    setDeletingProgramId(programId)
    try {
      cascadeDeleteProgram(database, programId, deleteRecord)
    } finally {
      setDeletingProgramId(null)
    }
  }

  if (!session || !dataReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3 text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto" />
          <p>Loading partner program data…</p>
        </div>
      </div>
    )
  }

  const keyMetrics = [
    { id: 'programs', label: 'Programs', value: metrics.totalPrograms, icon: Layers },
    { id: 'active-programs', label: 'Active Programs', value: metrics.activePrograms, icon: Flag },
    { id: 'co-partners', label: 'Co-Partners', value: metrics.coPartners, icon: Users },
    { id: 'coordinators', label: 'Coordinators', value: metrics.coordinators, icon: MapPin },
    { id: 'institutions', label: 'Institutions', value: metrics.institutions, icon: School },
    { id: 'teachers', label: 'Teachers', value: metrics.teachers, icon: Users },
    { id: 'students', label: 'Students (est.)', value: metrics.students, icon: Users },
    { id: 'countries', label: 'Countries', value: metrics.countryCount, icon: Globe2 },
    {
      id: 'pending-invitations',
      label: 'Pending Invitations',
      value: metrics.pendingInvitations,
      icon: Mail,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
              {partnerRecord?.organizationName ?? 'Partner'} Programs
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">Program Portfolio</h1>
            <p className="text-gray-600 mt-2 max-w-2xl">
              Review the collaborations you&apos;re hosting or co-managing in the prototype. Each
              program pulls live data from the localStorage prototype store so teams can test
              end-to-end flows before the production build.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/partner/programs/create">
              <Button className="bg-purple-600 hover:bg-purple-700">Create program</Button>
            </Link>
            <Link href="/partner/profile?tab=programs">
              <Button variant="outline">Back to dashboard</Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Program Metrics</CardTitle>
            <CardDescription>
              Snapshot of your program ecosystem across coordinators, institutions, and partner
              invitations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {keyMetrics.map((metric) => {
                const Icon = metric.icon
                return (
                  <div
                    key={metric.id}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">{metric.label}</p>
                      <Icon className="h-4 w-4 text-purple-500" />
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                      {typeof metric.value === 'number'
                        ? metric.value.toLocaleString()
                        : metric.value}
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {programSummaries.length === 0 ? (
          <Card className="border-dashed border-purple-200 bg-purple-50/60">
            <CardHeader className="text-center space-y-3">
              <CardTitle className="text-xl text-purple-900">No programs yet</CardTitle>
              <CardDescription className="text-purple-700">
                Use the builder to create your first program. The prototype will seed the local data
                store so dashboards, invitations, and upcoming coordinator flows have something to
                reference.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Link href="/partner/programs/create">
                <Button className="bg-purple-600 hover:bg-purple-700">Launch program builder</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {programSummaries.map((summary) => (
              <ProgramCard
                key={summary.program.id}
                summary={summary}
                onDelete={handleDeleteProgram}
                deletingProgramId={deletingProgramId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface ProgramCardProps {
  summary: ProgramSummary
  onDelete: (programId: string) => void
  deletingProgramId: string | null
}

const ProgramCard = ({ summary, onDelete, deletingProgramId }: ProgramCardProps) => {
  const { program, metrics } = summary
  const hostPartner = summary.coPartners.find(
    ({ relationship }) => relationship.role === 'host',
  )?.partner

  const statusClass =
    statusStyles[program.status] ?? 'bg-gray-100 text-gray-700 border-gray-200'

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-2xl">{program.name}</CardTitle>
            <Badge className={statusClass}>{friendly(program.status)}</Badge>
          </div>
          <CardDescription className="text-base text-gray-700">
            {program.description}
          </CardDescription>
          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4 text-purple-500" />
              {formatDate(program.startDate)} – {formatDate(program.endDate)}
            </span>
            <span className="flex items-center gap-1">
              <Flag className="h-4 w-4 text-purple-500" />
              Status: {friendly(program.status)}
            </span>
            {hostPartner && (
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4 text-purple-500" />
                Hosted by {hostPartner.organizationName}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Link href={`/partner/programs/${program.id}`}>
            <Button variant="outline">View program</Button>
          </Link>
          <Link href={`/partner/programs/${program.id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <Button
            variant="destructive"
            onClick={() => onDelete(program.id)}
            disabled={deletingProgramId === program.id}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {deletingProgramId === program.id ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Co-Partners" value={metrics.coPartnerCount} />
          <Metric label="Coordinators" value={metrics.coordinatorCount} />
          <Metric label="Institutions" value={metrics.institutionCount} />
          <Metric label="Teachers" value={metrics.teacherCount} />
          <Metric label="Students (est.)" value={metrics.studentCount.toLocaleString()} />
          <Metric label="Projects" value={metrics.projectCount} />
          <Metric label="Pending invitations" value={metrics.pendingInvitations} />
          <Metric label="Countries" value={metrics.countries.length} />
        </div>

        <Separator />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Pedagogical frameworks
            </h4>
            <div className="flex flex-wrap gap-2">
              {program.pedagogicalFramework.map((framework) => (
                <Badge key={framework} variant="secondary">
                  {friendly(framework)}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Target age ranges
            </h4>
            <div className="flex flex-wrap gap-2">
              {program.targetAgeRanges.map((range) => (
                <Badge key={range} variant="secondary">
                  {range.replace('-', '–')}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Countries in scope
          </h4>
          <div className="flex flex-wrap gap-2">
            {program.countriesInScope.map((country) => (
              <Badge key={country} variant="outline">
                {country}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const Metric = ({ label, value }: { label: string; value: number | string }) => (
  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
    <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-2 text-xl font-semibold text-gray-900">{value}</p>
  </div>
)
