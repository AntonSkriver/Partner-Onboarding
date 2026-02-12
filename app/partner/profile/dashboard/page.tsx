'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Building2,
  Layers,
  BookOpen,
  BarChart3,
  Users,
  Mail,
  Globe,
  GraduationCap,
  School,
  MapPin,
} from 'lucide-react'
import { getCurrentSession } from '@/lib/auth/session'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import {
  buildProgramSummariesForPartner,
  type ProgramSummary,
} from '@/lib/programs/selectors'

export default function PartnerDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<ReturnType<typeof getCurrentSession>>(null)
  const { ready: prototypeReady, database } = usePrototypeDb()

  useEffect(() => {
    const s = getCurrentSession()
    setSession(s)
    setLoading(false)
  }, [])

  const normalizedOrganizationName = session?.organization
    ? session.organization.trim().toLowerCase()
    : null

  const partnerRecord = useMemo(() => {
    if (!database) return null
    if (normalizedOrganizationName) {
      const match = database.partners.find(
        (partner) => partner.organizationName.toLowerCase() === normalizedOrganizationName,
      )
      if (match) return match
    }
    return database.partners.length > 0 ? database.partners[0] : null
  }, [database, normalizedOrganizationName])

  const programSummaries = useMemo<ProgramSummary[]>(() => {
    if (!prototypeReady || !database || !partnerRecord) return []
    return buildProgramSummariesForPartner(database, partnerRecord.id, {
      includeRelatedPrograms: true,
    })
  }, [prototypeReady, database, partnerRecord])

  const stats = useMemo(() => {
    const uniqueSchools = new Set<string>()
    const uniqueCountries = new Set<string>()
    let totalStudents = 0
    let totalEducators = 0

    programSummaries.forEach((summary) => {
      summary.institutions.forEach((inst) => {
        const name = inst.name?.trim()
        if (name) uniqueSchools.add(name.toLowerCase())
        if (inst.country) uniqueCountries.add(inst.country)
        totalStudents += inst.activeStudentCount || 0
      })
      summary.teachers.forEach((t) => {
        if (t.status === 'active') totalEducators++
      })
    })

    return {
      programs: programSummaries.length,
      schools: uniqueSchools.size,
      countries: uniqueCountries.size,
      students: totalStudents,
      educators: totalEducators,
    }
  }, [programSummaries])

  if (loading || !prototypeReady) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!partnerRecord) {
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <Building2 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h2 className="mb-2 text-lg font-semibold text-gray-900">No Organization Profile</h2>
          <p className="text-gray-600">Please create an organization profile to get started.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Hi, {partnerRecord.organizationName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {partnerRecord.mission}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-xl border border-gray-100 bg-white p-4 text-center">
            <Layers className="mx-auto mb-1 h-5 w-5 text-purple-500" />
            <p className="text-2xl font-bold text-gray-900">{stats.programs}</p>
            <p className="text-xs text-gray-500">Programs</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 text-center">
            <School className="mx-auto mb-1 h-5 w-5 text-blue-500" />
            <p className="text-2xl font-bold text-gray-900">{stats.schools}</p>
            <p className="text-xs text-gray-500">Schools</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 text-center">
            <GraduationCap className="mx-auto mb-1 h-5 w-5 text-green-500" />
            <p className="text-2xl font-bold text-gray-900">{stats.educators}</p>
            <p className="text-xs text-gray-500">Educators</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 text-center">
            <Users className="mx-auto mb-1 h-5 w-5 text-amber-500" />
            <p className="text-2xl font-bold text-gray-900">{stats.students.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Students</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 text-center">
            <MapPin className="mx-auto mb-1 h-5 w-5 text-rose-500" />
            <p className="text-2xl font-bold text-gray-900">{stats.countries}</p>
            <p className="text-xs text-gray-500">Countries</p>
          </div>
        </div>

        {/* About Card */}
        <Card className="border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-gray-900">About</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{partnerRecord.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    {partnerRecord.organizationType === 'ngo' ? 'NGO' : partnerRecord.organizationType}
                  </Badge>
                  {partnerRecord.country && (
                    <Badge variant="outline" className="text-xs">
                      <Globe className="mr-1 h-3 w-3" />
                      {partnerRecord.country}
                    </Badge>
                  )}
                  {partnerRecord.languages?.map((lang) => (
                    <Badge key={lang} variant="outline" className="text-xs">
                      {lang.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Your Global Learning Hub</h2>
          <p className="text-sm text-gray-600">
            Everything you need for global classroom partnerships.
          </p>
        </div>

        {/* Grid of Navigation Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Overview Card */}
          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Overview</h3>
                <p className="text-sm text-gray-600">
                  View your organization profile and key information.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="px-0 text-sm text-purple-600 hover:text-purple-700">
                  Learn More
                </Button>
                <Button
                  className="bg-purple-600 text-white hover:bg-purple-700"
                  size="sm"
                  asChild
                >
                  <Link href="/partner/profile/overview">View</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Programs Card */}
          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Layers className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">My Programs</h3>
                <p className="text-sm text-gray-600">
                  {stats.programs > 0
                    ? `${stats.programs} active program${stats.programs > 1 ? 's' : ''} across ${stats.countries} ${stats.countries === 1 ? 'country' : 'countries'}.`
                    : 'Create and manage your global education programs.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="px-0 text-sm text-purple-600 hover:text-purple-700">
                  Learn More
                </Button>
                <Button
                  className="bg-purple-600 text-white hover:bg-purple-700"
                  size="sm"
                  asChild
                >
                  <Link href="/partner/profile/programs">Go to programs</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resources Card */}
          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Resources</h3>
                <p className="text-sm text-gray-600">
                  Manage educational resources and teaching materials.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="px-0 text-sm text-purple-600 hover:text-purple-700">
                  Learn More
                </Button>
                <Button
                  className="bg-purple-600 text-white hover:bg-purple-700"
                  size="sm"
                  asChild
                >
                  <Link href="/partner/profile/resources">Explore</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analytics Card */}
          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                <p className="text-sm text-gray-600">
                  Track your program performance and global reach.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="px-0 text-sm text-purple-600 hover:text-purple-700">
                  Learn More
                </Button>
                <Button
                  className="bg-purple-600 text-white hover:bg-purple-700"
                  size="sm"
                  asChild
                >
                  <Link href="/partner/profile/analytics">View metrics</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Network Card */}
          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Network</h3>
                <p className="text-sm text-gray-600">
                  Manage coordinators and educational institutions.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="px-0 text-sm text-purple-600 hover:text-purple-700">
                  Learn More
                </Button>
                <Button
                  className="bg-purple-600 text-white hover:bg-purple-700"
                  size="sm"
                  asChild
                >
                  <Link href="/partner/profile/network">Manage</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contact Card */}
          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                <p className="text-sm text-gray-600">
                  {partnerRecord.contactEmail}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="px-0 text-sm text-purple-600 hover:text-purple-700">
                  Learn More
                </Button>
                <Button
                  className="bg-purple-600 text-white hover:bg-purple-700"
                  size="sm"
                  asChild
                >
                  <Link href="/partner/profile/overview">View</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
