'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { CalendarDays, Flag, Globe2, Trash2, Users, Search, School, Layers, type LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { ProgramCatalogCard } from '@/components/program/program-catalog-card'

import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { getCurrentSession } from '@/lib/auth/session'
import { resolvePartnerContext } from '@/lib/auth/partner-context'
import {
  buildProgramSummariesForPartner,
  buildProgramCatalog,
  cascadeDeleteProgram,
  type ProgramSummary,
  type ProgramCatalogItem,
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
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

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

  const allProgramSummaries = useMemo(() => {
    if (!database || !partnerId) return []
    return buildProgramSummariesForPartner(database, partnerId, {
      includeRelatedPrograms: true,
    })
  }, [database, partnerId])

  const programSummaries = useMemo(() => {
    let filtered = allProgramSummaries

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((summary) => summary.program.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((summary) =>
        summary.program.displayTitle?.toLowerCase().includes(query) ||
        summary.program.name.toLowerCase().includes(query) ||
        summary.program.description.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [allProgramSummaries, statusFilter, searchQuery])

  const catalogByProgramId = useMemo(() => {
    if (!database) return new Map<string, ProgramCatalogItem>()
    const entries = buildProgramCatalog(database, { includePrivate: true }).map((item) => [
      item.programId,
      item,
    ] as const)
    return new Map(entries)
  }, [database])

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

        {allProgramSummaries.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search programs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={statusFilter === 'active' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('active')}
                  >
                    Active
                  </Button>
                  <Button
                    variant={statusFilter === 'draft' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('draft')}
                  >
                    Draft
                  </Button>
                  <Button
                    variant={statusFilter === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('completed')}
                  >
                    Completed
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                catalogItem={catalogByProgramId.get(summary.program.id)}
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
  catalogItem?: ProgramCatalogItem
  onDelete: (programId: string) => void
  deletingProgramId: string | null
}

const ProgramCard = ({ summary, catalogItem, onDelete, deletingProgramId }: ProgramCardProps) => {
  const { program, metrics } = summary
  const hostPartner = summary.coPartners.find(
    ({ relationship }) => relationship.role === 'host',
  )?.partner
  const supportingPartner = program.supportingPartnerId
    ? summary.coPartners.find(
        ({ relationship }) => relationship.partnerId === program.supportingPartnerId,
      )?.partner
    : undefined
  const marketingCopy = program.marketingTagline ?? program.description

  const statusClass =
    statusStyles[program.status] ?? 'bg-gray-100 text-gray-700 border-gray-200'

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4">
          {program.logo && (
            <div className="flex-shrink-0">
              <Image
                src={program.logo}
                alt={program.displayTitle ?? program.name}
                width={80}
                height={80}
                className="h-16 w-auto object-contain rounded-lg border border-gray-200 bg-white p-2"
              />
            </div>
          )}
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-2xl">{program.displayTitle ?? program.name}</CardTitle>
              <Badge className={statusClass}>{friendly(program.status)}</Badge>
            </div>
            {program.displayTitle && program.displayTitle !== program.name && (
              <p className="text-sm text-gray-500">{program.name}</p>
            )}
            <CardDescription className="text-base text-gray-700">{marketingCopy}</CardDescription>
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
            {supportingPartner && (
              <span className="flex items-center gap-1">
                <Globe2 className="h-4 w-4 text-purple-500" />
                {program.supportingPartnerRole === 'sponsor' ? 'Sponsored by' : 'Co-hosted with'}{' '}
                {supportingPartner.organizationName}
              </span>
            )}
            {catalogItem?.startMonthLabel && (
              <span className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4 text-purple-500" />
                Teacher launch: {catalogItem.startMonthLabel}
              </span>
            )}
          </div>
        </div>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Link href={`/partner/programs/${program.id}`}>
            <Button variant="outline">View details</Button>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Metric label="Institutions" value={metrics.institutionCount} icon={School} />
          <Metric label="Teachers" value={metrics.teacherCount} icon={Users} />
          <Metric label="Students (est.)" value={metrics.studentCount.toLocaleString()} icon={Users} />
          <Metric label="Countries" value={metrics.countries.length} icon={Globe2} />
          <Metric label="Active projects" value={metrics.activeProjectCount} icon={Layers} />
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

const Metric = ({ label, value, icon: Icon }: { label: string; value: number | string; icon?: LucideIcon }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow">
    <div className="flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4 text-purple-500" />}
      <p className="text-xs font-medium uppercase tracking-wide text-gray-600">{label}</p>
    </div>
    <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
  </div>
)
