'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  School,
  Layers,
  BookOpen,
  BarChart3,
  Users,
  FolderKanban,
  Globe,
} from 'lucide-react'
import { getCurrentSession } from '@/lib/auth/session'

interface SchoolProfile {
  id: string
  name: string
  type: string
  location: string
  city: string
  country: string
  studentCount: number
  teacherCount: number
}

export default function SchoolDashboardHomePage() {
  const [school, setSchool] = useState<SchoolProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    loadSchoolProfile()
    setSession(getCurrentSession())
  }, [])

  const loadSchoolProfile = async () => {
    setLoading(true)
    try {
      const currentSession = getCurrentSession()
      if (!currentSession || currentSession.role !== 'teacher') {
        return
      }

      // For demo purposes - sample school data
      const sampleSchool: SchoolProfile = {
        id: 'school-orestad-gymnasium',
        name: 'Ørestad Gymnasium',
        type: 'High School',
        location: 'Copenhagen, Denmark',
        city: 'Copenhagen',
        country: 'Denmark',
        studentCount: 800,
        teacherCount: 65,
      }

      setSchool(sampleSchool)
    } catch (err) {
      console.error('Error loading school profile:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
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

  if (!school) {
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <School className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h2 className="mb-2 text-lg font-semibold text-gray-900">No School Profile</h2>
          <p className="text-gray-600">Please create a school profile to get started.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-gray-900">
            Hi, {school.name}
          </h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-600" />
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">2</p>
                <p className="text-xs text-gray-600">Programs</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">{school.teacherCount}</p>
                <p className="text-xs text-gray-600">Teachers</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-purple-600" />
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">4</p>
                <p className="text-xs text-gray-600">Projects</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Your Global Learning Hub</h2>
          <p className="text-sm text-gray-600">
            Everything you need for global classroom collaboration.
          </p>
        </div>

        {/* Grid of Navigation Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Overview Card */}
          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <School className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Overview</h3>
                <p className="text-sm text-gray-600">
                  View your school profile and key information.
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
                  <Link href="/school/dashboard/overview">View</Link>
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
                <h3 className="text-lg font-semibold text-gray-900">Programs</h3>
                <p className="text-sm text-gray-600">
                  Join partner programs and collaborative projects.
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
                  <Link href="/school/dashboard/programs">Explore</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Projects Card */}
          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <FolderKanban className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
                <p className="text-sm text-gray-600">
                  Manage classroom projects across all programs.
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
                  <Link href="/school/dashboard/projects">View</Link>
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
                  Access teaching materials and program resources.
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
                  <Link href="/school/dashboard/resources">Browse</Link>
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
                  Manage teachers and partner schools.
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
                  <Link href="/school/dashboard/network">Manage</Link>
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
                  Track program performance and impact.
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
                  <Link href="/school/dashboard/analytics">View metrics</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
