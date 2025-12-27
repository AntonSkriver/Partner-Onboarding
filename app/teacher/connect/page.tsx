'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Search,
  UserPlus,
  Clock,
  Users,
  X,
  Building2,
  Check,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { cn } from '@/lib/utils'

// Tabs for the connections page
const TABS = [
  { id: 'all', label: 'All teachers' },
  { id: 'network', label: 'My network' },
  { id: 'incoming', label: 'Incoming' },
  { id: 'sent', label: 'Sent' },
] as const

type TabId = typeof TABS[number]['id']

// Avatar lookup for known teachers
const TEACHER_AVATARS: Record<string, string> = {
  'Ulla Jensen': '/images/avatars/ulla-new.jpg',
  'Karin Albrectsen': '/images/avatars/karin-new.jpg',
  'Maria Garcia': '/images/avatars/maria-new.jpg',
  'Raj Patel': '/images/avatars/raj-new.jpg',
  'Jonas Madsen': '/images/avatars/jonas-final.jpg',
  'Anne Holm': '/images/avatars/anne-holm.png',
  'Sofie Larsen': '/images/avatars/sofie-larsen.png',
  'Sara Ricci': '/images/avatars/sara-ricci.png',
  'Lucas Souza': '/images/avatars/lucas-souza.png',
  'Peter Andersen': '/images/avatars/peter-andersen.png',
}

// Color palette for initials avatars
const AVATAR_COLORS = [
  'bg-purple-500',
  'bg-cyan-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
]

function getAvatarColor(name: string): string {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0) ?? ''
  const last = lastName?.charAt(0) ?? ''
  return (first + last).toUpperCase() || '?'
}

// Calculate time difference based on country
function getTimeDiff(country: string): string {
  const timezones: Record<string, number> = {
    'DK': 1, 'UK': 0, 'US': -5, 'BR': -3, 'IN': 5.5, 'JP': 9,
    'TZ': 3, 'CO': -5, 'ID': 7, 'TW': 8, 'IQ': 3, 'MX': -6,
    'IT': 1, 'DE': 1, 'FR': 1, 'ES': 1, 'AU': 10,
  }
  const userTz = 1 // Assume user is in DK (CET)
  const teacherTz = timezones[country] ?? 0
  const diff = teacherTz - userTz
  if (diff === 0) return '0 hours from you'
  return diff > 0 ? `+${diff} hours from you` : `${diff} hours from you`
}

// Convert grade level to age range
function getAgeRange(gradeLevel?: string): string {
  const mapping: Record<string, string> = {
    'Primary': '6 - 11 years old',
    'Secondary': '12 - 15 years old',
    'High School': '15 - 18 years old',
    'high_school': '15 - 18 years old',
  }
  return mapping[gradeLevel ?? ''] ?? '12 - 18 years old'
}

export default function TeacherConnectPage() {
  const { ready, database, membershipIds, myInstitutions } = useTeacherContext()

  // Get user's institution IDs to identify colleagues
  const myInstitutionIds = useMemo(() => {
    return new Set(myInstitutions.map(inst => inst.id))
  }, [myInstitutions])
  const [activeTab, setActiveTab] = useState<TabId>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [studentAge, setStudentAge] = useState<string>('any')
  const [timeDiff, setTimeDiff] = useState<string>('any')
  const [language, setLanguage] = useState<string>('english')
  const [country, setCountry] = useState<string>('all')

  // Track sent connection requests (teacher IDs)
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set())

  // Confirmation dialog state
  const [connectDialogOpen, setConnectDialogOpen] = useState(false)
  const [teacherToConnect, setTeacherToConnect] = useState<{
    id: string
    fullName: string
    avatar: string | null
  } | null>(null)

  // Get all teachers from database, excluding current user
  const allTeachers = useMemo(() => {
    if (!database) return []

    return database.institutionTeachers
      .filter((teacher) =>
        teacher.status === 'active' &&
        !membershipIds.has(teacher.id)
      )
      .map((teacher) => {
        const institution = database.institutions.find(
          (inst) => inst.id === teacher.institutionId
        )
        const fullName = `${teacher.firstName} ${teacher.lastName}`.trim()
        // Check if teacher is from a school with same name as user's school
        const userSchoolNames = myInstitutions.map(inst => inst.name)
        const isColleague = institution ? userSchoolNames.includes(institution.name) : false
        return {
          id: teacher.id,
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          fullName,
          country: institution?.country ?? 'US',
          avatar: TEACHER_AVATARS[fullName] || null,
          subject: teacher.subject,
          gradeLevel: teacher.gradeLevel,
          yearsExperience: teacher.yearsExperience,
          language: institution?.languages?.[0] ?? 'en',
          institutionId: teacher.institutionId,
          isColleague,
        }
      })
  }, [database, membershipIds, myInstitutions])

  // Active filters for display
  const activeFilters = useMemo(() => {
    const filters: { key: string; label: string }[] = []
    if (language !== 'any' && language !== 'all') {
      filters.push({ key: 'language', label: language.charAt(0).toUpperCase() + language.slice(1) })
    }
    return filters
  }, [language])

  const removeFilter = (key: string) => {
    if (key === 'language') setLanguage('any')
  }

  const clearAllFilters = () => {
    setLanguage('any')
    setStudentAge('any')
    setTimeDiff('any')
    setCountry('all')
    setSearchTerm('')
  }

  // Filter teachers based on active tab
  const filteredTeachers = useMemo(() => {
    let teachers = [...allTeachers]

    // Filter by tab
    if (activeTab === 'sent') {
      teachers = teachers.filter((t) => sentRequests.has(t.id))
    } else if (activeTab === 'all') {
      // Show all except those with sent requests
      teachers = teachers.filter((t) => !sentRequests.has(t.id))
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      teachers = teachers.filter(
        (t) => t.fullName.toLowerCase().includes(term) ||
               t.subject?.toLowerCase().includes(term)
      )
    }

    if (country !== 'all') {
      teachers = teachers.filter((t) => t.country === country)
    }

    // Sort colleagues first
    return teachers.sort((a, b) => {
      if (a.isColleague && !b.isColleague) return -1
      if (!a.isColleague && b.isColleague) return 1
      return 0
    })
  }, [allTeachers, searchTerm, country, activeTab, sentRequests])

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

  if (!ready) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
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
          <h1 className="text-3xl font-semibold text-gray-900">Teacher Connections</h1>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          <UserPlus className="mr-2 h-4 w-4" />
          Refer a fellow teacher to join
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'pb-3 text-sm font-medium transition-colors border-b-2 -mb-px',
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-5">
          {/* Search */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Search by keyword</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search for name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
          </div>

          {/* Student's age */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Student's age</label>
            <Select value={studentAge} onValueChange={setStudentAge}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Age" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="6-8">6-8 years</SelectItem>
                <SelectItem value="9-11">9-11 years</SelectItem>
                <SelectItem value="12-14">12-14 years</SelectItem>
                <SelectItem value="15-18">15-18 years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time difference */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Time difference</label>
            <Select value={timeDiff} onValueChange={setTimeDiff}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="0-2">0-2 hours</SelectItem>
                <SelectItem value="3-5">3-5 hours</SelectItem>
                <SelectItem value="6+">6+ hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Language */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Language</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="danish">Danish</SelectItem>
                <SelectItem value="portuguese">Portuguese</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Country */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Country</label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                <SelectItem value="DK">Denmark</SelectItem>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="UK">United Kingdom</SelectItem>
                <SelectItem value="BR">Brazil</SelectItem>
                <SelectItem value="IN">India</SelectItem>
                <SelectItem value="MX">Mexico</SelectItem>
                <SelectItem value="IT">Italy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Row */}
        {activeFilters.length > 0 && (
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Filters</span>
              <span className="text-sm text-gray-400">Language</span>
              {activeFilters.map((filter) => (
                <Badge
                  key={filter.key}
                  variant="secondary"
                  className="bg-purple-100 text-purple-700 hover:bg-purple-200 gap-1.5 pl-2.5 pr-1.5 py-1"
                >
                  {filter.label}
                  <button
                    onClick={() => removeFilter(filter.key)}
                    className="rounded-full hover:bg-purple-300 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <button
              onClick={clearAllFilters}
              className="text-sm font-medium text-purple-600 hover:text-purple-700"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900">
          {activeTab === 'sent' ? `Pending requests (${filteredTeachers.length})` : `All teachers (${filteredTeachers.length})`}
        </h2>
      </div>

      {/* Teachers Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {filteredTeachers.map((teacher, index) => {
          const { flag: countryFlag, name: countryName } = getCountryDisplay(teacher.country)
          const initials = getInitials(teacher.firstName, teacher.lastName)
          const avatarColor = getAvatarColor(teacher.fullName)
          const timeDiffStr = getTimeDiff(teacher.country)
          const ageRange = getAgeRange(teacher.gradeLevel)
          const isPending = sentRequests.has(teacher.id)

          return (
            <Card
              key={teacher.id}
              className={cn(
                "overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer",
                teacher.isColleague ? "border-purple-200 ring-1 ring-purple-100" : "border-gray-100"
              )}
            >
              <CardContent className="p-5 relative">
                {/* Pending icon for sent requests */}
                {isPending && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-3 left-3"
                  >
                    <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-purple-100 text-purple-600">
                      <Clock className="h-4 w-4" />
                    </div>
                  </motion.div>
                )}

                {/* Your school badge for colleagues (only show if not pending) */}
                {teacher.isColleague && !isPending && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="absolute top-3 left-3"
                  >
                    <motion.div
                      className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white text-[10px] font-semibold shadow-sm"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Building2 className="h-3 w-3" />
                      <span>Your school</span>
                    </motion.div>
                  </motion.div>
                )}

                {/* Add to network button (only if not pending) */}
                {!isPending && (
                  <button
                    onClick={() => handleConnectClick({ id: teacher.id, fullName: teacher.fullName, avatar: teacher.avatar })}
                    className="absolute top-4 right-4 p-1.5 rounded-lg bg-gray-50 hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                  </button>
                )}

                {/* Avatar */}
                <div className={cn("flex justify-center", (teacher.isColleague || isPending) ? "mb-3 mt-4" : "mb-4")}>
                  {teacher.avatar ? (
                    <div className={cn(
                      "h-20 w-20 overflow-hidden rounded-full ring-2",
                      teacher.isColleague ? "ring-purple-200" : "ring-gray-100"
                    )}>
                      <Image
                        src={teacher.avatar}
                        alt={teacher.fullName}
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className={cn(
                        'flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white ring-2 ring-white shadow-sm',
                        avatarColor
                      )}
                    >
                      {initials}
                    </div>
                  )}
                </div>

                {/* Name */}
                <h3 className="text-center font-semibold text-gray-900 truncate">
                  {teacher.fullName}
                </h3>

                {/* Country */}
                <div className="flex items-center justify-center gap-1.5 mt-1.5">
                  <span className="text-base">{countryFlag}</span>
                  <span className="text-sm text-purple-600 font-medium">{countryName}</span>
                </div>

                {/* Age range */}
                <div className="flex items-center justify-center gap-1.5 mt-3 text-sm text-purple-600">
                  <Users className="h-4 w-4" />
                  <span>{ageRange}</span>
                </div>

                {/* Time difference */}
                <div className="flex items-center justify-center gap-1 mt-1.5 text-xs text-gray-400">
                  <Clock className="h-3 w-3 flex-shrink-0" />
                  <span className="whitespace-nowrap">{timeDiffStr}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredTeachers.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            {activeTab === 'sent' ? (
              <>
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No pending requests</h3>
                <p className="text-sm text-gray-500">Click the + button on a teacher card to send a connection request.</p>
              </>
            ) : (
              <>
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No teachers found</h3>
                <p className="text-sm text-gray-500">Try adjusting your filters or search term.</p>
              </>
            )}
          </CardContent>
        </Card>
      )}

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
