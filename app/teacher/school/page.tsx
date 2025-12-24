'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Building2,
  Users,
  GraduationCap,
  Globe2,
  BookOpen,
  FileText,
  Video,
  ExternalLink,
  Mail,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useTeacherContext } from '@/hooks/use-teacher-context'
import { getCountryDisplay } from '@/lib/countries'

// Avatar lookup for known teachers
const TEACHER_AVATARS: Record<string, string> = {
  'Jonas Madsen': '/images/avatars/jonas-final.jpg',
  'Sofie Larsen': '/images/avatars/sofie-larsen.png',
  'Peter Andersen': '/images/avatars/peter-andersen.png',
}

export default function TeacherSchoolPage() {
  const { ready, myInstitutions, database, membershipIds, session } = useTeacherContext()

  // Get the first institution (primary school)
  const school = myInstitutions[0]

  // Find colleagues at the same school (matching by school name to include teachers across programs)
  const colleagues = useMemo(() => {
    if (!database || !school) return []

    // Get all institution IDs with the same school name
    const sameSchoolInstIds = new Set(
      database.institutions
        .filter(inst => inst.name === school.name)
        .map(inst => inst.id)
    )

    return database.institutionTeachers
      .filter(
        (teacher) =>
          sameSchoolInstIds.has(teacher.institutionId) &&
          !membershipIds.has(teacher.id) && // Exclude current user
          teacher.status === 'active'
      )
      // Deduplicate by email (same teacher in multiple programs)
      .filter((teacher, index, self) =>
        index === self.findIndex(t => t.email === teacher.email)
      )
      .slice(0, 6) // Show max 6 colleagues
  }, [database, school, membershipIds])

  const { flag: countryFlag, name: countryName } = getCountryDisplay(school?.country ?? '')

  if (!ready) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!school) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">No School Connected</h2>
          <p className="mt-2 text-sm text-gray-600">
            You are not currently connected to any school. Contact your school administrator to get an invitation.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="w-fit justify-start px-0 text-purple-600 hover:text-purple-700"
        >
          <Link href="/teacher/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">My School</h1>
        </div>
      </div>

      {/* School Profile Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{school.name}</h2>
                <div className="mt-1 flex items-center gap-2 text-purple-100">
                  <span className="text-lg">{countryFlag}</span>
                  <span>{school.city}, {countryName}</span>
                </div>
              </div>
            </div>
            <Button variant="secondary" size="sm" className="bg-white/20 text-white hover:bg-white/30" asChild>
              <Link href="/school/dashboard/home">
                <ExternalLink className="mr-2 h-4 w-4" />
                School Dashboard
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-white/10 px-4 py-3 backdrop-blur">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-purple-200" />
                <span className="text-2xl font-bold">{school.studentCount}</span>
              </div>
              <p className="text-sm text-purple-200">Students</p>
            </div>
            <div className="rounded-lg bg-white/10 px-4 py-3 backdrop-blur">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-200" />
                <span className="text-2xl font-bold">{school.teacherCount ?? colleagues.length + 1}</span>
              </div>
              <p className="text-sm text-purple-200">Teachers</p>
            </div>
            <div className="rounded-lg bg-white/10 px-4 py-3 backdrop-blur">
              <div className="flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-purple-200" />
                <span className="text-2xl font-bold">{school.languages?.length ?? 1}</span>
              </div>
              <p className="text-sm text-purple-200">Languages</p>
            </div>
            <div className="rounded-lg bg-white/10 px-4 py-3 backdrop-blur">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-200" />
                <span className="text-lg font-semibold capitalize">{school.type?.replace('_', ' ')}</span>
              </div>
              <p className="text-sm text-purple-200">Type</p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <CardContent className="border-t bg-gray-50 p-4">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            {school.contactEmail && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <a href={`mailto:${school.contactEmail}`} className="hover:text-purple-600">
                  {school.contactEmail}
                </a>
              </div>
            )}
            {school.principalName && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Principal:</span>
                <span className="font-medium text-gray-900">{school.principalName}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Colleagues Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Your Colleagues</h2>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            {colleagues.length} teachers
          </Badge>
        </div>

        {colleagues.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center text-sm text-gray-600">
              No other teachers from your school are active in programs yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {colleagues.map((teacher) => {
              const fullName = `${teacher.firstName} ${teacher.lastName}`
              const avatar = TEACHER_AVATARS[fullName]
              return (
                <Card key={teacher.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {avatar ? (
                        <div className="h-12 w-12 overflow-hidden rounded-full">
                          <Image
                            src={avatar}
                            alt={fullName}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-lg font-semibold text-purple-700">
                          {teacher.firstName?.charAt(0)}{teacher.lastName?.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {fullName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{teacher.subject}</p>
                        <p className="text-xs text-gray-400">{teacher.yearsExperience} years experience</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {teacher.gradeLevel}
                      </Badge>
                      <Button variant="ghost" size="sm" className="ml-auto text-purple-600 hover:text-purple-700">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Resources Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">School Resources</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="mt-3 font-semibold text-gray-900">Teaching Materials</h3>
              <p className="mt-1 text-sm text-gray-600">Access shared lesson plans and curriculum resources.</p>
            </CardContent>
          </Card>

          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="mt-3 font-semibold text-gray-900">School Policies</h3>
              <p className="mt-1 text-sm text-gray-600">Review guidelines for global collaboration projects.</p>
            </CardContent>
          </Card>

          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Video className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="mt-3 font-semibold text-gray-900">Training Videos</h3>
              <p className="mt-1 text-sm text-gray-600">Watch tutorials on using Class2Class effectively.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
