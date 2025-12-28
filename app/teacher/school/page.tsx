'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Building2,
  Users,
  GraduationCap,
  Globe2,
  BookOpen,
  FileText,
  Video,
  Mail,
  UserPlus,
  Check,
  Clock,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useTeacherContext } from '@/hooks/use-teacher-context'
import { getCountryDisplay } from '@/lib/countries'

// Avatar lookup for known teachers
const TEACHER_AVATARS: Record<string, string> = {
  'Jonas Madsen': '/images/avatars/jonas-final.jpg',
  'Sofie Larsen': '/images/avatars/sofie-larsen.png',
  'Peter Andersen': '/images/avatars/peter-andersen.png',
}

// Convert grade level to age range
function getAgeRange(gradeLevel?: string): string {
  const mapping: Record<string, string> = {
    'Primary': '6-11 years old',
    'Secondary': '12-15 years old',
    'High School': '15-18 years old',
    'high_school': '15-18 years old',
  }
  return mapping[gradeLevel ?? ''] ?? '12-18 years old'
}

export default function TeacherSchoolPage() {
  const { ready, myInstitutions, database, membershipIds } = useTeacherContext()

  // Get the first institution (primary school)
  const school = myInstitutions[0]

  // Confirmation dialog state
  const [connectDialogOpen, setConnectDialogOpen] = useState(false)
  const [teacherToConnect, setTeacherToConnect] = useState<{
    id: string
    fullName: string
    avatar: string | null
  } | null>(null)

  // Track sent connection requests
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set())

  // Open confirmation dialog
  const handleConnectClick = (teacher: { id: string; fullName: string; avatar: string | null }) => {
    setTeacherToConnect(teacher)
    setConnectDialogOpen(true)
  }

  // Confirm and send connection request
  const confirmConnect = () => {
    if (teacherToConnect) {
      setSentRequests(prev => new Set([...prev, teacherToConnect.id]))
      toast.custom(() => (
        <div className="flex items-center gap-3 bg-white rounded-lg shadow-lg border-l-4 border-green-500 px-4 py-3 min-w-[350px]">
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-500">
            <Check className="h-4 w-4 text-white" />
          </div>
          <p className="text-sm text-gray-700">
            This teacher will see your request the next time he/she enters the platform
          </p>
        </div>
      ), {
        duration: 4000,
        position: 'top-center',
      })
    }
    setConnectDialogOpen(false)
    setTeacherToConnect(null)
  }

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
        <div className="relative bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 px-6 py-8 text-white overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/5"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.05, 0.1, 0.05],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-white/5"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.05, 0.1, 0.05],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.03, 0.08, 0.03],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Content */}
          <div className="relative">
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 backdrop-blur"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Building2 className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">{school.name}</h2>
                <div className="mt-1 flex items-center gap-2 text-purple-100">
                  <span className="text-lg">{countryFlag}</span>
                  <span>{school.city}, {countryName}</span>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { icon: GraduationCap, value: school.studentCount, label: 'Students' },
                { icon: Users, value: school.teacherCount ?? colleagues.length + 1, label: 'Teachers' },
                { icon: Globe2, value: school.languages?.length ?? 1, label: 'Languages' },
                { icon: Building2, value: school.type?.replace('_', ' '), label: 'Type', isText: true },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="rounded-lg bg-white/10 px-4 py-3 backdrop-blur-sm border border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                  whileHover={{
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    scale: 1.02,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <stat.icon className="h-5 w-5 text-purple-200" />
                    <span className={stat.isText ? "text-lg font-semibold capitalize" : "text-2xl font-bold"}>
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-sm text-purple-200">{stat.label}</p>
                </motion.div>
              ))}
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
              const ageRange = getAgeRange(teacher.gradeLevel)
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
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span>{ageRange}</span>
                    </div>
                    <div className="mt-3">
                      {sentRequests.has(teacher.id) ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-gray-500 border-gray-200 bg-gray-50 cursor-default"
                          disabled
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Request Sent
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-purple-600 border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                          onClick={() => handleConnectClick({ id: teacher.id, fullName, avatar })}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      )}
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

      {/* Confirmation Dialog */}
      <AlertDialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="text-center sm:text-center">
            {teacherToConnect?.avatar && (
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 overflow-hidden rounded-full ring-2 ring-purple-100">
                  <Image
                    src={teacherToConnect.avatar}
                    alt={teacherToConnect.fullName}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}
            <AlertDialogTitle>Connect with {teacherToConnect?.fullName}?</AlertDialogTitle>
            <AlertDialogDescription>
              Send a connection request to collaborate on projects and share resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3">
            <AlertDialogCancel className="sm:w-32">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmConnect}
              className="sm:w-32 bg-purple-600 hover:bg-purple-700"
            >
              Connect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
